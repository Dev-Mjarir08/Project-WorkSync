import { asyncHandler } from '../../../utils/asyncHandler.js';
import { ApiResponse } from '../../../utils/ApiResponse.js';
import * as listsService from './lists.service.js';

const getWorkspaceId = (req) => {
  return (
    req.workspace?._id?.toString() ||
    req.params.workspaceId ||
    req.headers['x-workspace-id'] ||
    req.query.workspaceId
  );
};

export const getListById = asyncHandler(async (req, res) => {
  const wsId = getWorkspaceId(req);
  const data = await listsService.getListById(wsId, req.params.listId);
  return res.status(200).json(new ApiResponse(200, { list: data }, 'List details fetched successfully'));
});

export const updateList = asyncHandler(async (req, res) => {
  const wsId = getWorkspaceId(req);
  const data = await listsService.updateList(wsId, req.params.listId, req.body, req.user);
  return res.status(200).json(new ApiResponse(200, { list: data }, 'List updated successfully'));
});

export const deleteList = asyncHandler(async (req, res) => {
  const wsId = getWorkspaceId(req);
  const data = await listsService.deleteList(wsId, req.params.listId, req.user);
  return res.status(200).json(new ApiResponse(200, data, 'List deleted successfully'));
});

export const updateListPosition = asyncHandler(async (req, res) => {
  const wsId = getWorkspaceId(req);
  const newPosition = req.body.position;
  const data = await listsService.updateListPosition(wsId, req.params.listId, newPosition, req.user);
  return res.status(200).json(new ApiResponse(200, { list: data }, 'List position updated successfully'));
});

export const getListTasks = asyncHandler(async (req, res) => {
  const wsId = getWorkspaceId(req);
  const data = await listsService.getListTasks(wsId, req.params.listId);
  return res.status(200).json(new ApiResponse(200, { tasks: data }, 'List tasks fetched successfully'));
});
