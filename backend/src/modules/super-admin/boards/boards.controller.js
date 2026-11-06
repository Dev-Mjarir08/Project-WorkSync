import { asyncHandler } from '../../../utils/asyncHandler.js';
import { ApiResponse } from '../../../utils/ApiResponse.js';
import * as boardsService from './boards.service.js';

export const getBoards = asyncHandler(async (req, res) => {
  const result = await boardsService.getAllBoards(req.query);
  return res.status(200).json(new ApiResponse(200, result, 'Platform boards retrieved successfully'));
});

export const getBoardById = asyncHandler(async (req, res) => {
  const board = await boardsService.getBoardById(req.params.boardId);
  return res.status(200).json(new ApiResponse(200, { board }, 'Board details retrieved successfully'));
});

export const updateBoard = asyncHandler(async (req, res) => {
  const board = await boardsService.updateBoard(req.params.boardId, req.body, req.user);
  return res.status(200).json(new ApiResponse(200, { board }, 'Board updated successfully'));
});

export const updateBoardStatus = asyncHandler(async (req, res) => {
  const board = await boardsService.updateBoardStatus(req.params.boardId, req.body.isArchived, req.user);
  return res.status(200).json(new ApiResponse(200, { board }, 'Board status updated successfully'));
});

export const deleteBoard = asyncHandler(async (req, res) => {
  const result = await boardsService.deleteBoard(req.params.boardId, req.user);
  return res.status(200).json(new ApiResponse(200, result, 'Board deleted successfully'));
});

export const getBoardTasks = asyncHandler(async (req, res) => {
  const result = await boardsService.getBoardTasks(req.params.boardId);
  return res.status(200).json(new ApiResponse(200, result, 'Board tasks retrieved successfully'));
});

