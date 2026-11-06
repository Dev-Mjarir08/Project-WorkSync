import { asyncHandler } from '../../../utils/asyncHandler.js';
import { ApiResponse } from '../../../utils/ApiResponse.js';
import * as tasksService from './tasks.service.js';

const getWorkspaceId = (req) => {
  return (
    req.workspace?._id?.toString() ||
    req.params.workspaceId ||
    req.headers['x-workspace-id'] ||
    req.query.workspaceId
  );
};

export const getTasks = asyncHandler(async (req, res) => {
  const wsId = getWorkspaceId(req);
  const data = await tasksService.getTasks(wsId, req.query, req.user);
  return res.status(200).json(new ApiResponse(200, { tasks: data }, 'Accessible tasks fetched successfully'));
});

export const createTask = asyncHandler(async (req, res) => {
  const wsId = getWorkspaceId(req);
  const data = await tasksService.createTask(wsId, req.body, req.user);
  return res.status(201).json(new ApiResponse(201, { task: data }, 'Task created successfully'));
});

export const getOverdueTasks = asyncHandler(async (req, res) => {
  const wsId = getWorkspaceId(req);
  const data = await tasksService.getOverdueTasks(wsId);
  return res.status(200).json(new ApiResponse(200, { tasks: data }, 'All overdue tasks fetched successfully'));
});

export const getUnassignedTasks = asyncHandler(async (req, res) => {
  const wsId = getWorkspaceId(req);
  const data = await tasksService.getUnassignedTasks(wsId);
  return res.status(200).json(new ApiResponse(200, { tasks: data }, 'Unassigned tasks fetched successfully'));
});

export const getCompletedTasks = asyncHandler(async (req, res) => {
  const wsId = getWorkspaceId(req);
  const data = await tasksService.getCompletedTasks(wsId);
  return res.status(200).json(new ApiResponse(200, { tasks: data }, 'Completed tasks fetched successfully'));
});

export const getTaskById = asyncHandler(async (req, res) => {
  const wsId = getWorkspaceId(req);
  const data = await tasksService.getTaskById(wsId, req.params.taskId);
  return res.status(200).json(new ApiResponse(200, { task: data }, 'Task details fetched successfully'));
});

export const updateTask = asyncHandler(async (req, res) => {
  const wsId = getWorkspaceId(req);
  const data = await tasksService.updateTask(wsId, req.params.taskId, req.body, req.user);
  return res.status(200).json(new ApiResponse(200, { task: data }, 'Task updated successfully'));
});

export const deleteTask = asyncHandler(async (req, res) => {
  const wsId = getWorkspaceId(req);
  const data = await tasksService.deleteTask(wsId, req.params.taskId, req.user);
  return res.status(200).json(new ApiResponse(200, data, 'Task deleted successfully'));
});

export const updateTaskStatus = asyncHandler(async (req, res) => {
  const wsId = getWorkspaceId(req);
  const data = await tasksService.updateTaskStatus(wsId, req.params.taskId, req.body.status, req.user);
  return res.status(200).json(new ApiResponse(200, data, 'Task status updated successfully'));
});

export const updateTaskPriority = asyncHandler(async (req, res) => {
  const wsId = getWorkspaceId(req);
  const data = await tasksService.updateTaskPriority(wsId, req.params.taskId, req.body.priority, req.user);
  return res.status(200).json(new ApiResponse(200, data, 'Task priority updated successfully'));
});

export const updateTaskDueDate = asyncHandler(async (req, res) => {
  const wsId = getWorkspaceId(req);
  const data = await tasksService.updateTaskDueDate(wsId, req.params.taskId, req.body.dueDate, req.user);
  return res.status(200).json(new ApiResponse(200, data, 'Task due date updated successfully'));
});

export const moveTask = asyncHandler(async (req, res) => {
  const wsId = getWorkspaceId(req);
  const data = await tasksService.moveTask(wsId, req.params.taskId, req.body, req.user);
  return res.status(200).json(new ApiResponse(200, { task: data }, 'Task moved successfully'));
});

export const getTaskActivities = asyncHandler(async (req, res) => {
  const wsId = getWorkspaceId(req);
  const data = await tasksService.getTaskActivities(wsId, req.params.taskId);
  return res.status(200).json(new ApiResponse(200, { activities: data }, 'Task activity history fetched successfully'));
});
