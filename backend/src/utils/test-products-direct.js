import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from '../models/Product.js';

dotenv.config();

async function check() {
    await mongoose.connect(process.env.MONGO_URI);
    
    // Query exactly as publicController.js does
    const products = await Product.find({ status: 'active', canBeSold: true }).lean();
    console.log('Total active canBeSold products:', products.length);
    
    const kandyProds = products.filter(p => p.portal === 'kandy');
    console.log('Kandy products returned by query:', kandyProds.map(p => p.name));

    process.exit(0);
}

check();
