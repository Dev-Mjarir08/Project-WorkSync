import { asyncHandler } from '../../../utils/asyncHandler.js';
import { ApiResponse } from '../../../utils/ApiResponse.js';
import * as dashboardService from './dashboard.service.js';

export const getWorkspaceDashboard = asyncHandler(async (req, res) => {
  const workspaceId = req.workspace?._id || req.headers['x-workspace-id'];
  const data = await dashboardService.getAdminDashboardMetrics(workspaceId);
  return res.status(200).json(new ApiResponse(200, data, 'Admin dashboard metrics retrieved successfully'));
});

