import { Router } from 'express';
import * as tasksController from './tasks.controller.js';

const router = Router();

router.get('/', tasksController.getAllTasks);
router.post('/', tasksController.createTask);

router.get('/:taskId', tasksController.getTaskById);
router.patch('/:taskId', tasksController.updateTask);
router.delete('/:taskId', tasksController.deleteTask);

router.patch('/:taskId/status', tasksController.updateTaskStatus);
router.patch('/:taskId/assign', tasksController.assignTask);

export default router;

