import asyncHandler from 'express-async-handler';
import mongoose from 'mongoose';
import StockItem from '../../models/StockItem.js';
import Invoice from '../../models/Invoice.js';
import Product from '../../models/Product.js';

/**
 * GET /api/reports/watch/aging-stock
 * Retrieve inventory aging analytics (idle capital locked up in different age buckets)
 */
export const getInventoryAging = asyncHandler(async (req, res) => {
    const data = await StockItem.aggregate([
        { $match: { 'quantities.onHand': { $gt: 0 } } },
        {
            $lookup: {
                from: 'products',
                localField: 'productId',
                foreignField: '_id',
                as: 'product'
            }
        },
        { $unwind: '$product' },
        {
            $lookup: {
                from: 'brands',
                localField: 'product.brandId',
                foreignField: '_id',
                as: 'brand'
            }
        },
        { $unwind: { path: '$brand', preserveNullAndEmptyArrays: true } },
        {
            $project: {
                productName: '$product.name',
                productCode: '$product.productCode',
                brandName: { $ifNull: ['$brand.name', 'Unbranded'] },
                onHand: '$quantities.onHand',
                costPerUnit: 1,
                totalValue: { $multiply: ['$quantities.onHand', '$costPerUnit'] },
                createdAt: 1
            }
        }
    ]);

    const now = new Date();
    const buckets = {
        '0_30': { label: '0-30 Days (Fast/New)', count: 0, value: 0, items: [] },
        '31_90': { label: '31-90 Days (Normal)', count: 0, value: 0, items: [] },
        '91_180': { label: '91-180 Days (Slow)', count: 0, value: 0, items: [] },
        '181_plus': { label: '181+ Days (Dead Stock)', count: 0, value: 0, items: [] }
    };

    data.forEach(item => {
        const ageInMs = now - new Date(item.createdAt);
        const ageDays = Math.floor(ageInMs / (1000 * 60 * 60 * 24));
        
        let bucketKey = '181_plus';
        if (ageDays <= 30) bucketKey = '0_30';
        else if (ageDays <= 90) bucketKey = '31_90';
        else if (ageDays <= 180) bucketKey = '91_180';

        buckets[bucketKey].count += item.onHand;
        buckets[bucketKey].value += item.totalValue;
        buckets[bucketKey].items.push({
            ...item,
            ageDays,
            totalValue: +item.totalValue.toFixed(2)
        });
    });

    // Format totals
    Object.keys(buckets).forEach(key => {
        buckets[key].value = +buckets[key].value.toFixed(2);
        // Sort items by value descending
        buckets[key].items.sort((a, b) => b.totalValue - a.totalValue);
    });

    res.status(200).json({
        success: true,
        data: buckets
    });
});

/**
 * GET /api/reports/watch/brand-profitability
 * Retrieve Net Profit Margin breakdown per Watch Brand (Pareto Analysis)
 */
export const getBrandProfitability = asyncHandler(async (req, res) => {
    const data = await Invoice.aggregate([
        { $match: { status: { $ne: 'cancelled' }, deletedAt: null } },
        { $unwind: '$items' },
        {
            $lookup: {
                from: 'products',
                localField: 'items.productId',
                foreignField: '_id',
                as: 'product'
            }
        },
        { $unwind: '$product' },
        {
            $lookup: {
                from: 'brands',
                localField: 'product.brandId',
                foreignField: '_id',
                as: 'brand'
            }
        },
        { $unwind: { path: '$brand', preserveNullAndEmptyArrays: true } },
        {
            $group: {
                _id: { $ifNull: ['$brand.name', 'Unbranded'] },
                unitsSold: { $sum: '$items.quantity' },
                revenue: { $sum: '$items.lineTotal' },
                totalCost: { $sum: { $multiply: ['$items.quantity', { $ifNull: ['$product.purchasePrice', 0] }] } }
            }
        },
        {
            $project: {
                brandName: '$_id',
                unitsSold: 1,
                revenue: { $round: ['$revenue', 2] },
                totalCost: { $round: ['$totalCost', 2] },
                profit: { $round: [{ $subtract: ['$revenue', '$totalCost'] }, 2] },
                margin: {
                    $cond: [
                        { $gt: ['$revenue', 0] },
                        { $round: [{ $multiply: [{ $divide: [{ $subtract: ['$revenue', '$totalCost'] }, '$revenue'] }, 100] }, 2] },
                        0
                    ]
                }
            }
        },
        { $sort: { revenue: -1 } }
    ]);

    res.status(200).json({
        success: true,
        data
    });
});

/**
 * GET /api/reports/watch/aov-bundles
 * Average Order Value and product bundle recommendations (association analysis)
 */
export const getAovAndBundles = asyncHandler(async (req, res) => {
    const invoices = await Invoice.find({ status: { $ne: 'cancelled' }, deletedAt: null });
    
    // 1. Calculate AOV
    const totalRevenue = invoices.reduce((sum, inv) => sum + inv.grandTotal, 0);
    const aov = invoices.length > 0 ? +(totalRevenue / invoices.length).toFixed(2) : 0;

    // 2. Simple Apriori-like Co-purchase Analysis
    const pairCounts = {};
    
    invoices.forEach(inv => {
        const itemNames = Array.from(new Set(inv.items.map(i => i.productName)));
        if (itemNames.length < 2) return;
        
        // Generate all unique combinations/pairs of items in the invoice
        for (let i = 0; i < itemNames.length; i++) {
            for (let j = i + 1; j < itemNames.length; j++) {
                const pair = [itemNames[i], itemNames[j]].sort().join(' + ');
                pairCounts[pair] = (pairCounts[pair] || 0) + 1;
            }
        }
    });

    // Convert to sorted list
    const bundles = Object.keys(pairCounts).map(pair => ({
        bundleName: pair,
        frequency: pairCounts[pair]
    })).sort((a, b) => b.frequency - a.frequency).slice(0, 5);

    res.status(200).json({
        success: true,
        data: {
            aov,
            totalOrders: invoices.length,
            totalSales: +totalRevenue.toFixed(2),
            topBundles: bundles
        }
    });
});

/**
 * GET /api/reports/watch/seasonality
 * Sales trend seasonality analysis comparison across calendar months/years
 */
export const getSeasonalVelocity = asyncHandler(async (req, res) => {
    const velocity = await Invoice.aggregate([
        { $match: { status: { $ne: 'cancelled' }, deletedAt: null } },
        {
            $group: {
                _id: {
                    year: { $year: '$invoiceDate' },
                    month: { $month: '$invoiceDate' }
                },
                sales: { $sum: '$grandTotal' },
                orders: { $sum: 1 }
            }
        },
        {
            $project: {
                year: '$_id.year',
                month: '$_id.month',
                sales: { $round: ['$sales', 2] },
                orders: 1,
                _id: 0
            }
        },
        { $sort: { year: 1, month: 1 } }
    ]);

    res.status(200).json({
        success: true,
        data: velocity
    });
});
