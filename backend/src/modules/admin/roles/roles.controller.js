import { asyncHandler } from '../../../utils/asyncHandler.js';
import { ApiResponse } from '../../../utils/ApiResponse.js';
import * as rolesService from './roles.service.js';

const getWorkspaceId = (req) => {
  return (
    req.workspace?._id?.toString() ||
    req.params.workspaceId ||
    req.headers['x-workspace-id'] ||
    req.query.workspaceId
  );
};

export const getRoles = asyncHandler(async (req, res) => {
  const wsId = getWorkspaceId(req);
  const data = await rolesService.getWorkspaceRoles(wsId);
  return res.status(200).json(new ApiResponse(200, { roles: data }, 'Workspace roles fetched successfully'));
});

export const getRoleById = asyncHandler(async (req, res) => {
  const wsId = getWorkspaceId(req);
  const data = await rolesService.getWorkspaceRoleById(wsId, req.params.roleId);
  return res.status(200).json(new ApiResponse(200, { role: data }, 'Role details fetched successfully'));
});

export const createCustomRole = asyncHandler(async (req, res) => {
  const wsId = getWorkspaceId(req);
  const data = await rolesService.createCustomWorkspaceRole(wsId, req.body, req.user);
  return res.status(201).json(new ApiResponse(201, { role: data }, 'Custom workspace role created successfully'));
});

export const updateCustomRole = asyncHandler(async (req, res) => {
  const wsId = getWorkspaceId(req);
  const data = await rolesService.updateCustomWorkspaceRole(wsId, req.params.roleId, req.body, req.user);
  return res.status(200).json(new ApiResponse(200, { role: data }, 'Custom role updated successfully'));
});

export const deleteCustomRole = asyncHandler(async (req, res) => {
  const wsId = getWorkspaceId(req);
  const data = await rolesService.deleteCustomWorkspaceRole(wsId, req.params.roleId, req.user);
  return res.status(200).json(new ApiResponse(200, data, 'Custom role deleted successfully'));
});

export const getAvailablePermissions = asyncHandler(async (req, res) => {
  const data = rolesService.getAvailablePermissions();
  return res.status(200).json(new ApiResponse(200, data, 'Available workspace permissions fetched successfully'));
});

export const getRolePermissions = asyncHandler(async (req, res) => {
  const wsId = getWorkspaceId(req);
  const data = await rolesService.getRolePermissions(wsId, req.params.roleId);
  return res.status(200).json(new ApiResponse(200, data, 'Role permissions fetched successfully'));
});

export const updateRolePermissions = asyncHandler(async (req, res) => {
  const wsId = getWorkspaceId(req);
  const data = await rolesService.updateRolePermissions(wsId, req.params.roleId, req.body.permissions, req.user);
  return res.status(200).json(new ApiResponse(200, data, 'Role permissions updated successfully'));
});
