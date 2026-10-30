import http from 'http';
import app from './app.js';
import { connectDB } from './config/db.js';
import { ENV } from './config/env.js';

const server = http.createServer(app);

const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();

    const PORT = ENV.PORT || 8081;

    server.listen(PORT, () => {
      console.log(`===============================================`);
      console.log(`🚀 WorkSync Backend running on port ${PORT}`);
      console.log(`📡 Health Check: http://localhost:${PORT}/api/health`);
      console.log(`🔐 Auth API:        http://localhost:${PORT}/api/v1/auth`);
      console.log(`👑 Super Admin API: http://localhost:${PORT}/api/v1/super-admin`);
      console.log(`🌍 Environment: ${ENV.NODE_ENV}`);
      console.log(`===============================================`);
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION! 💥 Shutting down...');
  console.error(err);
  server.close(() => {
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.error(err);
  process.exit(1);
});

startServer();

export default server;
