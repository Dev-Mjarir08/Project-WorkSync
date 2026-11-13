import { asyncHandler } from '../../../utils/asyncHandler.js';
import { ApiResponse } from '../../../utils/ApiResponse.js';
import * as teamService from './team.service.js';

const getWorkspaceId = (req) => {
  return (
    req.workspace?._id?.toString() ||
    req.params.workspaceId ||
    req.headers['x-workspace-id'] ||
    req.query.workspaceId
  );
};

export const getTeamMembers = asyncHandler(async (req, res) => {
  const wsId = getWorkspaceId(req);
  const data = await teamService.getTeamMembers(wsId, req.query);
  return res.status(200).json(new ApiResponse(200, data, 'Team members fetched successfully'));
});

export const getTeamWorkload = asyncHandler(async (req, res) => {
  const wsId = getWorkspaceId(req);
  const data = await teamService.getTeamWorkload(wsId);
  return res.status(200).json(new ApiResponse(200, data, 'Overall team workload fetched successfully'));
});

export const getTeamPerformance = asyncHandler(async (req, res) => {
  const wsId = getWorkspaceId(req);
  const data = await teamService.getTeamPerformance(wsId);
  return res.status(200).json(new ApiResponse(200, data, 'Team performance analytics fetched successfully'));
});

export const getTeamAvailability = asyncHandler(async (req, res) => {
  const wsId = getWorkspaceId(req);
  const data = await teamService.getTeamAvailability(wsId);
  return res.status(200).json(new ApiResponse(200, data, 'Team availability fetched successfully'));
});

export const getMemberDetails = asyncHandler(async (req, res) => {
  const wsId = getWorkspaceId(req);
  const data = await teamService.getMemberDetails(wsId, req.params.memberId);
  return res.status(200).json(new ApiResponse(200, { member: data }, 'Member details fetched successfully'));
});

export const getMemberTasks = asyncHandler(async (req, res) => {
  const wsId = getWorkspaceId(req);
  const data = await teamService.getMemberTasks(wsId, req.params.memberId, req.query);
  return res.status(200).json(new ApiResponse(200, data, 'Member assigned tasks fetched successfully'));
});

export const getMemberProjects = asyncHandler(async (req, res) => {
  const wsId = getWorkspaceId(req);
  const data = await teamService.getMemberProjects(wsId, req.params.memberId);
  return res.status(200).json(new ApiResponse(200, data, 'Member projects fetched successfully'));
});

export const getMemberActivities = asyncHandler(async (req, res) => {
  const wsId = getWorkspaceId(req);
  const data = await teamService.getMemberActivities(wsId, req.params.memberId, req.query);
  return res.status(200).json(new ApiResponse(200, data, 'Member activities fetched successfully'));
});

export const getMemberWorkload = asyncHandler(async (req, res) => {
  const wsId = getWorkspaceId(req);
  const data = await teamService.getMemberWorkload(wsId, req.params.memberId);
  return res.status(200).json(new ApiResponse(200, { workload: data }, 'Individual workload fetched successfully'));
});
