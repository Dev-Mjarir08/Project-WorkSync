import { Router } from 'express';
import * as teamController from './team.controller.js';

const router = Router();

// Aggregate / Static sub-routes must be registered before parameterized :memberId
router.get('/', teamController.getTeamMembers);
router.get('/workload', teamController.getTeamWorkload);
router.get('/performance', teamController.getTeamPerformance);
router.get('/availability', teamController.getTeamAvailability);

// Member-specific sub-routes
router.get('/:memberId', teamController.getMemberDetails);
router.get('/:memberId/tasks', teamController.getMemberTasks);
router.get('/:memberId/projects', teamController.getMemberProjects);
router.get('/:memberId/activities', teamController.getMemberActivities);
router.get('/:memberId/workload', teamController.getMemberWorkload);

export default router;
