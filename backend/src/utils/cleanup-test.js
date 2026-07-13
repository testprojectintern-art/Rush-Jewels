import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Customer from '../models/Customer.js';
import SalesOrder from '../models/SalesOrder.js';
import Invoice from '../models/Invoice.js';
import Payment from '../models/Payment.js';
import StockItem from '../models/StockItem.js';
import Warehouse from '../models/Warehouse.js';

dotenv.config();

async function cleanupTestData() {
    try {
        console.log('Connecting to database for cleanup...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected successfully.');

        // 1. Find the test customers
        const testCustomers = await Customer.find({ 
            $or: [
                { displayName: 'Test Customer' },
                { 'primaryContact.phone': '0771234567' }
            ]
        });
        const customerIds = testCustomers.map(c => c._id);
        console.log(`Found ${testCustomers.length} test customers to remove.`);

        if (customerIds.length > 0) {
            // 2. Find Sales Orders for these customers
            const orders = await SalesOrder.find({ customerId: { $in: customerIds } });
            const orderIds = orders.map(o => o._id);
            const orderNumbers = orders.map(o => o.orderNumber);
            console.log(`Found ${orders.length} sales orders to remove: ${orderNumbers.join(', ')}`);

            // 3. Find Invoices for these orders
            const invoices = await Invoice.find({ salesOrderIds: { $in: orderIds } });
            const invoiceIds = invoices.map(i => i._id);
            console.log(`Found ${invoices.length} invoices to remove.`);

            // 4. Find Payments for these invoices or orders
            const payments = await Payment.find({
                $or: [
                    { 'allocations.documentId': { $in: invoiceIds } },
                    { customerId: { $in: customerIds } }
                ]
            });
            const paymentIds = payments.map(p => p._id);
            console.log(`Found ${payments.length} payments to remove.`);

            // 5. Restore stock levels decremented during checkout
            console.log('Restoring stock levels...');
            const mainWh = await Warehouse.findOne({ warehouseCode: 'MAIN' });
            if (mainWh) {
                for (const order of orders) {
                    for (const item of order.items) {
                        const qty = item.orderedQuantity || 0;
                        if (qty > 0) {
                            const updatedStock = await StockItem.findOneAndUpdate(
                                {
                                    productId: item.productId,
                                    warehouseId: mainWh._id,
                                    batchNumber: null
                                },
                                {
                                    $inc: { 'quantities.onHand': qty }
                                },
                                { new: true }
                            );
                            if (updatedStock) {
                                console.log(`  - Incremented stock for ${item.productId} in Main Warehouse by ${qty}. New stock: ${updatedStock.quantities.onHand}`);
                            }
                        }
                    }
                }
            }

            // 6. Delete the records
            if (paymentIds.length > 0) {
                const delPayments = await Payment.deleteMany({ _id: { $in: paymentIds } });
                console.log(`✓ Deleted ${delPayments.deletedCount} payments.`);
            }
            if (invoiceIds.length > 0) {
                const delInvoices = await Invoice.deleteMany({ _id: { $in: invoiceIds } });
                console.log(`✓ Deleted ${delInvoices.deletedCount} invoices.`);
            }
            if (orderIds.length > 0) {
                const delOrders = await SalesOrder.deleteMany({ _id: { $in: orderIds } });
                console.log(`✓ Deleted ${delOrders.deletedCount} sales orders.`);
            }
            const delCustomers = await Customer.deleteMany({ _id: { $in: customerIds } });
            console.log(`✓ Deleted ${delCustomers.deletedCount} customers.`);
        }

        console.log('\n=== CLEANUP COMPLETED SUCCESSFULLY ===');
        process.exit(0);

    } catch (err) {
        console.error('Cleanup failed with error:', err);
        process.exit(1);
    }
}

cleanupTestData();
