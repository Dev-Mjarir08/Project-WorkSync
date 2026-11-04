import { asyncHandler } from '../../../utils/asyncHandler.js';
import { ApiResponse } from '../../../utils/ApiResponse.js';
import * as adminsService from './admins.service.js';

export const getAllAdmins = asyncHandler(async (req, res) => {
  const result = await adminsService.getAllWorkspaceAdmins();
  return res.status(200).json(new ApiResponse(200, result, 'All workspace admins retrieved successfully'));
});

export const assignWorkspaceAdmin = asyncHandler(async (req, res) => {
  const result = await adminsService.assignWorkspaceAdmin(req.params.workspaceId, req.body, req.user);
  return res.status(201).json(new ApiResponse(201, result, 'Workspace admin assigned successfully'));
});

export const getWorkspaceAdmins = asyncHandler(async (req, res) => {
  const result = await adminsService.getWorkspaceAdminsList(req.params.workspaceId);
  return res.status(200).json(new ApiResponse(200, result, 'Workspace admins retrieved successfully'));
});

export const updateWorkspaceAdmin = asyncHandler(async (req, res) => {
  const result = await adminsService.updateWorkspaceAdminAssignment(
    req.params.workspaceId,
    req.params.adminId,
    req.body,
    req.user
  );
  return res.status(200).json(new ApiResponse(200, result, 'Workspace admin assignment updated successfully'));
});

export const removeWorkspaceAdmin = asyncHandler(async (req, res) => {
  const result = await adminsService.removeWorkspaceAdminAssignment(
    req.params.workspaceId,
    req.params.adminId,
    req.user
  );
  return res.status(200).json(new ApiResponse(200, result, 'Workspace admin removed successfully'));
});

