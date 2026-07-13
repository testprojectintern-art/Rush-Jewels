import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from './src/models/Product.js';

dotenv.config();

const listProducts = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const products = await Product.find({}, 'name productCode basePrice');
        console.log(products);
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

listProducts();
