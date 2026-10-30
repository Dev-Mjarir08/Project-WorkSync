import { asyncHandler } from '../../utils/asyncHandler.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import * as superAdminService from './superAdmin.service.js';

/**
 * GET /dashboard
 * Purpose: Platform statistics
 */
export const getDashboard = asyncHandler(async (req, res) => {
  const data = await superAdminService.getDashboardStatistics();

  return res
    .status(200)
    .json(new ApiResponse(200, data, 'Platform dashboard statistics retrieved successfully.'));
});

/**
 * GET /users
 * Purpose: All platform users
 */
export const getUsers = asyncHandler(async (req, res) => {
  const query = req.validated?.query || req.query;
  const result = await superAdminService.getAllUsers(query);

  return res
    .status(200)
    .json(new ApiResponse(200, result, 'Platform users retrieved successfully.'));
});

/**
 * GET /users/:userId
 * Purpose: User details
 */
export const getUserById = asyncHandler(async (req, res) => {
  const userId = req.validated?.params?.userId || req.params.userId;
  const user = await superAdminService.getUserById(userId);

  return res
    .status(200)
    .json(new ApiResponse(200, { user }, 'User details retrieved successfully.'));
});

/**
 * PATCH /users/:userId/status
 * Purpose: Activate/deactivate user
 */
export const updateUserStatus = asyncHandler(async (req, res) => {
  const userId = req.validated?.params?.userId || req.params.userId;
  const body = req.validated?.body || req.body;

  const user = await superAdminService.updateUserStatus(userId, {
    isActive: body?.isActive,
    currentAdminId: req.user?._id
  });

  const statusAction = user.isActive ? 'activated' : 'deactivated';

  return res
    .status(200)
    .json(new ApiResponse(200, { user }, `User has been successfully ${statusAction}.`));
});

/**
 * PATCH /users/:userId/role
 * Purpose: Manage platform role
 */
export const updateUserRole = asyncHandler(async (req, res) => {
  const userId = req.validated?.params?.userId || req.params.userId;
  const body = req.validated?.body || req.body;

  const user = await superAdminService.updateUserRole(userId, {
    role: body.role,
    currentAdminId: req.user?._id
  });

  return res
    .status(200)
    .json(new ApiResponse(200, { user }, `User role updated to '${user.role}' successfully.`));
});

/**
 * DELETE /users/:userId
 * Purpose: Delete user
 */
export const deleteUser = asyncHandler(async (req, res) => {
  const userId = req.validated?.params?.userId || req.params.userId;

  const result = await superAdminService.deleteUser(userId, {
    currentAdminId: req.user?._id
  });

  return res
    .status(200)
    .json(new ApiResponse(200, result, 'User deleted successfully.'));
});

/**
 * POST /users
 * Purpose: Create user directly by super admin
 */
export const createUser = asyncHandler(async (req, res) => {
  const body = req.validated?.body || req.body;
  const user = await superAdminService.createPlatformUser(body);

  return res
    .status(201)
    .json(new ApiResponse(201, { user }, 'Platform user created successfully.'));
});

export default {
  getDashboard,
  getUsers,
  getUserById,
  updateUserStatus,
  updateUserRole,
  deleteUser,
  createUser
};
