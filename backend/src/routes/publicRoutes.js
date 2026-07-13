import express from 'express';
import { checkWarrantyPublic, getProductsPublic, getPublicInvoiceById, checkInvoiceWarrantyPublic, getPublicSettings } from '../controllers/publicController.js';

const router = express.Router();

router.get('/warranty-check/:serialNumber', checkWarrantyPublic);
router.get('/products', getProductsPublic);
router.get('/invoice/:id', getPublicInvoiceById);
router.get('/invoice-warranty/:invoiceNumber', checkInvoiceWarrantyPublic);
router.get('/settings', getPublicSettings);

export default router;
