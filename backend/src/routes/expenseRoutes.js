import express from 'express';
import { createExpense, getExpenses, deleteExpense } from '../controllers/expenseController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.route('/')
    .post(createExpense)
    .get(getExpenses);

router.route('/:id')
    .delete(authorize('admin', 'manager', 'accountant'), deleteExpense);

export default router;
