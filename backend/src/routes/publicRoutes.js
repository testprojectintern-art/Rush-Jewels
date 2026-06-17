import express from 'express';
import { checkWarrantyPublic } from '../controllers/publicController.js';

const router = express.Router();

router.get('/warranty-check/:serialNumber', checkWarrantyPublic);

export default router;
