import express from 'express';
import { 
    checkWarrantyPublic, 
    getProductsPublic, 
    getPublicInvoiceById, 
    checkInvoiceWarrantyPublic, 
    getPublicSettings,
    placeOnlineOrderPublic,
    getPublicOrderHistory,
    createAppointmentPublic,
    checkCertificatePublic
} from '../controllers/publicController.js';

const router = express.Router();

router.get('/warranty-check/:serialNumber', checkWarrantyPublic);
router.get('/products', getProductsPublic);
router.get('/invoice/:id', getPublicInvoiceById);
router.get('/invoice-warranty/:invoiceNumber', checkInvoiceWarrantyPublic);
router.get('/settings', getPublicSettings);

// Customer Website integrations
router.post('/orders', placeOnlineOrderPublic);
router.get('/orders/history', getPublicOrderHistory);
router.post('/appointments', createAppointmentPublic);
router.get('/certificates/:certNumber', checkCertificatePublic);

export default router;
