import express from 'express';
import { getCompanySettings, updateCompanySettings, getDbStats } from '../controllers/settingsController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Both admins and regular users (like cashiers) need to be able to GET the settings to print receipts.
router.route('/company')
    .get(protect, getCompanySettings)
    .put(protect, authorize('admin', 'manager'), updateCompanySettings);

// DB stats (restricted to admin users only)
router.route('/db-stats')
    .get(protect, authorize('admin'), getDbStats);

export default router;
