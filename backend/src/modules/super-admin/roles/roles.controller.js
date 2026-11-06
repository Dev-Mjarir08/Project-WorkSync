import { asyncHandler } from '../../../utils/asyncHandler.js';
import { ApiResponse } from '../../../utils/ApiResponse.js';
import * as rolesService from './roles.service.js';

export const getRoles = asyncHandler(async (req, res) => {
  const roles = await rolesService.getAllRoles();
  return res.status(200).json(new ApiResponse(200, { roles }, 'Platform roles retrieved successfully'));
});

export const getRoleById = asyncHandler(async (req, res) => {
  const role = await rolesService.getRoleById(req.params.roleId);
  return res.status(200).json(new ApiResponse(200, { role }, 'Role details retrieved successfully'));
});

export const createRole = asyncHandler(async (req, res) => {
  const role = await rolesService.createCustomRole(req.body, req.user);
  return res.status(201).json(new ApiResponse(201, { role }, 'Custom role created successfully'));
});

export const updateRole = asyncHandler(async (req, res) => {
  const role = await rolesService.updateRole(req.params.roleId, req.body, req.user);
  return res.status(200).json(new ApiResponse(200, { role }, 'Role updated successfully'));
});

export const deleteRole = asyncHandler(async (req, res) => {
  const result = await rolesService.deleteCustomRole(req.params.roleId, req.user);
  return res.status(200).json(new ApiResponse(200, result, 'Role deleted successfully'));
});

export const getPermissions = asyncHandler(async (req, res) => {
  const data = rolesService.getAllPermissions();
  return res.status(200).json(new ApiResponse(200, data, 'Platform permissions retrieved successfully'));
});

export const updateRolePermissions = asyncHandler(async (req, res) => {
  const role = await rolesService.updateRolePermissions(req.params.roleId, req.body.permissions, req.user);
  return res.status(200).json(new ApiResponse(200, { role }, 'Role permissions updated successfully'));
});

