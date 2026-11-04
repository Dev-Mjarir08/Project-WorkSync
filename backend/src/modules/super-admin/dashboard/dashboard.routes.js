import { Router } from 'express';
import * as dashboardController from './dashboard.controller.js';

const router = Router();

router.get('/', dashboardController.getDashboard);
router.get('/stats', dashboardController.getDashboardStats);
router.get('/user-growth', dashboardController.getUserGrowth);
router.get('/workspace-growth', dashboardController.getWorkspaceGrowth);
router.get('/recent-users', dashboardController.getRecentUsers);
router.get('/recent-workspaces', dashboardController.getRecentWorkspaces);
router.get('/recent-activities', dashboardController.getRecentActivities);

export default router;

