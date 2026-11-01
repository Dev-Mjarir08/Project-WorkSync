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

// =========================================================================
// WORKSPACES CONTROLLERS
// =========================================================================

/**
 * GET /workspaces
 * Purpose: All workspaces
 */
export const getWorkspaces = asyncHandler(async (req, res) => {
  const query = req.validated?.query || req.query;
  const result = await superAdminService.getAllWorkspaces(query);

  return res
    .status(200)
    .json(new ApiResponse(200, result, 'Platform workspaces retrieved successfully.'));
});

/**
 * GET /workspaces/:workspaceId
 * Purpose: Workspace details
 */
export const getWorkspaceById = asyncHandler(async (req, res) => {
  const workspaceId = req.validated?.params?.workspaceId || req.params.workspaceId;
  const workspace = await superAdminService.getWorkspaceById(workspaceId);

  return res
    .status(200)
    .json(new ApiResponse(200, { workspace }, 'Workspace details retrieved successfully.'));
});

/**
 * PATCH /workspaces/:workspaceId/status
 * Purpose: Activate/deactivate workspace
 */
export const updateWorkspaceStatus = asyncHandler(async (req, res) => {
  const workspaceId = req.validated?.params?.workspaceId || req.params.workspaceId;
  const body = req.validated?.body || req.body;

  const workspace = await superAdminService.updateWorkspaceStatus(workspaceId, {
    status: body?.status,
    isActive: body?.isActive,
    currentAdminId: req.user?._id
  });

  return res
    .status(200)
    .json(new ApiResponse(200, { workspace }, `Workspace status updated to '${workspace.status}' successfully.`));
});

/**
 * DELETE /workspaces/:workspaceId
 * Purpose: Delete workspace
 */
export const deleteWorkspace = asyncHandler(async (req, res) => {
  const workspaceId = req.validated?.params?.workspaceId || req.params.workspaceId;

  const result = await superAdminService.deleteWorkspace(workspaceId, {
    currentAdminId: req.user?._id
  });

  return res
    .status(200)
    .json(new ApiResponse(200, result, 'Workspace deleted successfully.'));
});

/**
 * POST /workspaces
 * Purpose: Create workspace
 */
export const createWorkspace = asyncHandler(async (req, res) => {
  const body = req.validated?.body || req.body;
  const workspace = await superAdminService.createWorkspace(body);

  return res
    .status(201)
    .json(new ApiResponse(201, { workspace }, 'Workspace provisioned successfully.'));
});

// =========================================================================
// PLATFORM ANALYTICS CONTROLLER
// =========================================================================

/**
 * GET /analytics
 * Purpose: Platform analytics
 */
export const getAnalytics = asyncHandler(async (req, res) => {
  const data = await superAdminService.getPlatformAnalytics();

  return res
    .status(200)
    .json(new ApiResponse(200, data, 'Platform analytics retrieved successfully.'));
});

// =========================================================================
// AUDIT LOGS CONTROLLER
// =========================================================================

/**
 * GET /audit-logs
 * Purpose: Platform audit logs
 */
export const getAuditLogs = asyncHandler(async (req, res) => {
  const query = req.validated?.query || req.query;
  const result = await superAdminService.getAuditLogs(query);

  return res
    .status(200)
    .json(new ApiResponse(200, result, 'Platform audit logs retrieved successfully.'));
});

// =========================================================================
// PLATFORM SETTINGS CONTROLLER
// =========================================================================

/**
 * GET /settings
 * Purpose: Platform settings
 */
export const getSettings = asyncHandler(async (req, res) => {
  const settings = await superAdminService.getPlatformSettings();

  return res
    .status(200)
    .json(new ApiResponse(200, { settings }, 'Platform settings retrieved successfully.'));
});

/**
 * PATCH /settings
 * Purpose: Update platform settings
 */
export const updateSettings = asyncHandler(async (req, res) => {
  const body = req.validated?.body || req.body;

  const settings = await superAdminService.updatePlatformSettings(body, {
    currentAdminId: req.user?._id
  });

  return res
    .status(200)
    .json(new ApiResponse(200, { settings }, 'Platform settings updated successfully.'));
});

export default {
  getDashboard,
  getUsers,
  getUserById,
  updateUserStatus,
  updateUserRole,
  deleteUser,
  createUser,
  getWorkspaces,
  getWorkspaceById,
  updateWorkspaceStatus,
  deleteWorkspace,
  createWorkspace,
  getAnalytics,
  getAuditLogs,
  getSettings,
  updateSettings
};
