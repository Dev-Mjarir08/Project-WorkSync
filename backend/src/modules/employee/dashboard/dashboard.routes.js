import { Router } from 'express';
import * as dashboardController from './dashboard.controller.js';

const router = Router();

router.get('/', dashboardController.getDashboardOverview);
router.get('/stats', dashboardController.getDashboardStats);
router.get('/my-projects', dashboardController.getMyProjects);
router.get('/task-overview', dashboardController.getTaskOverview);
router.get('/recent-tasks', dashboardController.getRecentTasks);
router.get('/overdue-tasks', dashboardController.getOverdueTasks);
router.get('/recent-activities', dashboardController.getRecentActivities);
router.get('/team-performance', dashboardController.getTeamPerformance);
router.get('/upcoming-deadlines', dashboardController.getUpcomingDeadlines);

export default router;
