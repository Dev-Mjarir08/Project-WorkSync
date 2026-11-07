import { Router } from 'express';
import * as reportsController from './reports.controller.js';

const router = Router();

router.get('/overview', reportsController.getReportsOverview);
router.get('/projects', reportsController.getProjectReports);
router.get('/tasks', reportsController.getTaskReports);
router.get('/completed-tasks', reportsController.getCompletedTaskReports);
router.get('/overdue-tasks', reportsController.getOverdueTaskReports);
router.get('/team-performance', reportsController.getTeamPerformanceReports);
router.get('/workload', reportsController.getWorkloadReports);
router.get('/productivity', reportsController.getProductivityReports);
router.get('/activity', reportsController.getActivityReports);
router.get('/burndown', reportsController.getBurndownReports);
router.get('/export', reportsController.exportReports);

export default router;
