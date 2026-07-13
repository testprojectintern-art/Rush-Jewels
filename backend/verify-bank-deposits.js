import mongoose from 'mongoose';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import BankAccount from './src/models/BankAccount.js';
import User from './src/models/User.js';
import PosSession from './src/models/PosSession.js';
import BankDeposit from './src/models/BankDeposit.js';

dotenv.config();

const PORT = 5005;
const BASE_URL = `http://localhost:${PORT}/api`;

async function test() {
    console.log("Connecting directly to MongoDB for Bank Deposit Integration Check...");
    await mongoose.connect(process.env.MONGO_URI);

    // 1. Generate Token
    console.log("\nGenerating JWT token for admin user...");
    const admin = await User.findOne({ email: 'admin@admin.com' });
    if (!admin) {
        throw new Error("Admin user not found in database.");
    }
    const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
    const headers = {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
    };

    // 2. Setup seed bank account
    console.log("Creating test bank account...");
    const bankAccount = new BankAccount({
        accountName: "Tally Test Bank Account",
        accountNumber: `ACC-TALLY-${Math.floor(Math.random() * 1000000)}`,
        bankName: "Tally Test Bank",
        category: "received",
        currentBalance: 1000,
        isActive: true
    });
    await bankAccount.save();

    // 3. Setup seed open POS session (Cash Register)
    console.log("Creating test open POS Register session...");
    // Make sure we delete any open sessions for this admin first
    await PosSession.deleteMany({ userId: admin._id, status: 'open' });

    const posSession = new PosSession({
        userId: admin._id,
        openingBalance: 500,
        cashSales: 1500,
        cashExpenses: 100,
        bankDeposits: 0,
        status: 'open'
    });
    await posSession.save();

    const initialCashInDrawer = (posSession.openingBalance + posSession.cashSales - posSession.cashExpenses);
    console.log(`- Bank Account Initial Balance: ${bankAccount.currentBalance} LKR`);
    console.log(`- Cash Register Drawer Initial Cash: ${initialCashInDrawer} LKR`);

    // Test 1: Record Bank Deposit via API
    console.log("\n--- TEST 1: Recording Bank Deposit of 400 LKR via API ---");
    const depositPayload = {
        bankAccountId: bankAccount._id.toString(),
        amount: 400,
        reference: "DEP-TALLY-TEST-REF",
        notes: "Test mid-day bank deposit tally"
    };

    const depositRes = await fetch(`${BASE_URL}/bank-deposits`, {
        method: "POST",
        headers,
        body: JSON.stringify(depositPayload)
    });

    if (!depositRes.ok) {
        throw new Error(`Bank Deposit API call failed: ${await depositRes.text()}`);
    }

    const depositData = await depositRes.json();
    console.log("Bank deposit recorded successfully! Deposit Number:", depositData.data.depositNumber);
    const depositId = depositData.data._id;

    // Check direct DB updates for BankAccount
    const updatedBankAccount = await BankAccount.findById(bankAccount._id);
    console.log(`- Bank Account Balance after deposit: ${updatedBankAccount.currentBalance} LKR (Expected: 1400)`);
    if (updatedBankAccount.currentBalance !== 1400) {
        throw new Error(`Bank Account Balance mismatch. Expected 1400, got ${updatedBankAccount.currentBalance}`);
    }

    // Check direct DB updates for PosSession
    const updatedPosSession = await PosSession.findById(posSession._id);
    const cashInDrawerAfter = (updatedPosSession.openingBalance + updatedPosSession.cashSales - updatedPosSession.cashExpenses - updatedPosSession.bankDeposits);
    console.log(`- Cash Register bankDeposits field: ${updatedPosSession.bankDeposits} LKR (Expected: 400)`);
    console.log(`- Cash Register Drawer Cash after deposit: ${cashInDrawerAfter} LKR (Expected: 1500)`);
    
    if (updatedPosSession.bankDeposits !== 400) {
        throw new Error(`POS Session bankDeposits mismatch. Expected 400, got ${updatedPosSession.bankDeposits}`);
    }
    if (cashInDrawerAfter !== 1500) {
        throw new Error(`POS Session drawer balance mismatch. Expected 1500, got ${cashInDrawerAfter}`);
    }
    console.log("✓ Bank Deposit API successfully updated both balances!");

    // Test 2: Reverse/Delete Bank Deposit via API
    console.log("\n--- TEST 2: Reversing Bank Deposit via API ---");
    const reverseRes = await fetch(`${BASE_URL}/bank-deposits/${depositId}`, {
        method: "DELETE",
        headers
    });

    if (!reverseRes.ok) {
        throw new Error(`Bank Deposit Reversal API call failed: ${await reverseRes.text()}`);
    }

    const reverseData = await reverseRes.json();
    console.log("Bank deposit reversed successfully: ", reverseData.message);

    // Verify bank balance is restored
    const reversedBankAccount = await BankAccount.findById(bankAccount._id);
    console.log(`- Bank Account Balance after reversal: ${reversedBankAccount.currentBalance} LKR (Expected: 1000)`);
    if (reversedBankAccount.currentBalance !== 1000) {
        throw new Error(`Bank Account Balance not restored. Expected 1000, got ${reversedBankAccount.currentBalance}`);
    }

    // Verify register cash is restored
    const reversedPosSession = await PosSession.findById(posSession._id);
    const cashInDrawerReversed = (reversedPosSession.openingBalance + reversedPosSession.cashSales - reversedPosSession.cashExpenses - reversedPosSession.bankDeposits);
    console.log(`- Cash Register bankDeposits field after reversal: ${reversedPosSession.bankDeposits} LKR (Expected: 0)`);
    console.log(`- Cash Register Drawer Cash after reversal: ${cashInDrawerReversed} LKR (Expected: 1900)`);
    
    if (reversedPosSession.bankDeposits !== 0) {
        throw new Error(`POS Session bankDeposits not restored. Expected 0, got ${reversedPosSession.bankDeposits}`);
    }
    if (cashInDrawerReversed !== 1900) {
        throw new Error(`POS Session drawer balance not restored. Expected 1900, got ${cashInDrawerReversed}`);
    }
    console.log("✓ Bank Deposit Reversal API successfully restored both balances!");

    // Cleanup
    console.log("\nCleaning up test records...");
    await BankAccount.deleteOne({ _id: bankAccount._id });
    await PosSession.deleteOne({ _id: posSession._id });
    await BankDeposit.deleteOne({ _id: depositId });
    await mongoose.connection.close();

    console.log("\n=================================");
    console.log("ALL TESTS COMPLETED SUCCESSFULLY!");
    console.log("=================================");
    process.exit(0);
}

test().catch(async (err) => {
    console.error("Test failed:", err);
    await mongoose.connection.close();
    process.exit(1);
});
