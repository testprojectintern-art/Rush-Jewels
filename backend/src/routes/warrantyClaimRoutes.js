import express from 'express';
import {
    getWarrantyClaims,
    getWarrantyClaimById,
    createWarrantyClaim,
    updateWarrantyClaim,
    updateWarrantyClaimStatus
} from '../controllers/warrantyClaimController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.route('/')
    .get(getWarrantyClaims)
    .post(authorize('admin', 'manager', 'employee', 'cashier'), createWarrantyClaim);

router.route('/:id')
    .get(getWarrantyClaimById)
    .put(authorize('admin', 'manager', 'employee'), updateWarrantyClaim);

router.route('/:id/status')
    .patch(authorize('admin', 'manager', 'employee', 'cashier'), updateWarrantyClaimStatus);

export default router;
