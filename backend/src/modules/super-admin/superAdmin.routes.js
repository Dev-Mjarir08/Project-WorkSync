import { Router } from 'express';
import * as superAdminController from './superAdmin.controller.js';
import { authenticate } from '../../middleware/authenticate.js';
import { authorizePlatformRole } from '../../middleware/authorizePlatformRole.js';
import { validateRequest } from '../../middleware/validateRequest.js';
import { ROLES } from '../../constants/roles.js';
import {
  userIdParamSchema,
  updateUserStatusSchema,
  updateUserRoleSchema,
  createUserSchema,
  getUsersQuerySchema
} from './superAdmin.validation.js';

const router = Router();

// =========================================================================
// Protect all Super Admin routes with Authentication & Super Admin Role
// =========================================================================
router.use(authenticate, authorizePlatformRole(ROLES.SUPER_ADMIN));

/**
 * @route   GET /dashboard
 * @desc    Retrieve live platform statistics, system metrics, and growth charts
 * @access  Super Admin
 */
router.get('/dashboard', superAdminController.getDashboard);

/**
 * @route   GET /users
 * @desc    Retrieve all platform users with search, role/status filtering, and pagination
 * @access  Super Admin
 */
router.get(
  '/users',
  validateRequest(getUsersQuerySchema, 'query'),
  superAdminController.getUsers
);

/**
 * @route   POST /users
 * @desc    Create a new user account directly on the platform
 * @access  Super Admin
 */
router.post(
  '/users',
  validateRequest(createUserSchema, 'body'),
  superAdminController.createUser
);

/**
 * @route   GET /users/:userId
 * @desc    Retrieve full user profile and account details by user ID
 * @access  Super Admin
 */
router.get(
  '/users/:userId',
  validateRequest(userIdParamSchema, 'params'),
  superAdminController.getUserById
);

/**
 * @route   PATCH /users/:userId/status
 * @desc    Activate or deactivate user account access
 * @access  Super Admin
 */
router.patch(
  '/users/:userId/status',
  validateRequest(userIdParamSchema, 'params'),
  validateRequest(updateUserStatusSchema, 'body'),
  superAdminController.updateUserStatus
);

/**
 * @route   PATCH /users/:userId/role
 * @desc    Manage and change user platform role (super_admin, admin, member, viewer)
 * @access  Super Admin
 */
router.patch(
  '/users/:userId/role',
  validateRequest(userIdParamSchema, 'params'),
  validateRequest(updateUserRoleSchema, 'body'),
  superAdminController.updateUserRole
);

/**
 * @route   DELETE /users/:userId
 * @desc    Delete user account from the platform
 * @access  Super Admin
 */
router.delete(
  '/users/:userId',
  validateRequest(userIdParamSchema, 'params'),
  superAdminController.deleteUser
);

export default router;
