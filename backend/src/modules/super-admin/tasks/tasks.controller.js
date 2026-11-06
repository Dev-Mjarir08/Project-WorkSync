import { asyncHandler } from '../../../utils/asyncHandler.js';
import { ApiResponse } from '../../../utils/ApiResponse.js';
import * as tasksService from './tasks.service.js';

export const getAllTasks = asyncHandler(async (req, res) => {
  const result = await tasksService.getAllTasks(req.query);
  return res.status(200).json(new ApiResponse(200, result, 'Platform tasks retrieved successfully'));
});

export const createTask = asyncHandler(async (req, res) => {
  const task = await tasksService.createTask(req.body, req.user);
  return res.status(201).json(new ApiResponse(201, { task }, 'Task created successfully'));
});

export const getTaskById = asyncHandler(async (req, res) => {
  const task = await tasksService.getTaskById(req.params.taskId);
  return res.status(200).json(new ApiResponse(200, { task }, 'Task details retrieved successfully'));
});

export const updateTask = asyncHandler(async (req, res) => {
  const task = await tasksService.updateTask(req.params.taskId, req.body, req.user);
  return res.status(200).json(new ApiResponse(200, { task }, 'Task updated successfully'));
});

export const updateTaskStatus = asyncHandler(async (req, res) => {
  const result = await tasksService.updateTaskStatus(req.params.taskId, req.body.status, req.user);
  return res.status(200).json(new ApiResponse(200, result, 'Task status updated successfully'));
});

export const assignTask = asyncHandler(async (req, res) => {
  const assigneeId = req.body.assigneeId ?? req.body.assignee ?? req.body.userId;
  const task = await tasksService.assignTask(req.params.taskId, assigneeId, req.user);
  return res.status(200).json(new ApiResponse(200, { task }, 'Task assigned successfully'));
});

export const deleteTask = asyncHandler(async (req, res) => {
  const result = await tasksService.deleteTask(req.params.taskId, req.user);
  return res.status(200).json(new ApiResponse(200, result, 'Task deleted successfully'));
});

