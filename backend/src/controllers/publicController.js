import asyncHandler from 'express-async-handler';
import SerialNumber from '../models/SerialNumber.js';
import Product from '../models/Product.js';
import Brand from '../models/Brand.js';
import StockItem from '../models/StockItem.js';
import Invoice from '../models/Invoice.js';
import Customer from '../models/Customer.js';
import SalesOrder from '../models/SalesOrder.js';
import Appointment from '../models/Appointment.js';

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
            discountPercent: product.discountPercent || 0,
            discountPrice: product.discountPrice || 0,
            productNature: product.productNature || 'single',
            variations: product.variations || [],
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

/**
 * POST /api/public/orders
 * Public endpoint to place a customer order.
 */
export const placeOnlineOrderPublic = asyncHandler(async (req, res) => {
    const { name, phone, address, email, items, paymentMethod, deliveryDistrict, deliveryService, notes, engravingText, giftWrap } = req.body;

    if (!name || !phone || !address || !items || !Array.isArray(items) || items.length === 0) {
        res.status(400);
        throw new Error('Name, phone, address, and items are required');
    }

    const cleanedPhone = phone.trim();

    // 1. Find or create customer
    let customer = await Customer.findOne({ 'primaryContact.phone': cleanedPhone });
    if (!customer) {
        customer = await Customer.create({
            displayName: name,
            customerType: 'individual',
            businessType: 'end_user',
            primaryContact: {
                name: name,
                phone: cleanedPhone,
                email: email || '',
            },
            billingAddress: {
                label: 'Main Address',
                line1: address,
                city: deliveryDistrict || 'Colombo',
                country: 'Sri Lanka',
                phone: cleanedPhone
            },
            shippingAddresses: [{
                label: 'Delivery Address',
                line1: address,
                city: deliveryDistrict || 'Colombo',
                country: 'Sri Lanka',
                phone: cleanedPhone,
                isDefault: true
            }],
            status: 'active'
        });
    }

    // 2. Validate items and build line items
    const orderItems = [];
    for (const item of items) {
        const product = await Product.findById(item.productId);
        if (!product) {
            res.status(404);
            throw new Error(`Product not found: ${item.productId}`);
        }
        let listPrice = product.basePrice;
        let itemDiscountPercent = product.discountPercent || 0;
        let itemDiscountPrice = product.discountPrice || 0;
        let variationName = '';

        if (item.variationId && product.variations && product.variations.length > 0) {
            const variant = product.variations.find(v => v._id.toString() === item.variationId.toString());
            if (variant) {
                listPrice = variant.price || product.basePrice;
                itemDiscountPercent = variant.discountPercent || 0;
                itemDiscountPrice = variant.discountPrice || 0;
                variationName = variant.name;
            }
        }

        // Calculate actual price after discount
        let unitPrice = listPrice;
        let discountAmount = 0;
        if (itemDiscountPrice > 0) {
            unitPrice = itemDiscountPrice;
            discountAmount = Math.max(0, listPrice - itemDiscountPrice);
        } else if (itemDiscountPercent > 0) {
            discountAmount = +(listPrice * (itemDiscountPercent / 100)).toFixed(2);
            unitPrice = +(listPrice - discountAmount).toFixed(2);
        }

        orderItems.push({
            productId: product._id,
            variationId: item.variationId || null,
            productCode: product.productCode,
            productName: variationName ? `${product.name} (${variationName})` : product.name,
            orderedQuantity: item.qty || 1,
            listPrice,
            unitPrice,
            discountPercent: itemDiscountPercent,
            discountAmount,
            taxable: product.tax?.taxable || false,
            taxRate: product.tax?.taxRate || 0,
        });
    }

    // 3. Create the SalesOrder
    const salesOrder = new SalesOrder({
        portal: 'online_orders',
        source: 'online',
        status: 'pending_approval',
        customerId: customer._id,
        customerSnapshot: {
            name: customer.displayName,
            phone: customer.primaryContact.phone,
        },
        billingAddress: {
            line1: address,
            city: deliveryDistrict || 'Colombo',
            phone: cleanedPhone
        },
        shippingAddress: {
            line1: address,
            city: deliveryDistrict || 'Colombo',
            phone: cleanedPhone
        },
        items: orderItems,
        paymentMethod: paymentMethod || 'cod',
        deliveryDistrict: deliveryDistrict || 'Colombo',
        deliveryService: deliveryService || 'Domex Delivery',
        trackingNumber: '',
        deliveryStatus: 'pending',
        customerNotes: notes || '',
        engravingText: engravingText || '',
        giftWrap: giftWrap || false,
        giftWrapFee: giftWrap ? 250 : 0,
    });

    await salesOrder.save();

    res.status(201).json({
        success: true,
        message: 'Online order placed successfully',
        data: salesOrder
    });
});

/**
 * GET /api/public/orders/history
 * Public endpoint to fetch customer order history.
 */
export const getPublicOrderHistory = asyncHandler(async (req, res) => {
    const { phone } = req.query;

    if (!phone) {
        return res.status(400).json({
            success: false,
            message: 'Phone number parameter is required'
        });
    }

    const cleanedPhone = phone.trim();

    const customer = await Customer.findOne({ 'primaryContact.phone': cleanedPhone });
    if (!customer) {
        return res.status(200).json({
            success: true,
            count: 0,
            data: []
        });
    }

    const orders = await SalesOrder.find({
        customerId: customer._id,
        portal: 'online_orders'
    }).sort({ createdAt: -1 });

    res.status(200).json({
        success: true,
        count: orders.length,
        data: orders
    });
});

/**
 * POST /api/public/appointments
 * Public endpoint to request a showroom appointment booking.
 */
export const createAppointmentPublic = asyncHandler(async (req, res) => {
    const { customerName, customerPhone, customerEmail, showroom, date, timeSlot, notes } = req.body;

    if (!customerName || !customerPhone || !showroom || !date || !timeSlot) {
        res.status(400);
        throw new Error('Please fill in all required appointment fields');
    }

    const appointment = await Appointment.create({
        customerName,
        customerPhone: customerPhone.trim(),
        customerEmail,
        showroom,
        date: new Date(date),
        timeSlot,
        notes,
        status: 'pending'
    });

    res.status(201).json({
        success: true,
        data: appointment
    });
});

/**
 * GET /api/public/certificates/:certNumber
 * Public mock GIA lookup.
 */
export const checkCertificatePublic = asyncHandler(async (req, res) => {
    const { certNumber } = req.params;

    if (!certNumber) {
        return res.status(400).json({
            success: false,
            message: 'Certificate number parameter is required'
        });
    }

    const cleanNum = certNumber.trim().toUpperCase();

    // Mock GIA Diamond registry
    const mockCertificates = {
        'GIA-12345678': {
            certNumber: 'GIA-12345678',
            issueDate: '2025-10-15',
            shape: 'Round Brilliant',
            caratWeight: '1.25 carat',
            colorGrade: 'D (Colorless)',
            clarityGrade: 'VVS1 (Very, Very Slightly Included)',
            cutGrade: 'Excellent',
            polish: 'Excellent',
            symmetry: 'Excellent',
            fluorescence: 'None',
            inscription: 'GIA 12345678',
            authenticity: 'Certified Authentic Natural Diamond'
        },
        'GIA-87654321': {
            certNumber: 'GIA-87654321',
            issueDate: '2026-02-18',
            shape: 'Oval Modified Brilliant',
            caratWeight: '2.01 carat',
            colorGrade: 'E (Colorless)',
            clarityGrade: 'VS1 (Slightly Included)',
            cutGrade: 'Excellent',
            polish: 'Excellent',
            symmetry: 'Very Good',
            fluorescence: 'Faint',
            inscription: 'GIA 87654321',
            authenticity: 'Certified Authentic Natural Diamond'
        }
    };

    const certData = mockCertificates[cleanNum];
    if (certData) {
        res.status(200).json({
            success: true,
            found: true,
            data: certData
        });
    } else {
        res.status(200).json({
            success: true,
            found: false,
            message: 'No laboratory records found for this certificate number. Please contact customer care for support.'
        });
    }
});
