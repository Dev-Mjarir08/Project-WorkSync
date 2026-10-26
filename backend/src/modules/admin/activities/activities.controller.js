import { asyncHandler } from '../../../utils/asyncHandler.js';
import { ApiResponse } from '../../../utils/ApiResponse.js';
import * as activitiesService from './activities.service.js';

const getWorkspaceId = (req) => {
  return (
    req.workspace?._id?.toString() ||
    req.params.workspaceId ||
    req.headers['x-workspace-id'] ||
    req.query.workspaceId
  );
};

export const getActivities = asyncHandler(async (req, res) => {
  const wsId = getWorkspaceId(req);
  const data = await activitiesService.getActivities(wsId, req.query);
  return res.status(200).json(new ApiResponse(200, data, 'Workspace activities fetched successfully'));
});

export const getActivityById = asyncHandler(async (req, res) => {
  const wsId = getWorkspaceId(req);
  const data = await activitiesService.getActivityById(wsId, req.params.activityId);
  return res.status(200).json(new ApiResponse(200, { activity: data }, 'Activity details fetched successfully'));
});

export const getMemberActivities = asyncHandler(async (req, res) => {
  const wsId = getWorkspaceId(req);
  const data = await activitiesService.getMemberActivities(wsId, req.params.memberId, req.query);
  return res.status(200).json(new ApiResponse(200, data, 'Member activities fetched successfully'));
});

export const getBoardActivities = asyncHandler(async (req, res) => {
  const wsId = getWorkspaceId(req);
  const data = await activitiesService.getBoardActivities(wsId, req.params.boardId, req.query);
  return res.status(200).json(new ApiResponse(200, data, 'Board activities fetched successfully'));
});

export const getTaskActivities = asyncHandler(async (req, res) => {
  const wsId = getWorkspaceId(req);
  const data = await activitiesService.getTaskActivities(wsId, req.params.taskId, req.query);
  return res.status(200).json(new ApiResponse(200, data, 'Task activities fetched successfully'));
});
