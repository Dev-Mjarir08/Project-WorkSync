import { Router } from 'express';
import * as workspaceController from './workspace.controller.js';

const router = Router();

router.get('/', workspaceController.getWorkspaceDetails);
router.patch('/', workspaceController.updateWorkspaceDetails);

router.get('/settings', workspaceController.getWorkspaceSettings);
router.patch('/settings', workspaceController.updateWorkspaceSettings);
router.patch('/settings/general', workspaceController.updateGeneralSettings);
router.patch('/settings/privacy', workspaceController.updatePrivacySettings);
router.patch('/settings/notifications', workspaceController.updateNotificationSettings);
router.patch('/settings/permissions', workspaceController.updatePermissionSettings);

router.patch('/status', workspaceController.updateWorkspaceStatus);
router.delete('/', workspaceController.deleteWorkspace);

export default router;

