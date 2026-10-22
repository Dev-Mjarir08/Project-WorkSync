import { Router } from 'express';
import * as dashboardController from './dashboard.controller.js';

const router = Router();

router.get('/', dashboardController.getDashboardOverview);
router.get('/stats', dashboardController.getDashboardStats);
router.get('/member-growth', dashboardController.getMemberGrowth);
router.get('/task-overview', dashboardController.getTaskOverview);
router.get('/recent-members', dashboardController.getRecentMembers);
router.get('/recent-boards', dashboardController.getRecentBoards);
router.get('/recent-activities', dashboardController.getRecentActivities);
router.get('/overdue-tasks', dashboardController.getOverdueTasks);

export default router;
