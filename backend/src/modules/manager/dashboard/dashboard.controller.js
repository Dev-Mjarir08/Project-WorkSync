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
  const data = await dashboardService.getManagerDashboardOverview(wsId, req.user);
  return res.status(200).json(new ApiResponse(200, data, 'Manager dashboard overview fetched successfully'));
});

export const getDashboardStats = asyncHandler(async (req, res) => {
  const wsId = getWorkspaceId(req);
  const data = await dashboardService.getManagerDashboardStats(wsId, req.user);
  return res.status(200).json(new ApiResponse(200, data, 'Manager dashboard statistics fetched successfully'));
});

export const getMyProjects = asyncHandler(async (req, res) => {
  const wsId = getWorkspaceId(req);
  const data = await dashboardService.getManagerAssignedProjects(wsId, req.user);
  return res.status(200).json(new ApiResponse(200, { projects: data }, 'Assigned projects fetched successfully'));
});

export const getTaskOverview = asyncHandler(async (req, res) => {
  const wsId = getWorkspaceId(req);
  const data = await dashboardService.getManagerTaskOverview(wsId, req.user);
  return res.status(200).json(new ApiResponse(200, data, 'Task status statistics fetched successfully'));
});

export const getRecentTasks = asyncHandler(async (req, res) => {
  const wsId = getWorkspaceId(req);
  const limit = req.query.limit ? parseInt(req.query.limit, 10) : 10;
  const data = await dashboardService.getManagerRecentTasks(wsId, req.user, limit);
  return res.status(200).json(new ApiResponse(200, { tasks: data }, 'Recent tasks fetched successfully'));
});

export const getOverdueTasks = asyncHandler(async (req, res) => {
  const wsId = getWorkspaceId(req);
  const data = await dashboardService.getManagerOverdueTasks(wsId, req.user);
  return res.status(200).json(new ApiResponse(200, { tasks: data }, 'Overdue tasks fetched successfully'));
});

export const getRecentActivities = asyncHandler(async (req, res) => {
  const wsId = getWorkspaceId(req);
  const limit = req.query.limit ? parseInt(req.query.limit, 10) : 10;
  const data = await dashboardService.getManagerRecentActivities(wsId, req.user, limit);
  return res.status(200).json(new ApiResponse(200, { activities: data }, 'Recent team activities fetched successfully'));
});

export const getTeamPerformance = asyncHandler(async (req, res) => {
  const wsId = getWorkspaceId(req);
  const data = await dashboardService.getManagerTeamPerformance(wsId, req.user);
  return res.status(200).json(new ApiResponse(200, { teamPerformance: data }, 'Team performance overview fetched successfully'));
});

export const getUpcomingDeadlines = asyncHandler(async (req, res) => {
  const wsId = getWorkspaceId(req);
  const days = req.query.days ? parseInt(req.query.days, 10) : 7;
  const data = await dashboardService.getManagerUpcomingDeadlines(wsId, req.user, days);
  return res.status(200).json(new ApiResponse(200, { upcomingDeadlines: data }, 'Upcoming task deadlines fetched successfully'));
});
