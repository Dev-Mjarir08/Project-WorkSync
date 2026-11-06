import { Router } from 'express';
import * as projectController from './project.controller.js';
import { authenticate } from '../../middleware/authenticate.js';
import { validateRequest } from '../../middleware/validateRequest.js';
import { createProjectSchema, updateProjectSchema } from './project.validation.js';

const router = Router();

router.use(authenticate);

router.get('/', projectController.getProjects);
router.post('/', validateRequest(createProjectSchema, 'body'), projectController.createProject);
router.get('/:projectId', projectController.getProjectById);
router.patch('/:projectId', validateRequest(updateProjectSchema, 'body'), projectController.updateProject);
router.delete('/:projectId', projectController.deleteProject);

export default router;

