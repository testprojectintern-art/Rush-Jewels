import asyncHandler from 'express-async-handler';
import SerialNumber from '../models/SerialNumber.js';
import Product from '../models/Product.js';
import Brand from '../models/Brand.js';

/**
 * GET /api/public/warranty-check/:serialNumber
 * Public endpoint to verify watch authenticity and check warranty status.
 * This endpoint is unauthenticated and does not leak customer or financial details.
 */
export const checkWarrantyPublic = asyncHandler(async (req, res) => {
    const { serialNumber } = req.params;

    if (!serialNumber) {
        return res.status(400).json({
            success: false,
            message: 'Serial number parameter is required'
        });
    }

    const serialRecord = await SerialNumber.findOne({
        serialNumber: serialNumber.trim().toUpperCase()
    }).populate({
        path: 'productId',
        select: 'name productCode brandId'
    });

    if (!serialRecord) {
        return res.status(200).json({
            success: true,
            authentic: false,
            message: 'Verification Failed: This serial number was not found in our database. The watch may be inauthentic.'
        });
    }

    // Resolve brand name
    let brandName = 'Unbranded';
    if (serialRecord.productId?.brandId) {
        const brand = await Brand.findById(serialRecord.productId.brandId);
        if (brand) brandName = brand.name;
    }

    const now = new Date();
    let warrantyStatus = 'not_sold';
    let daysRemaining = 0;

    if (serialRecord.status === 'sold') {
        if (serialRecord.warrantyExpiryDate) {
            const expiry = new Date(serialRecord.warrantyExpiryDate);
            if (expiry > now) {
                warrantyStatus = 'active';
                daysRemaining = Math.max(0, Math.ceil((expiry - now) / (1000 * 60 * 60 * 24)));
            } else {
                warrantyStatus = 'expired';
            }
        } else {
            warrantyStatus = 'active'; // Default to active if date is missing but sold
        }
    } else if (['returned_to_vendor', 'scrapped'].includes(serialRecord.status)) {
        warrantyStatus = 'inactive';
    }

    res.status(200).json({
        success: true,
        authentic: true,
        serialNumber: serialRecord.serialNumber,
        productName: serialRecord.productId?.name || 'Unknown Watch',
        productCode: serialRecord.productId?.productCode || 'Unknown Code',
        brandName,
        status: serialRecord.status,
        warrantyExpiryDate: serialRecord.warrantyExpiryDate,
        warrantyStatus,
        daysRemaining
    });
});
