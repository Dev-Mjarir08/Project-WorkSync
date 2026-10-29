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

// ==========================================
// Public Authentication Routes
// ==========================================

// Register a new user
router.post(
  '/register',
  authLimiter,
  validateRequest(registerSchema),
  authController.register
);

// Login existing user
router.post(
  '/login',
  authLimiter,
  validateRequest(loginSchema),
  authController.login
);

// ==========================================
// Protected Routes (Require Valid JWT Token)
// ==========================================

// Get current authenticated user profile
router.get(
  '/me',
  authenticate,
  authController.getMe
);

// Refresh auth token
router.post(
  '/refresh',
  authenticate,
  authController.refreshToken
);

// Update user profile information
router.put(
  '/profile',
  authenticate,
  validateRequest(updateProfileSchema),
  authController.updateProfile
);

// Change user password
router.put(
  '/change-password',
  authenticate,
  validateRequest(changePasswordSchema),
  authController.changePassword
);

// Logout (clear session/cookie)
router.post(
  '/logout',
  authenticate,
  authController.logout
);

export default router;
