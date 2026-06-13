import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import connectDB from './src/lib/mongodb.js';
import mongoose from 'mongoose';

async function reset() {
  await connectDB();
  // Clear ALL scan logs for the demo batch
  const result1 = await mongoose.connection.db.collection('scanlogs').deleteMany({});
  console.log(`Cleared ${result1.deletedCount} scan log entries!`);
  process.exit(0);
}
reset().catch(console.error);
