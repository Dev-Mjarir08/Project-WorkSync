import { Router } from 'express';
import * as projectsController from './projects.controller.js';

const router = Router();

router.get('/', projectsController.getProjects);
router.post('/', projectsController.createProject);

router.get('/:projectId', projectsController.getProjectById);
router.patch('/:projectId', projectsController.updateProject);
router.delete('/:projectId', projectsController.deleteProject);

router.patch('/:projectId/status', projectsController.updateProjectStatus);

router.get('/:projectId/members', projectsController.getProjectMembers);
router.post('/:projectId/members', projectsController.addProjectMembers);
router.delete('/:projectId/members/:memberId', projectsController.removeProjectMember);

router.get('/:projectId/boards', projectsController.getProjectBoards);
router.get('/:projectId/activities', projectsController.getProjectActivities);

export default router;
