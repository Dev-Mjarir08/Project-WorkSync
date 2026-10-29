import mongoose from 'mongoose';
import { ENV } from './env.js';

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(ENV.MONGODB_URI, {
      serverSelectionTimeoutMS: 8000,
      autoIndex: true
    });
    console.log(`✅ MongoDB Connected successfully: ${conn.connection.host} (Database: ${conn.connection.name})`);
    return conn;
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

mongoose.connection.on('disconnected', () => {
  console.warn('⚠️ MongoDB disconnected.');
});

mongoose.connection.on('reconnected', () => {
  console.log('🔄 MongoDB reconnected successfully.');
});

mongoose.connection.on('error', (err) => {
  console.error(`❌ MongoDB connection error event: ${err.message}`);
});

export default connectDB;
