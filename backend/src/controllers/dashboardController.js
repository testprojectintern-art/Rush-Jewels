import asyncHandler from 'express-async-handler';
import SalesOrder from '../models/SalesOrder.js';
import Invoice from '../models/Invoice.js';
import Payment from '../models/Payment.js';
import Customer from '../models/Customer.js';
import Product from '../models/Product.js';
import StockItem from '../models/StockItem.js';
import PurchaseOrder from '../models/PurchaseOrder.js';
import Bill from '../models/Bill.js';
import ProductionOrder from '../models/ProductionOrder.js';
import CustomerReturn from '../models/CustomerReturn.js';
import Expense from '../models/Expense.js';
import { updateInvoiceAging } from './invoiceController.js';
import { updateBillAging } from './billController.js';

// Helper to filter by active portal context
const getPortalFilter = (req) => {
    if (!req.portal || req.portal === 'owner_dashboard') return {};
    if (req.portal === 'main') {
        return {
            $or: [
                { portal: 'main' },
                { portal: { $exists: false } },
                { portal: null }
            ]
        };
    } else {
        return { portal: req.portal };
    }
};

const addPortalMatch = (pipeline, req) => {
    const filter = getPortalFilter(req);
    if (Object.keys(filter).length === 0) return pipeline;
    
    // Copy the pipeline array and match stages manually to preserve Date objects
    const copied = pipeline.map(stage => {
        if (stage.$match) {
            return { $match: { ...stage.$match, ...filter } };
        }
        return stage;
    });

    const hasMatch = copied.some(stage => stage.$match);
    if (!hasMatch) {
        copied.unshift({ $match: filter });
    }
    return copied;
};

const applyCountFilter = (query, req) => {
    const filter = getPortalFilter(req);
    return { ...query, ...filter };
};

/**
 * GET /api/dashboard/kpis
 * Main admin dashboard key metrics
 */
export const getDashboardKpis = asyncHandler(async (req, res) => {
    await updateInvoiceAging();
    await updateBillAging();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);
    const thirtyDaysAgo = new Date(today); thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const sixtyDaysAgo = new Date(today); sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0, 23, 59, 59);

    // Revenue (invoiced amount this month vs last month)
    const [
        currentMonthInvoices, lastMonthInvoices,
        currentMonthBills, lastMonthBills,
        currentMonthExpenses, lastMonthExpenses,
        currentMonthIn, lastMonthIn,
        currentMonthOut, lastMonthOut,
        currentMonthExpensesPaid, lastMonthExpensesPaid,
        currentMonthReturns, lastMonthReturns
    ] = await Promise.all([
        Invoice.aggregate(addPortalMatch([
            { $match: { deletedAt: null, status: { $nin: ['draft', 'void', 'cancelled'] }, invoiceDate: { $gte: startOfMonth, $lt: tomorrow } } },
            { $group: { _id: null, total: { $sum: '$grandTotal' }, count: { $sum: 1 } } },
        ], req)),
        Invoice.aggregate(addPortalMatch([
            { $match: { deletedAt: null, status: { $nin: ['draft', 'void', 'cancelled'] }, invoiceDate: { $gte: startOfLastMonth, $lte: endOfLastMonth } } },
            { $group: { _id: null, total: { $sum: '$grandTotal' }, count: { $sum: 1 } } },
        ], req)),
        Bill.aggregate(addPortalMatch([
            { $match: { deletedAt: null, billDate: { $gte: startOfMonth, $lt: tomorrow } } },
            { $group: { _id: null, total: { $sum: '$grandTotal' } } },
        ], req)),
        Bill.aggregate(addPortalMatch([
            { $match: { deletedAt: null, billDate: { $gte: startOfLastMonth, $lte: endOfLastMonth } } },
            { $group: { _id: null, total: { $sum: '$grandTotal' } } },
        ], req)),
        Expense.aggregate(addPortalMatch([
            { $match: { deletedAt: null, status: { $ne: 'cancelled' }, date: { $gte: startOfMonth, $lt: tomorrow } } },
            { $group: { _id: null, total: { $sum: '$amount' } } },
        ], req)),
        Expense.aggregate(addPortalMatch([
            { $match: { deletedAt: null, status: { $ne: 'cancelled' }, date: { $gte: startOfLastMonth, $lte: endOfLastMonth } } },
            { $group: { _id: null, total: { $sum: '$amount' } } },
        ], req)),
        Payment.aggregate(addPortalMatch([
            { $match: { deletedAt: null, direction: 'received', paymentDate: { $gte: startOfMonth, $lt: tomorrow } } },
            { $group: { _id: null, total: { $sum: '$amount' } } },
        ], req)),
        Payment.aggregate(addPortalMatch([
            { $match: { deletedAt: null, direction: 'received', paymentDate: { $gte: startOfLastMonth, $lte: endOfLastMonth } } },
            { $group: { _id: null, total: { $sum: '$amount' } } },
        ], req)),
        Payment.aggregate(addPortalMatch([
            { $match: { deletedAt: null, direction: 'paid', paymentDate: { $gte: startOfMonth, $lt: tomorrow } } },
            { $group: { _id: null, total: { $sum: '$amount' } } },
        ], req)),
        Payment.aggregate(addPortalMatch([
            { $match: { deletedAt: null, direction: 'paid', paymentDate: { $gte: startOfLastMonth, $lte: endOfLastMonth } } },
            { $group: { _id: null, total: { $sum: '$amount' } } },
        ], req)),
        Expense.aggregate(addPortalMatch([
            { $match: { deletedAt: null, status: 'paid', date: { $gte: startOfMonth, $lt: tomorrow } } },
            { $group: { _id: null, total: { $sum: '$amount' } } },
        ], req)),
        Expense.aggregate(addPortalMatch([
            { $match: { deletedAt: null, status: 'paid', date: { $gte: startOfLastMonth, $lte: endOfLastMonth } } },
            { $group: { _id: null, total: { $sum: '$amount' } } },
        ], req)),
        CustomerReturn.aggregate(addPortalMatch([
            { $match: { deletedAt: null, status: { $in: ['processed', 'completed'] }, requestDate: { $gte: startOfMonth, $lt: tomorrow } } },
            { $group: { _id: null, total: { $sum: '$netRefundAmount' } } },
        ], req)),
        CustomerReturn.aggregate(addPortalMatch([
            { $match: { deletedAt: null, status: { $in: ['processed', 'completed'] }, requestDate: { $gte: startOfLastMonth, $lte: endOfLastMonth } } },
            { $group: { _id: null, total: { $sum: '$netRefundAmount' } } },
        ], req)),
    ]);


    const grossRevenueThisMonth = currentMonthInvoices[0]?.total || 0;
    const grossRevenueLastMonth = lastMonthInvoices[0]?.total || 0;
    const returnsThisMonthAmt = currentMonthReturns[0]?.total || 0;
    const returnsLastMonthAmt = lastMonthReturns[0]?.total || 0;

    const revenueThisMonth = grossRevenueThisMonth - returnsThisMonthAmt;
    const revenueLastMonth = grossRevenueLastMonth - returnsLastMonthAmt;
    const revenueGrowth = revenueLastMonth > 0
        ? ((revenueThisMonth - revenueLastMonth) / revenueLastMonth * 100).toFixed(1)
        : 0;

    const billsThisMonth = currentMonthBills[0]?.total || 0;
    const billsLastMonth = lastMonthBills[0]?.total || 0;
    const generalExpensesThisMonth = currentMonthExpenses[0]?.total || 0;
    const generalExpensesLastMonth = lastMonthExpenses[0]?.total || 0;

    const expensesThisMonth = billsThisMonth + generalExpensesThisMonth;
    const expensesLastMonth = billsLastMonth + generalExpensesLastMonth;

    const gpThisMonth = revenueThisMonth - expensesThisMonth;
    const gpLastMonth = revenueLastMonth - expensesLastMonth;
    const gpGrowth = gpLastMonth !== 0
        ? ((gpThisMonth - gpLastMonth) / Math.abs(gpLastMonth) * 100).toFixed(1)
        : 0;

    const collectedThisMonth = currentMonthIn[0]?.total || 0;
    const collectedLastMonth = lastMonthIn[0]?.total || 0;

    const paymentsPaidThisMonth = currentMonthOut[0]?.total || 0;
    const paymentsPaidLastMonth = lastMonthOut[0]?.total || 0;
    const generalExpensesPaidThisMonth = currentMonthExpensesPaid[0]?.total || 0;
    const generalExpensesPaidLastMonth = lastMonthExpensesPaid[0]?.total || 0;

    const paidThisMonth = paymentsPaidThisMonth + generalExpensesPaidThisMonth;
    const paidLastMonth = paymentsPaidLastMonth + generalExpensesPaidLastMonth;

    const cashFlowThisMonth = collectedThisMonth - paidThisMonth;
    const cashFlowLastMonth = collectedLastMonth - paidLastMonth;
    const cashFlowGrowth = cashFlowLastMonth !== 0
        ? ((cashFlowThisMonth - cashFlowLastMonth) / Math.abs(cashFlowLastMonth) * 100).toFixed(1)
        : 0;

    // Orders metrics
    const [todaysOrders, monthOrders, pendingApproval, pendingDispatch] = await Promise.all([
        SalesOrder.countDocuments(applyCountFilter({ deletedAt: null, orderDate: { $gte: today, $lt: tomorrow } }, req)),
        SalesOrder.countDocuments(applyCountFilter({ deletedAt: null, orderDate: { $gte: startOfMonth } }, req)),
        SalesOrder.countDocuments(applyCountFilter({ deletedAt: null, status: 'draft' }, req)),
        SalesOrder.countDocuments(applyCountFilter({ deletedAt: null, status: 'approved' }, req)),
    ]);

    // Outstanding receivables (unpaid + overdue)
    const [arTotal, overdueAr] = await Promise.all([
        Invoice.aggregate(addPortalMatch([
            { $match: { deletedAt: null, paymentStatus: { $in: ['unpaid', 'partially_paid', 'overdue'] } } },
            { $group: { _id: null, total: { $sum: '$balanceDue' } } },
        ], req)),
        Invoice.aggregate(addPortalMatch([
            { $match: { deletedAt: null, paymentStatus: 'overdue' } },
            { $group: { _id: null, total: { $sum: '$balanceDue' }, count: { $sum: 1 } } },
        ], req)),
    ]);

    // Outstanding payables
    const apTotal = await Bill.aggregate(addPortalMatch([
        { $match: { deletedAt: null, paymentStatus: { $in: ['unpaid', 'partially_paid', 'overdue'] } } },
        { $group: { _id: null, total: { $sum: '$balanceDue' } } },
    ], req));

    // Stock alerts (filter by portal: for main, only show main warehouse stock, etc.)
    const stockFilter = getPortalFilter(req);
    let warehouseMatch = {};
    if (stockFilter.portal === 'main') {
        const Warehouse = (await import('../models/Warehouse.js')).default;
        const mw = await Warehouse.findOne({ warehouseCode: 'MAIN' });
        if (mw) warehouseMatch = { warehouseId: mw._id };
    }

    const lowStockProducts = await StockItem.aggregate([
        { $match: { ...warehouseMatch } },
        {
            $group: {
                _id: '$productId',
                totalAvailable: { $sum: { $subtract: ['$quantities.onHand', '$quantities.reserved'] } },
            },
        },
        {
            $lookup: {
                from: 'products', localField: '_id', foreignField: '_id', as: 'product',
            },
        },
        { $unwind: '$product' },
        {
            $match: {
                'product.deletedAt': null,
                'product.canBeSold': true,
                $expr: { $lte: ['$totalAvailable', '$product.stockLevels.reorderLevel'] },
            },
        },
        {
            $project: {
                productId: '$_id', productCode: '$product.productCode',
                productName: '$product.name', available: '$totalAvailable',
                reorderLevel: '$product.stockLevels.reorderLevel',
            },
        },
        { $limit: 10 },
    ]);

    // Production status
    const [activeProduction, productionThisMonth] = await Promise.all([
        ProductionOrder.countDocuments(applyCountFilter({ deletedAt: null, status: 'in_progress' }, req)),
        ProductionOrder.countDocuments(applyCountFilter({
            deletedAt: null,
            status: { $in: ['completed', 'partially_completed'] },
            actualEndDate: { $gte: startOfMonth },
        }, req)),
    ]);

    // Returns this month
    const returnsThisMonth = await CustomerReturn.countDocuments(applyCountFilter({
        deletedAt: null,
        requestDate: { $gte: startOfMonth },
    }, req));

    // Customer stats (Customers are global, so no portal separation required, but let's support it if requested)
    const [totalCustomers, newCustomersThisMonth, customersOnHold] = await Promise.all([
        Customer.countDocuments({ deletedAt: null, status: 'active' }),
        Customer.countDocuments({ deletedAt: null, createdAt: { $gte: startOfMonth } }),
        Customer.countDocuments({ deletedAt: null, 'creditStatus.onCreditHold': true }),
    ]);

    res.json({
        success: true,
        data: {
            revenue: {
                thisMonth: +revenueThisMonth.toFixed(2),
                lastMonth: +revenueLastMonth.toFixed(2),
                growth: +revenueGrowth,
                invoiceCount: currentMonthInvoices[0]?.count || 0,
            },
            grossProfit: {
                thisMonth: +gpThisMonth.toFixed(2),
                growth: +gpGrowth,
            },
            cashFlow: {
                thisMonth: +cashFlowThisMonth.toFixed(2),
                growth: +cashFlowGrowth,
            },
            orders: {
                today: todaysOrders,
                thisMonth: monthOrders,
                pendingApproval,
                pendingDispatch,
            },
            receivables: {
                total: +(arTotal[0]?.total || 0).toFixed(2),
                overdue: +(overdueAr[0]?.total || 0).toFixed(2),
                overdueCount: overdueAr[0]?.count || 0,
            },
            payables: {
                total: +(apTotal[0]?.total || 0).toFixed(2),
            },
            stock: {
                lowStockCount: lowStockProducts.length,
                lowStockItems: lowStockProducts,
            },
            production: {
                active: activeProduction,
                completedThisMonth: productionThisMonth,
            },
            returns: {
                thisMonth: returnsThisMonth,
            },
            customers: {
                total: totalCustomers,
                newThisMonth: newCustomersThisMonth,
                onHold: customersOnHold,
            },
        },
    });
});

/**
 * GET /api/dashboard/revenue-chart?period=month|week&months=6
 */
export const getRevenueChart = asyncHandler(async (req, res) => {
    const months = Number(req.query.months) || 6;
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth() - months + 1, 1);

    const data = await Invoice.aggregate(addPortalMatch([
        { $match: { deletedAt: null, invoiceDate: { $gte: startDate } } },
        {
            $group: {
                _id: {
                    year: { $year: '$invoiceDate' },
                    month: { $month: '$invoiceDate' },
                },
                revenue: { $sum: '$grandTotal' },
                count: { $sum: 1 },
            },
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
    ], req));

    // Fill in missing months with 0
    const result = [];
    for (let i = 0; i < months; i++) {
        const d = new Date(now.getFullYear(), now.getMonth() - months + 1 + i, 1);
        const found = data.find((x) => x._id.year === d.getFullYear() && x._id.month === d.getMonth() + 1);
        result.push({
            year: d.getFullYear(),
            month: d.getMonth() + 1,
            monthLabel: d.toLocaleDateString('en-LK', { month: 'short', year: '2-digit' }),
            revenue: found ? +found.revenue.toFixed(2) : 0,
            invoiceCount: found?.count || 0,
        });
    }

    res.json({ success: true, data: result });
});

/**
 * GET /api/dashboard/top-products?limit=10&period=month
 */
export const getTopProducts = asyncHandler(async (req, res) => {
    const limit = Number(req.query.limit) || 10;
    const period = req.query.period || 'month';

    const now = new Date();
    let startDate;
    if (period === 'week') startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    else if (period === 'year') startDate = new Date(now.getFullYear(), 0, 1);
    else startDate = new Date(now.getFullYear(), now.getMonth(), 1);

    const data = await SalesOrder.aggregate(addPortalMatch([
        {
            $match: {
                deletedAt: null,
                orderDate: { $gte: startDate },
                status: { $nin: ['draft', 'cancelled'] },
            },
        },
        { $unwind: '$items' },
        {
            $group: {
                _id: '$items.productId',
                productName: { $first: '$items.productName' },
                productCode: { $first: '$items.productCode' },
                quantitySold: { $sum: '$items.orderedQuantity' },
                revenue: { $sum: { $multiply: ['$items.orderedQuantity', '$items.unitPrice'] } },
                orderCount: { $sum: 1 },
            },
        },
        { $sort: { revenue: -1 } },
        { $limit: limit },
    ], req));

    res.json({ success: true, data });
});

/**
 * GET /api/dashboard/top-customers?limit=10&period=month
 */
export const getTopCustomers = asyncHandler(async (req, res) => {
    const limit = Number(req.query.limit) || 10;
    const period = req.query.period || 'month';

    const now = new Date();
    let startDate;
    if (period === 'week') startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    else if (period === 'year') startDate = new Date(now.getFullYear(), 0, 1);
    else startDate = new Date(now.getFullYear(), now.getMonth(), 1);

    const data = await Invoice.aggregate(addPortalMatch([
        { $match: { deletedAt: null, invoiceDate: { $gte: startDate } } },
        {
            $group: {
                _id: '$customerId',
                customerName: { $first: '$customerSnapshot.name' },
                customerCode: { $first: '$customerSnapshot.code' },
                totalInvoiced: { $sum: '$grandTotal' },
                totalPaid: { $sum: '$amountPaid' },
                invoiceCount: { $sum: 1 },
            },
        },
        { $sort: { totalInvoiced: -1 } },
        { $limit: limit },
    ], req));

    res.json({ success: true, data });
});