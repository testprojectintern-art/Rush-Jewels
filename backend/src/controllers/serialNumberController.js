import asyncHandler from 'express-async-handler';
import SerialNumber from '../models/SerialNumber.js';
import Product from '../models/Product.js';

/**
 * GET /api/serial-numbers
 * Fetch serial numbers with populated product, warehouse, and invoice info.
 */
export const getSerialNumbers = asyncHandler(async (req, res) => {
    const { search, status, page = 1, limit = 20 } = req.query;
    
    const filter = {};
    if (search) {
        filter.serialNumber = { $regex: search.trim().toUpperCase(), $options: 'i' };
    }
    if (status) {
        filter.status = status;
    }

    const skip = (Number(page) - 1) * Number(limit);
    
    const [serials, total] = await Promise.all([
        SerialNumber.find(filter)
            .populate('productId', 'name productCode brandId warrantyPeriod')
            .populate('warehouseId', 'name warehouseCode')
            .populate({
                path: 'invoiceId',
                select: 'invoiceNumber invoiceDate customerId',
                populate: { path: 'customerId', select: 'displayName phone' }
            })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(Number(limit))
            .lean(),
        SerialNumber.countDocuments(filter)
    ]);

    res.status(200).json({
        success: true,
        data: serials,
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit))
    });
});

/**
 * PUT /api/serial-numbers/:id/warranty
 * Manually register, activate, or update warranty parameters.
 */
export const updateSerialNumberWarranty = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { status, warrantyExpiryDate } = req.body;

    const serialRecord = await SerialNumber.findById(id);
    if (!serialRecord) {
        res.status(404);
        throw new Error('Serial number record not found');
    }

    if (status) {
        serialRecord.status = status;
    }
    
    if (warrantyExpiryDate !== undefined) {
        serialRecord.warrantyExpiryDate = warrantyExpiryDate ? new Date(warrantyExpiryDate) : null;
    }

    await serialRecord.save();

    // Populate updated record details
    const populated = await SerialNumber.findById(serialRecord._id)
        .populate('productId', 'name productCode brandId warrantyPeriod')
        .populate('warehouseId', 'name warehouseCode')
        .populate({
            path: 'invoiceId',
            select: 'invoiceNumber invoiceDate customerId',
            populate: { path: 'customerId', select: 'displayName phone' }
        });

    res.status(200).json({
        success: true,
        message: 'Warranty registration updated successfully',
        data: populated
    });
});
