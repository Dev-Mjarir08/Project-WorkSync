import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import mongoose from 'mongoose';
import corsOptions from './config/cors.js';
import { notFound } from './middleware/notFound.js';
import { errorHandler } from './middleware/errorHandler.js';
import authRoutes from './modules/auth/auth.routes.js';

export const app = express();

// Security HTTP headers
app.use(helmet());

// Cross-Origin Resource Sharing
app.use(cors(corsOptions));

// Body parsers
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Health Check API with live DB status
app.get('/api/health', (req, res) => {
  const dbState = mongoose.connection.readyState;
  const stateMap = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };

  res.status(200).json({
    success: true,
    message: 'WorkSync API is running smoothly',
    database: {
      status: stateMap[dbState] || 'unknown',
      connected: dbState === 1,
      name: mongoose.connection.name || null
    },
    timestamp: new Date().toISOString(),
    uptime: `${Math.floor(process.uptime())}s`
  });
});

// Auth Routes (Mounted under /api/v1/auth and /api/auth for smooth access)
app.use('/api/v1/auth', authRoutes);
app.use('/api/auth', authRoutes);

// Catch 404 routes
app.use(notFound);

// Central error handler
app.use(errorHandler);

export default app;
