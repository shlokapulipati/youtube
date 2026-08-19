import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

await mongoose.connect(process.env.DB_URL);

const db = mongoose.connection.db;
await db.collection('histories').deleteMany({});
await db.collection('likedvideos').deleteMany({});
await db.collection('watchlaters').deleteMany({});
await db.collection('downloads').deleteMany({});

console.log('Interactions cleaned!');
process.exit(0);
