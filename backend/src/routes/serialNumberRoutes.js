import express from 'express';
import { getSerialNumbers, updateSerialNumberWarranty } from '../controllers/serialNumberController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/', getSerialNumbers);
router.put('/:id/warranty', updateSerialNumberWarranty);

export default router;
