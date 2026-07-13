import express from 'express';
import {
    createSalesOrder, getSalesOrders, getSalesOrderById,
    updateSalesOrder, changeSalesOrderStatus, deleteSalesOrder,
    patchOnlineDeliveryStatus,
} from '../controllers/salesOrderController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validateMiddleware.js';
import { createSalesOrderSchema, updateSalesOrderSchema } from '../validators/salesOrderValidator.js';

const router = express.Router();
router.use(protect);

router
    .route('/')
    .get(getSalesOrders)
    .post(
        authorize('admin', 'manager', 'cashier'),
        validate(createSalesOrderSchema),
        createSalesOrder
    );

router
    .route('/:id')
    .get(getSalesOrderById)
    .put(
        authorize('admin', 'manager', 'cashier'),
        validate(updateSalesOrderSchema),
        updateSalesOrder
    )
    .delete(authorize('admin', 'manager', 'cashier'), deleteSalesOrder);

router.patch(
    '/:id/status',
    authorize('admin', 'manager', 'cashier', 'accountant'),
    changeSalesOrderStatus
);

router.patch(
    '/:id/delivery-status',
    authorize('admin', 'manager', 'cashier', 'accountant'),
    patchOnlineDeliveryStatus
);

export default router;