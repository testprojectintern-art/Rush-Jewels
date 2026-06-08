import express from 'express';
import { getCompanySettings, updateCompanySettings } from '../controllers/settingsController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Both admins and regular users (like cashiers) need to be able to GET the settings to print receipts.
router.route('/company')
    .get(protect, getCompanySettings)
    .put(protect, authorize('admin', 'manager'), updateCompanySettings);

export default router;
