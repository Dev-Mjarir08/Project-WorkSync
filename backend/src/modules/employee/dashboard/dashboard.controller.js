import { asyncHandler } from '../../../utils/asyncHandler.js';
import { ApiResponse } from '../../../utils/ApiResponse.js';
import * as dashboardService from './dashboard.service.js';
import { getWorkspaceId } from '../../../utils/workspaceHelper.js';

export const getDashboardOverview = asyncHandler(async (req, res) => {
  const wsId = await getWorkspaceId(req);
  const data = await dashboardService.getEmployeeDashboardOverview(wsId, req.user);
  return res.status(200).json(new ApiResponse(200, data, 'Employee dashboard overview fetched successfully'));
});

export const getDashboardStats = asyncHandler(async (req, res) => {
  const wsId = await getWorkspaceId(req);
  const data = await dashboardService.getEmployeeDashboardStats(wsId, req.user);
  return res.status(200).json(new ApiResponse(200, data, 'Dashboard statistics fetched successfully'));
});

export const getMyProjects = asyncHandler(async (req, res) => {
  const wsId = await getWorkspaceId(req);
  const data = await dashboardService.getEmployeeAssignedProjects(wsId, req.user);
  return res.status(200).json(new ApiResponse(200, { projects: data }, 'Assigned projects fetched successfully'));
});

export const getTaskOverview = asyncHandler(async (req, res) => {
  const wsId = await getWorkspaceId(req);
  const data = await dashboardService.getEmployeeTaskOverview(wsId, req.user);
  return res.status(200).json(new ApiResponse(200, data, 'Task status statistics fetched successfully'));
});

export const getRecentTasks = asyncHandler(async (req, res) => {
  const wsId = await getWorkspaceId(req);
  const limit = req.query.limit ? parseInt(req.query.limit, 10) : 10;
  const data = await dashboardService.getEmployeeRecentTasks(wsId, req.user, limit);
  return res.status(200).json(new ApiResponse(200, { tasks: data }, 'Recent tasks fetched successfully'));
});

export const getOverdueTasks = asyncHandler(async (req, res) => {
  const wsId = await getWorkspaceId(req);
  const data = await dashboardService.getEmployeeOverdueTasks(wsId, req.user);
  return res.status(200).json(new ApiResponse(200, { tasks: data }, 'Overdue tasks fetched successfully'));
});

export const getRecentActivities = asyncHandler(async (req, res) => {
  const wsId = await getWorkspaceId(req);
  const limit = req.query.limit ? parseInt(req.query.limit, 10) : 15;
  const data = await dashboardService.getEmployeeRecentActivities(wsId, req.user, limit);
  return res.status(200).json(new ApiResponse(200, { activities: data }, 'Recent activities fetched successfully'));
});

export const getTeamPerformance = asyncHandler(async (req, res) => {
  const wsId = await getWorkspaceId(req);
  const data = await dashboardService.getEmployeeTeamPerformance(wsId);
  return res.status(200).json(new ApiResponse(200, data, 'Team performance overview fetched successfully'));
});

export const getUpcomingDeadlines = asyncHandler(async (req, res) => {
  const wsId = await getWorkspaceId(req);
  const limit = req.query.limit ? parseInt(req.query.limit, 10) : 10;
  const data = await dashboardService.getEmployeeUpcomingDeadlines(wsId, req.user, limit);
  return res.status(200).json(new ApiResponse(200, { tasks: data }, 'Upcoming deadlines fetched successfully'));
});
