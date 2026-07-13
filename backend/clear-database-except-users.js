import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

const clearDatabaseExceptUsers = async () => {
    try {
        if (!process.env.MONGO_URI) {
            throw new Error('MONGO_URI is not defined in .env file');
        }

        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✓ Connected to MongoDB');

        const db = mongoose.connection.db;
        const collections = await db.listCollections().toArray();

        console.log(`Found ${collections.length} collections.`);
        
        for (const col of collections) {
            const collectionName = col.name;

            if (collectionName === 'users') {
                const userCount = await db.collection(collectionName).countDocuments();
                console.log(`- Preserving collection: "${collectionName}" (${userCount} login accounts kept)`);
                continue;
            }

            console.log(`- Clearing collection: "${collectionName}"...`);
            const deleteResult = await db.collection(collectionName).deleteMany({});
            console.log(`  ✓ Cleared "${collectionName}" (${deleteResult.deletedCount} documents deleted)`);
        }

        console.log('\n✓ Database clearing complete! All collections cleared except "users".');
        process.exit(0);
    } catch (error) {
        console.error('✗ Error clearing database:', error);
        process.exit(1);
    }
};

clearDatabaseExceptUsers();
