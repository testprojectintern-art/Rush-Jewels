import mongoose from 'mongoose';
import { getNextSequence } from './Counter.js';

const bankDepositSchema = new mongoose.Schema({
    depositNumber: { type: String, unique: true, trim: true, uppercase: true },
    depositDate: { type: Date, required: true, default: Date.now },
    posSessionId: { type: mongoose.Schema.Types.ObjectId, ref: 'PosSession' },
    bankAccountId: { type: mongoose.Schema.Types.ObjectId, ref: 'BankAccount', required: true },
    amount: { type: Number, required: true, min: 0.01 },
    reference: { type: String, trim: true },
    notes: { type: String, trim: true },
    status: { type: String, enum: ['completed', 'cancelled'], default: 'completed' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    deletedAt: { type: Date, default: null }
}, { timestamps: true });

bankDepositSchema.pre('save', async function () {
    if (this.isNew && !this.depositNumber) {
        const seq = await getNextSequence('bank_deposit');
        this.depositNumber = `DEP-${seq}`;
    }
});

bankDepositSchema.pre(/^find/, function (next) {
    if (!this.getOptions || !this.getOptions().includeDeleted) {
        this.where({ deletedAt: null });
    }
    if (typeof next === 'function') next();
});

const BankDeposit = mongoose.model('BankDeposit', bankDepositSchema);
export default BankDeposit;
