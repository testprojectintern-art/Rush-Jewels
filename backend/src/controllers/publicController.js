import asyncHandler from 'express-async-handler';
import SerialNumber from '../models/SerialNumber.js';
import Product from '../models/Product.js';
import Brand from '../models/Brand.js';
import StockItem from '../models/StockItem.js';
import Invoice from '../models/Invoice.js';

/**
 * GET /api/public/warranty-check/:serialNumber
 * Public endpoint to verify jewelry authenticity and check warranty status.
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
            message: 'Verification Failed: This serial number was not found in our database. The jewelry item may be inauthentic.'
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
        productName: serialRecord.productId?.name || 'Unknown Jewelry Item',
        productCode: serialRecord.productId?.productCode || 'Unknown Code',
        brandName,
        status: serialRecord.status,
        warrantyExpiryDate: serialRecord.warrantyExpiryDate,
        warrantyStatus,
        daysRemaining
    });
});

/**
 * GET /api/public/products
 * Public endpoint to fetch active jewelry items and their stock levels warehouse-wise.
 */
export const getProductsPublic = asyncHandler(async (req, res) => {
    const filter = { status: 'active', canBeSold: true };
    const portalQuery = req.query.portal;
    const portalHeader = portalQuery || req.headers['x-portal-context'] || 'main';
    console.log('getProductsPublic query:', req.query, 'header:', req.headers['x-portal-context'], 'resolved portalHeader:', portalHeader);

    if (portalHeader !== 'owner_dashboard' && portalHeader !== 'all') {
        if (portalHeader === 'main') {
            filter.$or = [
                { portal: 'main' },
                { portal: { $exists: false } },
                { portal: null }
            ];
        } else {
            filter.portal = portalHeader;
        }
    }

    const products = await Product.find(filter)
        .populate('brandId', 'name')
        .populate('categoryId', 'name')
        .lean();

    const productIds = products.map(p => p._id);

    // Fetch stock items for warehouses
    const stockItems = await StockItem.find({ productId: { $in: productIds } })
        .populate('warehouseId', 'name warehouseCode')
        .lean();

    // Group stocks by productId
    const stockMap = {};
    stockItems.forEach(item => {
        const prodId = item.productId.toString();
        if (!stockMap[prodId]) stockMap[prodId] = [];
        stockMap[prodId].push({
            warehouseId: item.warehouseId?._id?.toString(),
            warehouseName: item.warehouseId?.name || 'Unknown',
            warehouseCode: item.warehouseId?.warehouseCode || 'UNK',
            available: Math.max(0, (item.quantities?.onHand || 0) - (item.quantities?.reserved || 0)),
            onHand: item.quantities?.onHand || 0
        });
    });

    const result = products.map(product => {
        const stocks = stockMap[product._id.toString()] || [];
        return {
            _id: product._id,
            productCode: product.productCode,
            name: product.name,
            description: product.description,
            basePrice: product.basePrice,
            image: product.image || '/luxury_jewelry_placeholder.png',
            brand: product.brandId?.name || 'Rush Jewels Premium',
            category: product.categoryId?.name || 'General',
            portal: product.portal,
            stocks
        };
    });

    res.json({
        success: true,
        count: result.length,
        data: result
    });
});

/**
 * GET /api/public/invoice/:id
 * Public endpoint to fetch basic invoice information for view/printing without auth.
 */
export const getPublicInvoiceById = asyncHandler(async (req, res) => {
    const invoice = await Invoice.findById(req.params.id)
        .populate('customerId', 'displayName customerCode phone email')
        .populate('salesRepId', 'firstName lastName')
        .populate('salesOrderIds', 'orderNumber orderDate')
        .lean();

    if (!invoice) {
        res.status(404);
        throw new Error('Invoice not found');
    }

    res.status(200).json({
        success: true,
        data: invoice
    });
});

/**
 * GET /api/public/invoice-warranty/:invoiceNumber
 * Public endpoint to check active warranty of all serial numbers purchased in a specific invoice.
 */
export const checkInvoiceWarrantyPublic = asyncHandler(async (req, res) => {
    const { invoiceNumber } = req.params;

    if (!invoiceNumber) {
        return res.status(400).json({
            success: false,
            message: 'Invoice number is required'
        });
    }

    const invoice = await Invoice.findOne({
        invoiceNumber: invoiceNumber.trim().toUpperCase()
    }).populate({
        path: 'customerId',
        select: 'displayName'
    });

    if (!invoice) {
        return res.status(404).json({
            success: false,
            message: 'Invoice not found. Please verify the invoice number.'
        });
    }

    // Find all serial numbers matching this invoice ID
    const serials = await SerialNumber.find({ invoiceId: invoice._id })
        .populate({
            path: 'productId',
            select: 'name productCode brandId'
        });

    const now = new Date();

    const items = await Promise.all(serials.map(async (sn) => {
        let brandName = 'Unbranded';
        if (sn.productId?.brandId) {
            const brand = await Brand.findById(sn.productId.brandId);
            if (brand) brandName = brand.name;
        }

        let warrantyStatus = 'not_sold';
        let daysRemaining = 0;

        if (sn.status === 'sold') {
            if (sn.warrantyExpiryDate) {
                const expiry = new Date(sn.warrantyExpiryDate);
                if (expiry > now) {
                    warrantyStatus = 'active';
                    daysRemaining = Math.max(0, Math.ceil((expiry - now) / (1000 * 60 * 60 * 24)));
                } else {
                    warrantyStatus = 'expired';
                }
            } else {
                warrantyStatus = 'active';
            }
        }

        return {
            serialNumber: sn.serialNumber,
            productName: sn.productId?.name || 'Unknown Item',
            productCode: sn.productId?.productCode || 'Unknown Code',
            brandName,
            warrantyExpiryDate: sn.warrantyExpiryDate,
            warrantyStatus,
            daysRemaining
        };
    }));

    res.status(200).json({
        success: true,
        invoiceNumber: invoice.invoiceNumber,
        invoiceDate: invoice.invoiceDate,
        customerName: invoice.customerSnapshot?.name || invoice.customerId?.displayName || 'Valued Customer',
        items
    });
});

/**
 * GET /api/public/settings
 * Public endpoint to fetch active company business info (unauthenticated).
 */
export const getPublicSettings = asyncHandler(async (req, res) => {
    const CompanySettings = mongoose.model('CompanySettings');
    let settings = await CompanySettings.findOne().lean();
    if (!settings) {
        settings = {};
    }
    res.status(200).json({
        success: true,
        data: {
            companyName: settings.companyName || 'Rush Jewels',
            address: settings.address || '',
            phone: settings.phone || '',
            email: settings.email || '',
            website: settings.website || '',
            taxRegistrationNumber: settings.taxRegistrationNumber || '',
            receiptFooterMessage: settings.receiptFooterMessage || '',
            logo: settings.logo || null
        }
    });
});
