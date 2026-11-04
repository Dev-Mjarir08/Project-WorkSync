import { Router } from 'express';
import * as rolesController from './roles.controller.js';
import { validateRequest } from '../../../middleware/validateRequest.js';
import {
  roleIdParamSchema,
  createRoleSchema,
  updateRoleSchema,
  updateRolePermissionsSchema
} from '../superAdmin.validation.js';

const router = Router();

router.get('/', rolesController.getRoles);
router.post('/', validateRequest(createRoleSchema, 'body'), rolesController.createRole);
router.get('/:roleId', validateRequest(roleIdParamSchema, 'params'), rolesController.getRoleById);
router.patch(
  '/:roleId',
  validateRequest(roleIdParamSchema, 'params'),
  validateRequest(updateRoleSchema, 'body'),
  rolesController.updateRole
);
router.delete('/:roleId', validateRequest(roleIdParamSchema, 'params'), rolesController.deleteRole);
router.patch(
  '/:roleId/permissions',
  validateRequest(roleIdParamSchema, 'params'),
  validateRequest(updateRolePermissionsSchema, 'body'),
  rolesController.updateRolePermissions
);

export default router;

