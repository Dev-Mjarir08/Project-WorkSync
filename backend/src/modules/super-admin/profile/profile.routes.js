import { Router } from 'express';
import * as profileController from './profile.controller.js';
import { validateRequest } from '../../../middleware/validateRequest.js';
import {
  updateProfileSchema,
  updateAvatarSchema,
  changePasswordSchema
} from '../superAdmin.validation.js';

const router = Router();

router.get('/', profileController.getProfile);
router.patch('/', validateRequest(updateProfileSchema, 'body'), profileController.updateProfile);
router.patch('/avatar', validateRequest(updateAvatarSchema, 'body'), profileController.updateAvatar);
router.patch('/change-password', validateRequest(changePasswordSchema, 'body'), profileController.changePassword);
router.get('/sessions', profileController.getProfileSessions);
router.delete('/sessions/:sessionId', profileController.revokeProfileSession);

export default router;

