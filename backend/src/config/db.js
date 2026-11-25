import mongoose from 'mongoose';
import { ENV } from './env.js';

let cachedPromise = null;

export const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (cachedPromise) {
    return cachedPromise;
  }

  try {
    cachedPromise = mongoose.connect(ENV.MONGODB_URI, {
      serverSelectionTimeoutMS: 8000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000,
      maxPoolSize: 15,
      minPoolSize: 1,
      maxIdleTimeMS: 30000,
      family: 4,
      autoIndex: false
    });
    const conn = await cachedPromise;
    console.log(`✅ MongoDB Connected successfully: ${conn.connection.host} (Database: ${conn.connection.name})`);
    return conn;
  } catch (error) {
    cachedPromise = null;
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
      process.exit(1);
    }
    throw error;
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
