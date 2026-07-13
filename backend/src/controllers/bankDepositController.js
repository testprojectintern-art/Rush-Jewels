import asyncHandler from 'express-async-handler';
import mongoose from 'mongoose';
import BankDeposit from '../models/BankDeposit.js';
import BankAccount from '../models/BankAccount.js';
import PosSession from '../models/PosSession.js';

// Create a bank deposit from cashier register to bank account
export const createBankDeposit = asyncHandler(async (req, res) => {
    const { bankAccountId, amount, reference, notes, posSessionId } = req.body;

    if (!bankAccountId) {
        res.status(400);
        throw new Error('Bank account is required');
    }
    if (!amount || Number(amount) <= 0) {
        res.status(400);
        throw new Error('Amount must be greater than zero');
    }

    const session = await mongoose.startSession();
    let deposit;

    try {
        await session.withTransaction(async () => {
            let targetSession = null;

            if (posSessionId && posSessionId !== 'none') {
                targetSession = await PosSession.findById(posSessionId).session(session);
                if (!targetSession) {
                    throw new Error('Selected cash register session not found');
                }
            } else if (posSessionId === undefined) {
                // Default: Try to find user's active session
                targetSession = await PosSession.findOne({ userId: req.user._id, status: 'open' }).session(session);
            }

            if (targetSession) {
                // Calculate current cash balance in register
                const currentCashInRegister = (targetSession.openingBalance || 0) + (targetSession.cashSales || 0) - (targetSession.cashExpenses || 0) - (targetSession.bankDeposits || 0);
                if (currentCashInRegister < amount) {
                    throw new Error(`Insufficient cash in register. Available: LKR ${currentCashInRegister.toFixed(2)}`);
                }

                // Update session deposits
                targetSession.bankDeposits += Number(amount);
                await targetSession.save({ session });
            }

            // Get bank account
            const bankAccount = await BankAccount.findById(bankAccountId).session(session);
            if (!bankAccount) {
                throw new Error('Bank account not found');
            }

            // Update bank balance
            bankAccount.currentBalance += Number(amount);
            await bankAccount.save({ session });

            // Create deposit record
            deposit = new BankDeposit({
                posSessionId: targetSession ? targetSession._id : null,
                bankAccountId,
                amount,
                reference,
                notes,
                createdBy: req.user._id
            });

            await deposit.save({ session });
        });

        res.status(201).json({ success: true, data: deposit });
    } catch (error) {
        res.status(400);
        throw new Error(error.message);
    } finally {
        session.endSession();
    }
});

// Get all bank deposits
export const getBankDeposits = asyncHandler(async (req, res) => {
    const deposits = await BankDeposit.find()
        .populate('bankAccountId', 'accountName bankName accountNumber')
        .populate('posSessionId', 'openedAt status')
        .populate('createdBy', 'firstName lastName')
        .sort({ depositDate: -1 });

    res.json({ success: true, data: deposits });
});

// Delete/Reverse a bank deposit
export const deleteBankDeposit = asyncHandler(async (req, res) => {
    const session = await mongoose.startSession();
    try {
        await session.withTransaction(async () => {
            const deposit = await BankDeposit.findById(req.params.id).session(session);
            if (!deposit) throw new Error('Deposit record not found');
            if (deposit.deletedAt) throw new Error('Deposit already reversed');

            const bankAccount = await BankAccount.findById(deposit.bankAccountId).session(session);
            if (bankAccount) {
                bankAccount.currentBalance -= deposit.amount;
                await bankAccount.save({ session });
            }

            if (deposit.posSessionId) {
                const posSession = await PosSession.findById(deposit.posSessionId).session(session);
                if (posSession) {
                    posSession.bankDeposits -= deposit.amount;
                    await posSession.save({ session });
                }
            }

            deposit.deletedAt = new Date();
            await deposit.save({ session });
        });
        res.json({ success: true, message: 'Deposit reversed successfully' });
    } catch (error) {
        res.status(400);
        throw new Error(error.message);
    } finally {
        session.endSession();
    }
});
