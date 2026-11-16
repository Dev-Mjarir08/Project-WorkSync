import { asyncHandler } from '../../../utils/asyncHandler.js';
import { ApiResponse } from '../../../utils/ApiResponse.js';
import * as dashboardService from './dashboard.service.js';
import { WorkspaceMember } from '../../../models/WorkspaceMember.js';
import { Workspace } from '../../../models/Workspace.js';

const getWorkspaceId = async (req) => {
  const direct = (
    req.workspace?._id?.toString() ||
    req.params.workspaceId ||
    req.headers['x-workspace-id'] ||
    req.query.workspaceId ||
    req.user?.workspaceId?.toString()
  );
  if (direct) return direct;

  if (req.user?._id) {
    const member = await WorkspaceMember.findOne({ user: req.user._id, status: 'active' }).select('workspace');
    if (member?.workspace) return member.workspace.toString();

    const ownerWs = await Workspace.findOne({
      $or: [{ owner: req.user._id }, { createdBy: req.user._id }],
      isActive: true
    }).select('_id');
    if (ownerWs?._id) return ownerWs._id.toString();
  }

  const defaultWs = await Workspace.findOne({ isActive: true }).select('_id');
  return defaultWs?._id?.toString() || null;
};

export const getDashboardOverview = asyncHandler(async (req, res) => {
  const wsId = await getWorkspaceId(req);
  const data = await dashboardService.getManagerDashboardOverview(wsId, req.user);
  return res.status(200).json(new ApiResponse(200, data, 'Manager dashboard overview fetched successfully'));
});

export const getDashboardStats = asyncHandler(async (req, res) => {
  const wsId = await getWorkspaceId(req);
  const data = await dashboardService.getManagerDashboardStats(wsId, req.user);
  return res.status(200).json(new ApiResponse(200, data, 'Manager dashboard statistics fetched successfully'));
});

export const getMyProjects = asyncHandler(async (req, res) => {
  const wsId = await getWorkspaceId(req);
  const data = await dashboardService.getManagerAssignedProjects(wsId, req.user);
  return res.status(200).json(new ApiResponse(200, { projects: data }, 'Assigned projects fetched successfully'));
});

export const getTaskOverview = asyncHandler(async (req, res) => {
  const wsId = await getWorkspaceId(req);
  const data = await dashboardService.getManagerTaskOverview(wsId, req.user);
  return res.status(200).json(new ApiResponse(200, data, 'Task status statistics fetched successfully'));
});

export const getRecentTasks = asyncHandler(async (req, res) => {
  const wsId = await getWorkspaceId(req);
  const limit = req.query.limit ? parseInt(req.query.limit, 10) : 10;
  const data = await dashboardService.getManagerRecentTasks(wsId, req.user, limit);
  return res.status(200).json(new ApiResponse(200, { tasks: data }, 'Recent tasks fetched successfully'));
});

export const getOverdueTasks = asyncHandler(async (req, res) => {
  const wsId = await getWorkspaceId(req);
  const data = await dashboardService.getManagerOverdueTasks(wsId, req.user);
  return res.status(200).json(new ApiResponse(200, { tasks: data }, 'Overdue tasks fetched successfully'));
});

export const getRecentActivities = asyncHandler(async (req, res) => {
  const wsId = await getWorkspaceId(req);
  const limit = req.query.limit ? parseInt(req.query.limit, 10) : 10;
  const data = await dashboardService.getManagerRecentActivities(wsId, req.user, limit);
  return res.status(200).json(new ApiResponse(200, { activities: data }, 'Recent team activities fetched successfully'));
});

export const getTeamPerformance = asyncHandler(async (req, res) => {
  const wsId = await getWorkspaceId(req);
  const data = await dashboardService.getManagerTeamPerformance(wsId, req.user);
  return res.status(200).json(new ApiResponse(200, { teamPerformance: data }, 'Team performance overview fetched successfully'));
});

export const getUpcomingDeadlines = asyncHandler(async (req, res) => {
  const wsId = await getWorkspaceId(req);
  const days = req.query.days ? parseInt(req.query.days, 10) : 7;
  const data = await dashboardService.getManagerUpcomingDeadlines(wsId, req.user, days);
  return res.status(200).json(new ApiResponse(200, { upcomingDeadlines: data }, 'Upcoming task deadlines fetched successfully'));
});
