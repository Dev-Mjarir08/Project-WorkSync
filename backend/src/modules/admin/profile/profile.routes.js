import { Router } from 'express';
import * as profileController from './profile.controller.js';

const router = Router();

router.get('/', profileController.getProfile);
router.patch('/', profileController.updateProfile);

router.patch('/avatar', profileController.updateAvatar);
router.patch('/change-password', profileController.changePassword);

router.get('/sessions', profileController.getSessions);
router.delete('/sessions/:sessionId', profileController.revokeSession);

export default router;

