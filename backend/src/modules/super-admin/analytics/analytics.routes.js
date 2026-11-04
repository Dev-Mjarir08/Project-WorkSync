import { Router } from 'express';
import * as analyticsController from './analytics.controller.js';

const router = Router();

router.get('/overview', analyticsController.getAnalyticsOverview);
router.get('/users', analyticsController.getUserAnalytics);
router.get('/workspaces', analyticsController.getWorkspaceAnalytics);
router.get('/boards', analyticsController.getBoardAnalytics);
router.get('/tasks', analyticsController.getTaskAnalytics);
router.get('/activity', analyticsController.getActivityAnalytics);
router.get('/engagement', analyticsController.getEngagementAnalytics);

// Default alias
router.get('/', analyticsController.getAnalyticsOverview);

export default router;

