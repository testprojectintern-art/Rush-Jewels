import mongoose from 'mongoose';
import axios from 'axios';
import Product from '../models/Product.js';

/**
 * Calculates the total available stock for a product across all warehouses,
 * then sends the sync payload to the Spring Boot REST API.
 * Updates the product with the returned MySQL ID.
 * @param {string} productId - MongoDB ID of the product
 */
export async function syncProductToSpringBoot(productId) {
    const syncUrl = process.env.SPRING_BOOT_SYNC_URL;
    const secretKey = process.env.SPRING_BOOT_SECRET_KEY || 'MY_SUPER_SECRET_PASSPHRASE';

    if (!syncUrl) {
        console.warn('Sync warning: SPRING_BOOT_SYNC_URL is not defined in environment variables. Skipping sync.');
        return;
    }

    try {
        const product = await Product.findById(productId);
        if (!product) {
            console.error(`Sync error: Product not found with ID ${productId}`);
            return;
        }

        // Fetch stock items to sum up total available quantity across all warehouses
        const StockItem = mongoose.model('StockItem');
        const stockItems = await StockItem.find({ productId });
        
        // Sum available stock (onHand - reserved) across all warehouses
        const totalStock = stockItems.reduce((acc, item) => {
            const available = item.quantities?.available ?? (item.quantities?.onHand ?? 0);
            return acc + available;
        }, 0);

        // Prepare request body DTO matching PosProductRequestDTO in Spring Boot
        const payload = {
            mongoId: product._id.toString(),
            name: product.name,
            price: product.basePrice,
            stockQty: totalStock,
            imageUrl: product.image || ''
        };

        console.log(`Syncing product "${product.name}" (${product._id}) to Spring Boot at ${syncUrl}...`);

        const response = await axios.post(syncUrl, payload, {
            headers: {
                'X-POS-SECRET-KEY': secretKey,
                'Content-Type': 'application/json'
            },
            timeout: 5000 // 5 seconds timeout
        });

        if (response.data && response.data.success && response.data.mysqlId) {
            // Update product in MongoDB with returned MySQL ID
            // Using findByIdAndUpdate to avoid triggering standard document save middleware issues
            await Product.findByIdAndUpdate(productId, { mysqlId: response.data.mysqlId });
            console.log(`✓ Product "${product.name}" synced successfully. MySQL ID: ${response.data.mysqlId}`);
        } else {
            console.warn(`Sync warning: Spring Boot sync endpoint returned unexpected response:`, response.data);
        }

    } catch (error) {
        console.error(`Sync failed for product ID ${productId}:`, error.message);
        // We log the error but don't rethrow to keep POS operations online even if Web store is offline
    }
}
