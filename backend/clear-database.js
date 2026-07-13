import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function clearDatabase() {
    if (!process.env.MONGO_URI) {
        console.error("Error: MONGO_URI is not defined in env variables.");
        process.exit(1);
    }

    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected successfully.");

    // Retrieve all collection names in the current database
    const collections = await mongoose.connection.db.collections();
    
    console.log(`\nFound ${collections.length} collections. Starting database clear...`);
    console.log("--------------------------------------------------");

    for (const collection of collections) {
        const name = collection.collectionName;
        
        // Preserve users (logins) collection
        if (name === 'users') {
            console.log(`[PRESERVED] Collection: '${name}'`);
            continue;
        }

        try {
            const result = await collection.deleteMany({});
            console.log(`[CLEARED] Collection: '${name}' | Deleted: ${result.deletedCount} records`);
        } catch (err) {
            console.error(`[ERROR] Failed to clear collection '${name}':`, err.message);
        }
    }

    console.log("--------------------------------------------------");
    console.log("✓ Database clear completed successfully! All logins preserved.");
    
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB.");
    process.exit(0);
}

clearDatabase().catch(err => {
    console.error("Purge script failed:", err);
    process.exit(1);
});
