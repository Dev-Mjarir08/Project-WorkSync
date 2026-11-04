import { Router } from 'express';
import * as workspacesController from './workspaces.controller.js';
import * as adminsController from '../admins/admins.controller.js';
import { validateRequest } from '../../../middleware/validateRequest.js';
import {
  workspaceIdParamSchema,
  adminParamSchema,
  getWorkspacesQuerySchema,
  createWorkspaceSchema,
  updateWorkspaceSchema,
  updateWorkspaceStatusSchema,
  assignWorkspaceAdminSchema,
  updateWorkspaceAdminSchema
} from '../superAdmin.validation.js';

const router = Router();

router.get('/', validateRequest(getWorkspacesQuerySchema, 'query'), workspacesController.getWorkspaces);
router.post('/', validateRequest(createWorkspaceSchema, 'body'), workspacesController.createWorkspace);
router.get('/:workspaceId', validateRequest(workspaceIdParamSchema, 'params'), workspacesController.getWorkspaceById);
router.patch(
  '/:workspaceId',
  validateRequest(workspaceIdParamSchema, 'params'),
  validateRequest(updateWorkspaceSchema, 'body'),
  workspacesController.updateWorkspace
);
router.patch(
  '/:workspaceId/status',
  validateRequest(workspaceIdParamSchema, 'params'),
  validateRequest(updateWorkspaceStatusSchema, 'body'),
  workspacesController.updateWorkspaceStatus
);
router.delete('/:workspaceId', validateRequest(workspaceIdParamSchema, 'params'), workspacesController.deleteWorkspace);
router.get('/:workspaceId/members', validateRequest(workspaceIdParamSchema, 'params'), workspacesController.getWorkspaceMembers);
router.get('/:workspaceId/boards', validateRequest(workspaceIdParamSchema, 'params'), workspacesController.getWorkspaceBoards);
router.get('/:workspaceId/activities', validateRequest(workspaceIdParamSchema, 'params'), workspacesController.getWorkspaceActivities);
router.get('/:workspaceId/analytics', validateRequest(workspaceIdParamSchema, 'params'), workspacesController.getWorkspaceAnalytics);

// Workspace Admin Management routes
router.post(
  '/:workspaceId/admins',
  validateRequest(workspaceIdParamSchema, 'params'),
  validateRequest(assignWorkspaceAdminSchema, 'body'),
  adminsController.assignWorkspaceAdmin
);
router.get('/:workspaceId/admins', validateRequest(workspaceIdParamSchema, 'params'), adminsController.getWorkspaceAdmins);
router.patch(
  '/:workspaceId/admins/:adminId',
  validateRequest(adminParamSchema, 'params'),
  validateRequest(updateWorkspaceAdminSchema, 'body'),
  adminsController.updateWorkspaceAdmin
);
router.delete(
  '/:workspaceId/admins/:adminId',
  validateRequest(adminParamSchema, 'params'),
  adminsController.removeWorkspaceAdmin
);

export default router;
