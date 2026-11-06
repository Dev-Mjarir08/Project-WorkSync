import { Router } from 'express';
import * as rolesController from './roles.controller.js';

const router = Router();

router.get('/', rolesController.getRoles);
router.post('/', rolesController.createCustomRole);
router.get('/permissions', rolesController.getAvailablePermissions);

router.get('/:roleId', rolesController.getRoleById);
router.patch('/:roleId', rolesController.updateCustomRole);
router.delete('/:roleId', rolesController.deleteCustomRole);

router.get('/:roleId/permissions', rolesController.getRolePermissions);
router.patch('/:roleId/permissions', rolesController.updateRolePermissions);

export default router;
