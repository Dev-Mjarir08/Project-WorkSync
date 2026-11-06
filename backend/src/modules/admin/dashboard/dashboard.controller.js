import { asyncHandler } from '../../../utils/asyncHandler.js';
import { ApiResponse } from '../../../utils/ApiResponse.js';
import * as dashboardService from './dashboard.service.js';

const getWorkspaceId = (req) => {
  return (
    req.workspace?._id?.toString() ||
    req.params.workspaceId ||
    req.headers['x-workspace-id'] ||
    req.query.workspaceId
  );
};

export const getDashboardOverview = asyncHandler(async (req, res) => {
  const wsId = getWorkspaceId(req);
  const data = await dashboardService.getWorkspaceDashboardOverview(wsId);
  return res.status(200).json(new ApiResponse(200, data, 'Workspace dashboard overview fetched successfully'));
});

export const getDashboardStats = asyncHandler(async (req, res) => {
  const wsId = getWorkspaceId(req);
  const data = await dashboardService.getWorkspaceDashboardStats(wsId);
  return res.status(200).json(new ApiResponse(200, data, 'Workspace statistics fetched successfully'));
});

export const getMemberGrowth = asyncHandler(async (req, res) => {
  const wsId = getWorkspaceId(req);
  const days = req.query.days ? parseInt(req.query.days, 10) : 30;
  const data = await dashboardService.getWorkspaceMemberGrowth(wsId, days);
  return res.status(200).json(new ApiResponse(200, data, 'Member growth data fetched successfully'));
});

export const getTaskOverview = asyncHandler(async (req, res) => {
  const wsId = getWorkspaceId(req);
  const data = await dashboardService.getWorkspaceTaskOverview(wsId);
  return res.status(200).json(new ApiResponse(200, data, 'Task status statistics fetched successfully'));
});

export const getRecentMembers = asyncHandler(async (req, res) => {
  const wsId = getWorkspaceId(req);
  const limit = req.query.limit ? parseInt(req.query.limit, 10) : 5;
  const data = await dashboardService.getWorkspaceRecentMembers(wsId, limit);
  return res.status(200).json(new ApiResponse(200, { members: data }, 'Recently joined members fetched successfully'));
});

export const getRecentBoards = asyncHandler(async (req, res) => {
  const wsId = getWorkspaceId(req);
  const limit = req.query.limit ? parseInt(req.query.limit, 10) : 5;
  const data = await dashboardService.getWorkspaceRecentBoards(wsId, limit);
  return res.status(200).json(new ApiResponse(200, { boards: data }, 'Recently created boards fetched successfully'));
});

export const getRecentActivities = asyncHandler(async (req, res) => {
  const wsId = getWorkspaceId(req);
  const limit = req.query.limit ? parseInt(req.query.limit, 10) : 10;
  const data = await dashboardService.getWorkspaceRecentActivities(wsId, limit);
  return res.status(200).json(new ApiResponse(200, { activities: data }, 'Recent activities fetched successfully'));
});

export const getOverdueTasks = asyncHandler(async (req, res) => {
  const wsId = getWorkspaceId(req);
  const data = await dashboardService.getWorkspaceOverdueTasks(wsId);
  return res.status(200).json(new ApiResponse(200, data, 'Overdue task statistics fetched successfully'));
});
