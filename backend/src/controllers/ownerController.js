import asyncHandler from 'express-async-handler';
import mongoose from 'mongoose';
import Invoice from '../models/Invoice.js';
import Bill from '../models/Bill.js';
import Expense from '../models/Expense.js';

/**
 * GET /api/owner/analytics
 * Retrieve consolidated sales, COGS, expenses, and net profit grouped by portal.
 * Accessible only by Owner or Admin.
 */
export const getOwnerAnalytics = asyncHandler(async (req, res) => {
    const { startDate, endDate } = req.query;

    const start = startDate ? new Date(startDate) : new Date(new Date().getFullYear(), new Date().getMonth(), 1); // default start of current month
    const end = endDate ? new Date(endDate) : new Date();
    end.setHours(23, 59, 59, 999);

    // match stage for invoices (sales/revenue)
    const invoiceMatch = {
        deletedAt: null,
        status: { $nin: ['draft', 'void', 'cancelled'] },
        invoiceDate: { $gte: start, $lte: end }
    };

    // match stage for general expenses
    const expenseMatch = {
        deletedAt: null,
        status: { $ne: 'cancelled' },
        date: { $gte: start, $lte: end }
    };

    // match stage for vendor bills (costs)
    const billMatch = {
        deletedAt: null,
        billDate: { $gte: start, $lte: end }
    };

    // 1. Aggregate Sales & COGS per Portal
    const salesStats = await Invoice.aggregate([
        { $match: invoiceMatch },
        { $unwind: '$items' },
        {
            $lookup: {
                from: 'products',
                localField: 'items.productId',
                foreignField: '_id',
                as: 'productInfo'
            }
        },
        { $unwind: { path: '$productInfo', preserveNullAndEmptyArrays: true } },
        {
            $group: {
                _id: {
                    portal: { $ifNull: ['$portal', 'main'] } // default to main if not set
                },
                revenue: { $sum: '$items.lineTotal' },
                cogs: {
                    $sum: {
                        $multiply: [
                            '$items.quantity',
                            { $ifNull: ['$productInfo.purchasePrice', 0] }
                        ]
                    }
                },
                orderCount: { $addToSet: '$salesOrderIds' } // unique orders
            }
        }
    ]);

    // 2. Aggregate general expenses per Portal
    const expenseStats = await Expense.aggregate([
        { $match: expenseMatch },
        {
            $group: {
                _id: {
                    portal: { $ifNull: ['$portal', 'main'] }
                },
                total: { $sum: '$amount' }
            }
        }
    ]);

    // 3. Aggregate supplier bills per Portal
    const billStats = await Bill.aggregate([
        { $match: billMatch },
        {
            $group: {
                _id: {
                    portal: { $ifNull: ['$portal', 'main'] }
                },
                total: { $sum: '$grandTotal' }
            }
        }
    ]);

    // Format stats maps
    const statsMap = {
        main: { sales: 0, cogs: 0, expenses: 0 },
        online_orders: { sales: 0, cogs: 0, expenses: 0 }
    };

    salesStats.forEach(stat => {
        const portal = stat._id.portal;
        if (statsMap[portal]) {
            statsMap[portal].sales = +stat.revenue.toFixed(2);
            statsMap[portal].cogs = +stat.cogs.toFixed(2);
        }
    });

    expenseStats.forEach(stat => {
        const portal = stat._id.portal;
        if (statsMap[portal]) {
            statsMap[portal].expenses += +stat.total.toFixed(2);
        }
    });

    billStats.forEach(stat => {
        const portal = stat._id.portal;
        if (statsMap[portal]) {
            statsMap[portal].expenses += +stat.total.toFixed(2);
        }
    });

    // 4. Calculate monthly trend comparison across portals
    const trendStats = await Invoice.aggregate([
        { $match: invoiceMatch },
        {
            $group: {
                _id: {
                    portal: { $ifNull: ['$portal', 'main'] },
                    year: { $year: '$invoiceDate' },
                    month: { $month: '$invoiceDate' }
                },
                revenue: { $sum: '$grandTotal' }
            }
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    const formattedTrend = trendStats.map(t => ({
        portal: t._id.portal,
        monthLabel: `${t._id.year}-${String(t._id.month).padStart(2, '0')}`,
        revenue: +t.revenue.toFixed(2)
    }));

    // Calculate consolidations
    let totalSales = 0;
    let totalCogs = 0;
    let totalExpenses = 0;

    const portalsBreakdown = Object.keys(statsMap).map(portal => {
        const data = statsMap[portal];
        const grossProfit = data.sales - data.cogs;
        const netProfit = grossProfit - data.expenses;

        totalSales += data.sales;
        totalCogs += data.cogs;
        totalExpenses += data.expenses;

        return {
            portal,
            sales: +data.sales.toFixed(2),
            cogs: +data.cogs.toFixed(2),
            grossProfit: +grossProfit.toFixed(2),
            expenses: +data.expenses.toFixed(2),
            netProfit: +netProfit.toFixed(2)
        };
    });

    const consolidatedGrossProfit = totalSales - totalCogs;
    const consolidatedNetProfit = consolidatedGrossProfit - totalExpenses;

    res.json({
        success: true,
        data: {
            period: { start, end },
            summary: {
                sales: +totalSales.toFixed(2),
                cogs: +totalCogs.toFixed(2),
                grossProfit: +consolidatedGrossProfit.toFixed(2),
                expenses: +totalExpenses.toFixed(2),
                netProfit: +consolidatedNetProfit.toFixed(2)
            },
            portals: portalsBreakdown,
            trend: formattedTrend
        }
    });
});
