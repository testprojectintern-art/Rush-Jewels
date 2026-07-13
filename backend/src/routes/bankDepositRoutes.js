import express from 'express';
import { createBankDeposit, getBankDeposits, deleteBankDeposit } from '../controllers/bankDepositController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
    .get(protect, getBankDeposits)
    .post(protect, createBankDeposit);

router.route('/:id')
    .delete(protect, deleteBankDeposit);

export default router;
