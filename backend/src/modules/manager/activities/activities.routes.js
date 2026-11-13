import { Router } from 'express';
import * as activitiesController from './activities.controller.js';

const router = Router();

router.get('/', activitiesController.getActivities);
router.get('/projects/:projectId', activitiesController.getProjectActivities);
router.get('/boards/:boardId', activitiesController.getBoardActivities);
router.get('/tasks/:taskId', activitiesController.getTaskActivities);
router.get('/members/:memberId', activitiesController.getMemberActivities);
router.get('/:activityId', activitiesController.getActivityById);

export default router;
