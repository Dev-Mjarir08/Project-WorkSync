import { Router } from 'express';
import * as analyticsController from './analytics.controller.js';

const router = Router();

router.get('/overview', analyticsController.getAnalyticsOverview);
router.get('/members', analyticsController.getMemberStatistics);
router.get('/projects', analyticsController.getProjectStatistics);
router.get('/boards', analyticsController.getBoardStatistics);
router.get('/tasks', analyticsController.getTaskStatistics);
router.get('/completed-tasks', analyticsController.getCompletedTaskStatistics);
router.get('/overdue-tasks', analyticsController.getOverdueTaskStatistics);
router.get('/productivity', analyticsController.getTeamProductivity);
router.get('/workload', analyticsController.getMemberWorkload);

export default router;
