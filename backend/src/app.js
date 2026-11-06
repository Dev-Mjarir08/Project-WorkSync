import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import mongoose from 'mongoose';
import corsOptions from './config/cors.js';
import { notFound } from './middleware/notFound.js';
import { errorHandler } from './middleware/errorHandler.js';
import authRoutes from './modules/auth/auth.routes.js';
import superAdminRoutes from './modules/super-admin/superAdmin.routes.js';
import adminRoutes from './modules/admin/admin.routes.js';
import managerRoutes from './modules/manager/manager.routes.js';
import memberRoutes from './modules/members/member.routes.js';
import projectRoutes from './modules/projects/project.routes.js';

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

// Auth Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/auth', authRoutes);

// Super Admin Routes
app.use('/api/v1/super-admin', superAdminRoutes);
app.use('/api/super-admin', superAdminRoutes);

// Workspace Admin Routes (Admin role)
app.use('/api/v1/admin', adminRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/v1/workspace-admin', adminRoutes);
app.use('/api/v1/workspaces/:workspaceId/admin', adminRoutes);

// Manager Routes (Manager role)
app.use('/api/v1/manager', managerRoutes);
app.use('/api/manager', managerRoutes);
app.use('/api/v1/workspaces/:workspaceId/manager', managerRoutes);

// Projects Routes
app.use('/api/v1/projects', projectRoutes);
app.use('/api/projects', projectRoutes);

// Workspace Members & Invitations Routes
app.use('/api/v1/workspaces/:workspaceId', memberRoutes);
app.use('/api/workspaces/:workspaceId', memberRoutes);
app.use('/api/v1/workspace', memberRoutes);
app.use('/api/workspace', memberRoutes);
app.use('/api/v1', memberRoutes);
app.use('/api', memberRoutes);

// Catch 404 routes
app.use(notFound);

// Central error handler
app.use(errorHandler);

export default app;
