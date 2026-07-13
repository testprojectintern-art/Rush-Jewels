import mongoose from 'mongoose';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import Customer from './src/models/Customer.js';
import Product from './src/models/Product.js';
import Category from './src/models/Category.js';
import Warehouse from './src/models/Warehouse.js';
import StockItem from './src/models/StockItem.js';
import BankAccount from './src/models/BankAccount.js';
import User from './src/models/User.js';
import SalesOrder from './src/models/SalesOrder.js';
import Invoice from './src/models/Invoice.js';
import SerialNumber from './src/models/SerialNumber.js';

dotenv.config();

const PORT = 5005;
const BASE_URL = `http://localhost:${PORT}/api`;

async function ensureSeed() {
    console.log("Ensuring database seed records exist...");
    
    // 1. Warehouse
    let warehouse = await Warehouse.findOne({ isActive: true });
    if (!warehouse) {
        console.log("Creating default warehouse...");
        warehouse = new Warehouse({
            name: "Default Warehouse",
            warehouseCode: "WH-DEF",
            isActive: true,
            isDefault: true
        });
        await warehouse.save();
    }
    
    // 2. Customer
    let customer = await Customer.findOne({ displayName: "Test Wholesale Customer" });
    if (!customer) {
        console.log("Creating test customer...");
        customer = new Customer({
            displayName: "Test Wholesale Customer",
            customerType: "individual",
            status: "active",
            primaryContact: { name: "Test Contact", phone: "0771234567" },
            paymentTerms: { type: "credit", creditLimit: 50000, creditDays: 30 }
        });
        await customer.save();
    }
    
    // 3. Category
    let category = await Category.findOne({ name: "Test Category" });
    if (!category) {
        console.log("Creating default category...");
        category = new Category({
            name: "Test Category",
            code: "CAT-TEST",
            isActive: true
        });
        await category.save();
    }
    
    // 4. Product with custom warranty Period (8 months)
    let product = await Product.findOne({ productCode: "VALPROD" });
    if (product) {
        await Product.deleteOne({ _id: product._id });
    }
    console.log("Creating validation product with 8 months warranty...");
    product = new Product({
        name: "Validation Premium Ring",
        productCode: "VALPROD",
        categoryId: category._id,
        basePrice: 5000,
        status: "active",
        unitOfMeasure: "pcs",
        warrantyPeriod: 8
    });
    await product.save();
    
    // 5. StockItem (ensure product has stock in warehouse)
    let stockItem = await StockItem.findOne({ productId: product._id, warehouseId: warehouse._id });
    if (!stockItem) {
        console.log("Creating stock for test product...");
        stockItem = new StockItem({
            productId: product._id,
            warehouseId: warehouse._id,
            quantities: { onHand: 100, available: 100, allocated: 0 }
        });
        await stockItem.save();
    } else {
        stockItem.quantities.onHand = 100;
        stockItem.quantities.available = 100;
        await stockItem.save();
    }
    
    // 6. BankAccount
    let bankAccount = await BankAccount.findOne({ accountName: "Test Bank Account" });
    if (!bankAccount) {
        console.log("Creating test bank account...");
        bankAccount = new BankAccount({
            accountName: "Test Bank Account",
            accountNumber: `ACC-${Math.floor(Math.random() * 1000000)}`,
            bankName: "Test Bank",
            category: "received",
            currentBalance: 1000,
            isActive: true
        });
        await bankAccount.save();
    }
    
    // 7. SerialNumber
    let sn = await SerialNumber.findOne({ serialNumber: "VAL-SN-9999" });
    if (sn) {
        await SerialNumber.deleteOne({ _id: sn._id });
    }
    console.log("Creating validation serial number record in stock...");
    sn = new SerialNumber({
        serialNumber: "VAL-SN-9999",
        productId: product._id,
        warehouseId: warehouse._id,
        status: 'in_stock'
    });
    await sn.save();
    
    return { customer, product, warehouse, bankAccount, category };
}

async function test() {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);
    
    const seed = await ensureSeed();
    
    console.log("\nGenerating admin JWT token...");
    const admin = await User.findOne({ email: 'admin@admin.com' });
    if (!admin) {
        throw new Error("Admin user not found.");
    }
    const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
    const headers = {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
    };
    
    const { customer, product, warehouse, bankAccount } = seed;
    
    // POS Checkout with isWholesale: true and Serial Numbers
    console.log("\n--- TEST 1: POS Checkout (Wholesale & Custom Warranty) ---");
    const wholesaleOrderPayload = {
        customerId: customer._id,
        sourceWarehouseId: warehouse._id,
        source: 'pos',
        isWholesale: true,
        items: [{
            productId: product._id,
            orderedQuantity: 1,
            unitPrice: 5000,
            serialNumbers: ["VAL-SN-9999"]
        }],
        status: 'approved',
        paymentMethod: 'card',
        bankAccountId: bankAccount._id.toString()
    };
    
    const res = await fetch(`${BASE_URL}/sales-orders`, {
        method: "POST",
        headers,
        body: JSON.stringify(wholesaleOrderPayload)
    });
    
    if (!res.ok) {
        throw new Error(`Wholesale POS checkout failed: ${await res.text()}`);
    }
    const orderData = await res.json();
    console.log("✓ POS Checkout Successful! Order Number:", orderData.data.orderNumber);
    console.log("Order Data:", JSON.stringify(orderData.data, null, 2));
    
    // Fetch Generated Invoice and verify details
    const orderId = orderData.data._id;
    console.log("\nFetching generated Invoice for sales order...");
    const invoice = await Invoice.findOne({ salesOrderIds: orderId }).populate('items.productId');
    if (!invoice) {
        throw new Error("Generated Invoice not found!");
    }
    
    console.log(`Invoice Wholesale Flag: ${invoice.isWholesale} (Expected: true)`);
    if (invoice.isWholesale !== true) {
        throw new Error("Invoice wholesale flag was not copied!");
    }
    console.log("✓ Invoice Wholesale status verified!");
    
    // Verify custom warranty period calculation (Exactly 8 months)
    console.log("\nChecking warranty period calculation for serial number...");
    const serialInfo = await SerialNumber.findOne({ serialNumber: "VAL-SN-9999" });
    if (!serialInfo) {
        throw new Error("Serial number details not found in SerialNumber database collection!");
    }
    if (serialInfo.status !== 'sold') {
        throw new Error(`Expected SerialNumber status to be 'sold', got: ${serialInfo.status}`);
    }
    
    const purchaseDate = new Date(invoice.invoiceDate);
    const expiryDate = new Date(serialInfo.warrantyExpiryDate);
    
    const diffMonths = (expiryDate.getFullYear() - purchaseDate.getFullYear()) * 12 + (expiryDate.getMonth() - purchaseDate.getMonth());
    console.log(`Calculated Warranty Expiry Date: ${expiryDate.toDateString()}`);
    console.log(`Computed Warranty Period: ${diffMonths} months (Expected: 8 months)`);
    
    if (diffMonths !== 8) {
        throw new Error(`Expected warranty period of 8 months, got ${diffMonths} months.`);
    }
    console.log("✓ Dynamic warranty period calculation verified!");
    
    // Test 2: Public unauthenticated Invoice rendering
    console.log("\n--- TEST 2: Public Unauthenticated Invoice Retrieval ---");
    const pubInvoiceRes = await fetch(`${BASE_URL}/public/invoice/${invoice._id}`);
    if (!pubInvoiceRes.ok) {
        throw new Error(`Public invoice fetch failed: ${await pubInvoiceRes.text()}`);
    }
    const pubInvoiceData = await pubInvoiceRes.json();
    console.log("✓ Public Invoice retrieved without auth! Invoice number:", pubInvoiceData.data.invoiceNumber);
    
    // Test 3: Public unauthenticated Warranty Lookup by Invoice Number
    console.log("\n--- TEST 3: Public Unauthenticated Warranty Lookup by Invoice Number ---");
    const pubWarrantyRes = await fetch(`${BASE_URL}/public/invoice-warranty/${invoice.invoiceNumber}`);
    if (!pubWarrantyRes.ok) {
        throw new Error(`Public warranty lookup failed: ${await pubWarrantyRes.text()}`);
    }
    const pubWarrantyData = await pubWarrantyRes.json();
    console.log(`✓ Warranty lookup successful! Customer: ${pubWarrantyData.customerName}`);
    console.log("Items under bill warranty status:");
    pubWarrantyData.items.forEach(item => {
        console.log(`  - Item: ${item.productName} | SN: ${item.serialNumber} | Status: ${item.warrantyStatus} | Days Remaining: ${item.daysRemaining}`);
        if (item.warrantyStatus !== 'active' || item.daysRemaining <= 0) {
            throw new Error(`Expected active warranty, got status: ${item.warrantyStatus}`);
        }
    });
    console.log("✓ Public Warranty Lookup verified!");
    
    // Test 4: Net Profit reports breakdown (Wholesale vs Retail)
    console.log("\n--- TEST 4: Net Profit Wholesale vs Retail Report Breakdown ---");
    const profitRes = await fetch(`${BASE_URL}/reports/financial/net-profit-analysis?startDate=2026-07-01&endDate=2026-07-31`, { headers });
    if (!profitRes.ok) {
        throw new Error(`Net profit report failed: ${await profitRes.text()}`);
    }
    const profitData = await profitRes.json();
    console.log("Summary Aggregations:");
    console.log(`  - Total Revenue: ${profitData.data.summary.revenue} LKR`);
    console.log(`  - Wholesale Revenue: ${profitData.data.summary.wholesaleRevenue} LKR (Expected >= 5000)`);
    console.log(`  - Retail Revenue: ${profitData.data.summary.retailRevenue} LKR`);
    
    if (profitData.data.summary.wholesaleRevenue < 5000) {
        throw new Error("Wholesale order revenue was not aggregated under wholesaleRevenue!");
    }
    console.log("✓ Financial reports wholesale vs retail breakdown verified!");
    
    // Database Cleanup
    console.log("\nCleaning up test records...");
    await SalesOrder.deleteOne({ _id: orderId });
    await Invoice.deleteOne({ _id: invoice._id });
    await Product.deleteOne({ _id: product._id });
    await StockItem.deleteOne({ productId: product._id, warehouseId: warehouse._id });
    await SerialNumber.deleteOne({ serialNumber: "VAL-SN-9999" });
    
    await mongoose.connection.close();
    console.log("\n=================================");
    console.log("ALL TESTS COMPLETED SUCCESSFULLY!");
    console.log("=================================");
    process.exit(0);
}

test().catch(async (err) => {
    console.error("Test failed:", err);
    try {
        await mongoose.connection.close();
    } catch (_) {}
    process.exit(1);
});