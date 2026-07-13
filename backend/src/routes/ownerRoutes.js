import express from 'express';
import { getOwnerAnalytics } from '../controllers/ownerController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);
router.use(authorize('admin', 'owner'));

router.get('/analytics', getOwnerAnalytics);

export default router;
