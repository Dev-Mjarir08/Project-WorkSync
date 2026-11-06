import { asyncHandler } from '../../../utils/asyncHandler.js';
import { ApiResponse } from '../../../utils/ApiResponse.js';
import * as usersService from './users.service.js';

export const getUsers = asyncHandler(async (req, res) => {
  const result = await usersService.getAllUsers(req.query);
  return res.status(200).json(new ApiResponse(200, result, 'Users list retrieved successfully'));
});

export const getUserById = asyncHandler(async (req, res) => {
  const user = await usersService.getUserById(req.params.userId);
  return res.status(200).json(new ApiResponse(200, { user }, 'User details retrieved successfully'));
});

export const createUser = asyncHandler(async (req, res) => {
  const user = await usersService.createUser(req.body, req.user);
  return res.status(201).json(new ApiResponse(201, { user }, 'User account created successfully'));
});

export const updateUser = asyncHandler(async (req, res) => {
  const user = await usersService.updateUser(req.params.userId, req.body, req.user);
  return res.status(200).json(new ApiResponse(200, { user }, 'User details updated successfully'));
});

export const updateUserStatus = asyncHandler(async (req, res) => {
  const user = await usersService.updateUserStatus(req.params.userId, req.body, req.user);
  return res.status(200).json(new ApiResponse(200, { user }, 'User status updated successfully'));
});

export const updateUserRole = asyncHandler(async (req, res) => {
  const user = await usersService.updateUserRole(req.params.userId, req.body.role, req.user);
  return res.status(200).json(new ApiResponse(200, { user }, 'User role updated successfully'));
});

export const deleteUser = asyncHandler(async (req, res) => {
  const result = await usersService.deleteUser(req.params.userId, req.user);
  return res.status(200).json(new ApiResponse(200, result, 'User deleted successfully'));
});

export const getUserWorkspaces = asyncHandler(async (req, res) => {
  const data = await usersService.getUserWorkspaces(req.params.userId);
  return res.status(200).json(new ApiResponse(200, data, 'User workspaces retrieved successfully'));
});

export const getUserActivities = asyncHandler(async (req, res) => {
  const limit = req.query.limit || 20;
  const data = await usersService.getUserActivities(req.params.userId, limit);
  return res.status(200).json(new ApiResponse(200, data, 'User activities history retrieved successfully'));
});

export const getUserSessions = asyncHandler(async (req, res) => {
  const data = await usersService.getUserSessions(req.params.userId);
  return res.status(200).json(new ApiResponse(200, data, 'User active sessions retrieved successfully'));
});

export const revokeUserSessions = asyncHandler(async (req, res) => {
  const data = await usersService.revokeUserSessions(req.params.userId, req.user);
  return res.status(200).json(new ApiResponse(200, data, 'User sessions revoked successfully'));
});

