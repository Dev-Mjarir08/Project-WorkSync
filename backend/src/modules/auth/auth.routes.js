import { Router } from 'express';
import * as authController from './auth.controller.js';
import { validateRequest } from '../../middleware/validateRequest.js';
import { authenticate } from '../../middleware/authenticate.js';
import { authLimiter } from '../../middleware/rateLimiter.js';
import {
  registerSchema,
  loginSchema,
  updateProfileSchema,
  changePasswordSchema
} from './auth.validation.js';

const router = Router();

router.post(
  '/register',
  authLimiter,
  validateRequest(registerSchema),
  authController.register
);

router.post(
  '/login',
  authLimiter,
  validateRequest(loginSchema),
  authController.login
);

router.get('/me', authenticate, authController.getMe);
router.post('/refresh', authenticate, authController.refreshToken);
router.put(
  '/profile',
  authenticate,
  validateRequest(updateProfileSchema),
  authController.updateProfile
);
router.put(
  '/change-password',
  authenticate,
  validateRequest(changePasswordSchema),
  authController.changePassword
);
router.patch(
  '/change-password',
  authenticate,
  validateRequest(changePasswordSchema),
  authController.changePassword
);
router.post('/logout', authenticate, authController.logout);

export default router;
