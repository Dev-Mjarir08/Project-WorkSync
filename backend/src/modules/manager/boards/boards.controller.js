import { asyncHandler } from '../../../utils/asyncHandler.js';
import { ApiResponse } from '../../../utils/ApiResponse.js';
import * as boardsService from './boards.service.js';

const getWorkspaceId = (req) => {
  return (
    req.workspace?._id?.toString() ||
    req.params.workspaceId ||
    req.headers['x-workspace-id'] ||
    req.query.workspaceId
  );
};

export const getBoards = asyncHandler(async (req, res) => {
  const wsId = getWorkspaceId(req);
  const data = await boardsService.getBoards(wsId, req.query);
  return res.status(200).json(new ApiResponse(200, { boards: data }, 'Accessible boards fetched successfully'));
});

export const createBoard = asyncHandler(async (req, res) => {
  const wsId = getWorkspaceId(req);
  const data = await boardsService.createBoard(wsId, req.body, req.user);
  return res.status(201).json(new ApiResponse(201, { board: data }, 'Board created successfully'));
});

export const getBoardById = asyncHandler(async (req, res) => {
  const wsId = getWorkspaceId(req);
  const data = await boardsService.getBoardById(wsId, req.params.boardId);
  return res.status(200).json(new ApiResponse(200, { board: data }, 'Board details fetched successfully'));
});

export const updateBoard = asyncHandler(async (req, res) => {
  const wsId = getWorkspaceId(req);
  const data = await boardsService.updateBoard(wsId, req.params.boardId, req.body, req.user);
  return res.status(200).json(new ApiResponse(200, { board: data }, 'Board updated successfully'));
});

export const deleteBoard = asyncHandler(async (req, res) => {
  const wsId = getWorkspaceId(req);
  const data = await boardsService.deleteBoard(wsId, req.params.boardId, req.user);
  return res.status(200).json(new ApiResponse(200, data, 'Board deleted successfully'));
});

export const updateBoardStatus = asyncHandler(async (req, res) => {
  const wsId = getWorkspaceId(req);
  const isArchived = req.body.isArchived !== undefined ? req.body.isArchived : req.body.status === 'archived';
  const data = await boardsService.updateBoardStatus(wsId, req.params.boardId, isArchived, req.user);
  return res.status(200).json(new ApiResponse(200, data, 'Board status updated successfully'));
});

export const getBoardMembers = asyncHandler(async (req, res) => {
  const wsId = getWorkspaceId(req);
  const data = await boardsService.getBoardMembers(wsId, req.params.boardId);
  return res.status(200).json(new ApiResponse(200, { members: data }, 'Board members fetched successfully'));
});

export const addBoardMember = asyncHandler(async (req, res) => {
  const wsId = getWorkspaceId(req);
  const data = await boardsService.addBoardMember(wsId, req.params.boardId, req.body, req.user);
  return res.status(201).json(new ApiResponse(201, { members: data }, 'Member added to board successfully'));
});

export const removeBoardMember = asyncHandler(async (req, res) => {
  const wsId = getWorkspaceId(req);
  const data = await boardsService.removeBoardMember(wsId, req.params.boardId, req.params.memberId, req.user);
  return res.status(200).json(new ApiResponse(200, data, 'Member removed from board successfully'));
});

export const getBoardActivities = asyncHandler(async (req, res) => {
  const wsId = getWorkspaceId(req);
  const data = await boardsService.getBoardActivities(wsId, req.params.boardId);
  return res.status(200).json(new ApiResponse(200, { activities: data }, 'Board activities fetched successfully'));
});

export const getBoardLists = asyncHandler(async (req, res) => {
  const wsId = getWorkspaceId(req);
  const data = await boardsService.getBoardLists(wsId, req.params.boardId);
  return res.status(200).json(new ApiResponse(200, { lists: data }, 'Board lists fetched successfully'));
});

export const createBoardList = asyncHandler(async (req, res) => {
  const wsId = getWorkspaceId(req);
  const data = await boardsService.createBoardList(wsId, req.params.boardId, req.body, req.user);
  return res.status(201).json(new ApiResponse(201, { list: data }, 'Board list created successfully'));
});
