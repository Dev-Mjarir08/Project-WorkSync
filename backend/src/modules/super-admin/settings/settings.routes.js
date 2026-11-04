import { Router } from 'express';
import * as settingsController from './settings.controller.js';
import { validateRequest } from '../../../middleware/validateRequest.js';
import {
  updateGeneralSettingsSchema,
  updateSecuritySettingsSchema,
  updateRegistrationSettingsSchema,
  updateNotificationSettingsSchema
} from '../superAdmin.validation.js';

const router = Router();

router.get('/', settingsController.getSettings);
router.patch('/general', validateRequest(updateGeneralSettingsSchema, 'body'), settingsController.updateGeneralSettings);
router.patch('/security', validateRequest(updateSecuritySettingsSchema, 'body'), settingsController.updateSecuritySettings);
router.patch('/registration', validateRequest(updateRegistrationSettingsSchema, 'body'), settingsController.updateRegistrationSettings);
router.patch('/notifications', validateRequest(updateNotificationSettingsSchema, 'body'), settingsController.updateNotificationSettings);
router.get('/security', settingsController.getSecurityConfiguration);

export default router;

