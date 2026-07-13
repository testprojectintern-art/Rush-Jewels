import mongoose from 'mongoose';
import dotenv from 'dotenv';
import BankAccount from './src/models/BankAccount.js';
import User from './src/models/User.js';
import PosSession from './src/models/PosSession.js';
import BankDeposit from './src/models/BankDeposit.js';
import Customer from './src/models/Customer.js';
import Product from './src/models/Product.js';
import Category from './src/models/Category.js';
import Warehouse from './src/models/Warehouse.js';
import StockItem from './src/models/StockItem.js';
import SalesOrder from './src/models/SalesOrder.js';

dotenv.config();

async function clean() {
    console.log("Connecting directly to MongoDB for cleanup...");
    await mongoose.connect(process.env.MONGO_URI);

    console.log("Removing test and seed data created during validation...");

    // Remove Test Bank Accounts
    const bankRes = await BankAccount.deleteMany({
        $or: [
            { accountName: /Test/i },
            { accountNumber: /Tally/i },
            { bankName: /Test/i }
        ]
    });
    console.log(`- Deleted ${bankRes.deletedCount} Test Bank Accounts`);

    // Remove POS Sessions for tests (Sessions with opening balance 500 created for test)
    const sessionRes = await PosSession.deleteMany({
        notes: /Test/i
    });
    console.log(`- Deleted ${sessionRes.deletedCount} Test POS Sessions`);

    // Remove Bank Deposits created during testing
    const depositRes = await BankDeposit.deleteMany({
        $or: [
            { reference: /Test/i },
            { notes: /Test/i }
        ]
    });
    console.log(`- Deleted ${depositRes.deletedCount} Test Bank Deposits`);

    // Remove test customers/products/categories/warehouses
    const customerRes = await Customer.deleteMany({ displayName: /Test Customer/i });
    console.log(`- Deleted ${customerRes.deletedCount} Test Customers`);

    const productRes = await Product.deleteMany({ productCode: "TESTPROD" });
    console.log(`- Deleted ${productRes.deletedCount} Test Products`);

    const catRes = await Category.deleteMany({ code: "CAT-TEST" });
    console.log(`- Deleted ${catRes.deletedCount} Test Categories`);

    const whRes = await Warehouse.deleteMany({ warehouseCode: "WH-DEF" });
    console.log(`- Deleted ${whRes.deletedCount} Test Warehouses`);

    // Clean up sales orders created during testing
    const ordersRes = await SalesOrder.deleteMany({
        $or: [
            { reference: /Test/i },
            { notes: /Test/i }
        ]
    });
    console.log(`- Deleted ${ordersRes.deletedCount} Test Sales Orders`);

    await mongoose.connection.close();
    console.log("Cleanup completed successfully!");
    process.exit(0);
}

clean().catch(async (err) => {
    console.error("Cleanup failed:", err);
    await mongoose.connection.close();
    process.exit(1);
});
