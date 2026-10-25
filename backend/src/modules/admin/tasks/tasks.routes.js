import { Router } from 'express';
import * as tasksController from './tasks.controller.js';

const router = Router();

router.get('/', tasksController.getTasks);
router.post('/', tasksController.createTask);

router.get('/overdue', tasksController.getOverdueTasks);
router.get('/unassigned', tasksController.getUnassignedTasks);

router.get('/:taskId', tasksController.getTaskById);
router.patch('/:taskId', tasksController.updateTask);
router.delete('/:taskId', tasksController.deleteTask);

router.patch('/:taskId/assign', tasksController.assignTask);
router.patch('/:taskId/status', tasksController.updateTaskStatus);
router.patch('/:taskId/priority', tasksController.updateTaskPriority);
router.patch('/:taskId/due-date', tasksController.updateTaskDueDate);
router.patch('/:taskId/move', tasksController.moveTask);

export default router;
