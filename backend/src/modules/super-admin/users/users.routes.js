import { Router } from 'express';
import * as usersController from './users.controller.js';
import { validateRequest } from '../../../middleware/validateRequest.js';
import {
  userIdParamSchema,
  getUsersQuerySchema,
  createUserSchema,
  updateUserSchema,
  updateUserStatusSchema,
  updateUserRoleSchema
} from '../superAdmin.validation.js';

const router = Router();

router.get('/', validateRequest(getUsersQuerySchema, 'query'), usersController.getUsers);
router.post('/', validateRequest(createUserSchema, 'body'), usersController.createUser);
router.get('/:userId', validateRequest(userIdParamSchema, 'params'), usersController.getUserById);
router.patch(
  '/:userId',
  validateRequest(userIdParamSchema, 'params'),
  validateRequest(updateUserSchema, 'body'),
  usersController.updateUser
);
router.patch(
  '/:userId/status',
  validateRequest(userIdParamSchema, 'params'),
  validateRequest(updateUserStatusSchema, 'body'),
  usersController.updateUserStatus
);
router.patch(
  '/:userId/role',
  validateRequest(userIdParamSchema, 'params'),
  validateRequest(updateUserRoleSchema, 'body'),
  usersController.updateUserRole
);
router.delete('/:userId', validateRequest(userIdParamSchema, 'params'), usersController.deleteUser);
router.get('/:userId/workspaces', validateRequest(userIdParamSchema, 'params'), usersController.getUserWorkspaces);
router.get('/:userId/activities', validateRequest(userIdParamSchema, 'params'), usersController.getUserActivities);
router.get('/:userId/sessions', validateRequest(userIdParamSchema, 'params'), usersController.getUserSessions);
router.delete('/:userId/sessions', validateRequest(userIdParamSchema, 'params'), usersController.revokeUserSessions);

export default router;

