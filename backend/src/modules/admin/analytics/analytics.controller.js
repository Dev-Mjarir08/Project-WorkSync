import { asyncHandler } from '../../../utils/asyncHandler.js';
import { ApiResponse } from '../../../utils/ApiResponse.js';
import * as analyticsService from './analytics.service.js';

const getWorkspaceId = (req) => {
  return (
    req.workspace?._id?.toString() ||
    req.params.workspaceId ||
    req.headers['x-workspace-id'] ||
    req.query.workspaceId
  );
};

export const getAnalyticsOverview = asyncHandler(async (req, res) => {
  const wsId = getWorkspaceId(req);
  const data = await analyticsService.getAnalyticsOverview(wsId);
  return res.status(200).json(new ApiResponse(200, data, 'Workspace analytics overview fetched successfully'));
});

export const getMemberStatistics = asyncHandler(async (req, res) => {
  const wsId = getWorkspaceId(req);
  const data = await analyticsService.getMemberStatistics(wsId);
  return res.status(200).json(new ApiResponse(200, data, 'Member statistics fetched successfully'));
});

export const getProjectStatistics = asyncHandler(async (req, res) => {
  const wsId = getWorkspaceId(req);
  const data = await analyticsService.getProjectStatistics(wsId);
  return res.status(200).json(new ApiResponse(200, data, 'Project statistics fetched successfully'));
});

export const getBoardStatistics = asyncHandler(async (req, res) => {
  const wsId = getWorkspaceId(req);
  const data = await analyticsService.getBoardStatistics(wsId);
  return res.status(200).json(new ApiResponse(200, data, 'Board statistics fetched successfully'));
});

export const getTaskStatistics = asyncHandler(async (req, res) => {
  const wsId = getWorkspaceId(req);
  const data = await analyticsService.getTaskStatistics(wsId);
  return res.status(200).json(new ApiResponse(200, data, 'Task statistics fetched successfully'));
});

export const getCompletedTaskStatistics = asyncHandler(async (req, res) => {
  const wsId = getWorkspaceId(req);
  const data = await analyticsService.getCompletedTaskStatistics(wsId);
  return res.status(200).json(new ApiResponse(200, data, 'Completed task statistics fetched successfully'));
});

export const getOverdueTaskStatistics = asyncHandler(async (req, res) => {
  const wsId = getWorkspaceId(req);
  const data = await analyticsService.getOverdueTaskStatistics(wsId);
  return res.status(200).json(new ApiResponse(200, data, 'Overdue task statistics fetched successfully'));
});

export const getTeamProductivity = asyncHandler(async (req, res) => {
  const wsId = getWorkspaceId(req);
  const data = await analyticsService.getTeamProductivity(wsId);
  return res.status(200).json(new ApiResponse(200, data, 'Team productivity fetched successfully'));
});

export const getMemberWorkload = asyncHandler(async (req, res) => {
  const wsId = getWorkspaceId(req);
  const data = await analyticsService.getMemberWorkload(wsId);
  return res.status(200).json(new ApiResponse(200, { workload: data }, 'Member workload fetched successfully'));
});
