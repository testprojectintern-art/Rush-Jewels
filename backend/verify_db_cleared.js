import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

const verifyDatabase = async () => {
    try {
        if (!process.env.MONGO_URI) {
            throw new Error('MONGO_URI is not defined in .env file');
        }
        await mongoose.connect(process.env.MONGO_URI);

        const db = mongoose.connection.db;
        const collections = await db.listCollections().toArray();

        console.log('--- VERIFICATION RESULTS ---');
        let allCleared = true;
        let usersIntact = false;
        let usersCount = 0;

        for (const col of collections) {
            const count = await db.collection(col.name).countDocuments();
            if (col.name === 'users') {
                usersIntact = count > 0;
                usersCount = count;
                console.log(`[USER LOGINS] "${col.name}": ${count} documents`);
            } else {
                if (count !== 0) {
                    allCleared = false;
                }
                console.log(`[DATA] "${col.name}": ${count} documents`);
            }
        }

        console.log('-----------------------------');
        if (allCleared) {
            console.log('✓ SUCCESS: All other collections are completely empty.');
        } else {
            console.error('✗ FAILURE: Some non-user collections still contain documents!');
        }

        if (usersIntact) {
            console.log(`✓ SUCCESS: The "users" collection is intact with ${usersCount} users remaining.`);
        } else {
            console.error('✗ FAILURE: The "users" collection is empty or missing!');
        }

        process.exit(0);
    } catch (error) {
        console.error('Error during verification:', error);
        process.exit(1);
    }
};

verifyDatabase();
