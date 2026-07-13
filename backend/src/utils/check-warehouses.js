import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Warehouse from '../models/Warehouse.js';

dotenv.config();

async function check() {
    await mongoose.connect(process.env.MONGO_URI);
    const list = await Warehouse.find({}).lean();
    console.log('Warehouses:', JSON.stringify(list, null, 2));
    process.exit(0);
}

check();
