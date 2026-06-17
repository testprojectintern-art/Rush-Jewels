import asyncHandler from 'express-async-handler';
import WarrantyClaim from '../models/WarrantyClaim.js';
import SerialNumber from '../models/SerialNumber.js';

/**
 * GET /api/warranty-claims
 * Get all warranty claims with filters, search, and pagination
 */
export const getWarrantyClaims = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const query = {};

    // Filter by status
    if (req.query.status) {
        query.status = req.query.status;
    }

    // Search by serialNumber or claimNumber
    if (req.query.search) {
        const searchRegex = new RegExp(req.query.search, 'i');
        query.$or = [
            { claimNumber: searchRegex },
            { serialNumber: searchRegex }
        ];
    }

    const total = await WarrantyClaim.countDocuments(query);
    const claims = await WarrantyClaim.find(query)
        .populate('productId', 'name productCode brandId')
        .populate('customerId', 'name code phone')
        .populate('supplierId', 'name contactName phone')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

    res.status(200).json({
        success: true,
        count: claims.length,
        pagination: {
            page,
            limit,
            totalPages: Math.ceil(total / limit),
            totalResults: total
        },
        data: claims
    });
});

/**
 * GET /api/warranty-claims/:id
 * Get single warranty claim details
 */
export const getWarrantyClaimById = asyncHandler(async (req, res) => {
    const claim = await WarrantyClaim.findById(req.params.id)
        .populate('productId', 'name productCode brandId SKU')
        .populate('customerId', 'name code phone email')
        .populate('supplierId', 'name contactName phone email');

    if (!claim) {
        res.status(404);
        throw new Error('Warranty claim not found');
    }

    res.status(200).json({ success: true, data: claim });
});

/**
 * POST /api/warranty-claims
 * Create a new warranty claim
 */
export const createWarrantyClaim = asyncHandler(async (req, res) => {
    const { serialNumber, productId, customerId, issueDescription, supplierId, notes } = req.body;

    if (!serialNumber || !productId || !customerId || !issueDescription) {
        res.status(400);
        throw new Error('Please provide serialNumber, productId, customerId, and issueDescription');
    }

    // Optional validation: check if serial number exists in system
    const serialObj = await SerialNumber.findOne({ serialNumber: serialNumber.toUpperCase().trim() });
    if (!serialObj) {
        // Log a note but allow creation (for watches purchased before the system was installed)
        console.log(`Warranty claim logged for untracked serial number: ${serialNumber}`);
    }

    const claim = await WarrantyClaim.create({
        serialNumber: serialNumber.toUpperCase().trim(),
        productId,
        customerId,
        issueDescription,
        supplierId,
        notes
    });

    res.status(201).json({ success: true, data: claim });
});

/**
 * PUT /api/warranty-claims/:id
 * Update warranty claim details
 */
export const updateWarrantyClaim = asyncHandler(async (req, res) => {
    let claim = await WarrantyClaim.findById(req.params.id);

    if (!claim) {
        res.status(404);
        throw new Error('Warranty claim not found');
    }

    const { issueDescription, supplierId, notes, status } = req.body;

    if (issueDescription !== undefined) claim.issueDescription = issueDescription;
    if (supplierId !== undefined) claim.supplierId = supplierId;
    if (notes !== undefined) claim.notes = notes;
    if (status !== undefined) claim.status = status;

    const updatedClaim = await claim.save();
    res.status(200).json({ success: true, data: updatedClaim });
});

/**
 * PATCH /api/warranty-claims/:id/status
 * Update warranty claim status
 */
export const updateWarrantyClaimStatus = asyncHandler(async (req, res) => {
    const claim = await WarrantyClaim.findById(req.params.id);

    if (!claim) {
        res.status(404);
        throw new Error('Warranty claim not found');
    }

    const { status, notes } = req.body;

    if (!status) {
        res.status(400);
        throw new Error('Status is required');
    }

    claim.status = status;
    if (notes) {
        claim.notes = (claim.notes ? claim.notes + '\n' : '') + `[Status update to ${status}]: ` + notes;
    }

    const updatedClaim = await claim.save();
    res.status(200).json({ success: true, data: updatedClaim });
});
