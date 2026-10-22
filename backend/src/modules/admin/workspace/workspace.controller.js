import { asyncHandler } from '../../../utils/asyncHandler.js';
import { ApiResponse } from '../../../utils/ApiResponse.js';
import * as workspaceService from './workspace.service.js';

const getWorkspaceId = (req) => {
  return (
    req.workspace?._id?.toString() ||
    req.params.workspaceId ||
    req.headers['x-workspace-id'] ||
    req.query.workspaceId
  );
};

export const getWorkspaceDetails = asyncHandler(async (req, res) => {
  const wsId = getWorkspaceId(req);
  const data = await workspaceService.getWorkspaceDetails(wsId);
  return res.status(200).json(new ApiResponse(200, { workspace: data }, 'Workspace details fetched successfully'));
});

export const updateWorkspaceDetails = asyncHandler(async (req, res) => {
  const wsId = getWorkspaceId(req);
  const data = await workspaceService.updateWorkspaceDetails(wsId, req.body);
  return res.status(200).json(new ApiResponse(200, { workspace: data }, 'Workspace details updated successfully'));
});

export const getWorkspaceSettings = asyncHandler(async (req, res) => {
  const wsId = getWorkspaceId(req);
  const data = await workspaceService.getWorkspaceSettings(wsId);
  return res.status(200).json(new ApiResponse(200, { settings: data }, 'Workspace settings fetched successfully'));
});

export const updateWorkspaceSettings = asyncHandler(async (req, res) => {
  const wsId = getWorkspaceId(req);
  const data = await workspaceService.updateWorkspaceSettings(wsId, req.body);
  return res.status(200).json(new ApiResponse(200, { settings: data }, 'Workspace settings updated successfully'));
});

export const updateGeneralSettings = asyncHandler(async (req, res) => {
  const wsId = getWorkspaceId(req);
  const data = await workspaceService.updateGeneralSettings(wsId, req.body);
  return res.status(200).json(new ApiResponse(200, { general: data }, 'General settings updated successfully'));
});

export const updatePrivacySettings = asyncHandler(async (req, res) => {
  const wsId = getWorkspaceId(req);
  const data = await workspaceService.updatePrivacySettings(wsId, req.body);
  return res.status(200).json(new ApiResponse(200, { privacy: data }, 'Privacy settings updated successfully'));
});

export const updateNotificationSettings = asyncHandler(async (req, res) => {
  const wsId = getWorkspaceId(req);
  const data = await workspaceService.updateNotificationSettings(wsId, req.body);
  return res.status(200).json(new ApiResponse(200, { notifications: data }, 'Notification settings updated successfully'));
});

export const updatePermissionSettings = asyncHandler(async (req, res) => {
  const wsId = getWorkspaceId(req);
  const data = await workspaceService.updatePermissionSettings(wsId, req.body);
  return res.status(200).json(new ApiResponse(200, { permissions: data }, 'Permission settings updated successfully'));
});

export const updateWorkspaceStatus = asyncHandler(async (req, res) => {
  const wsId = getWorkspaceId(req);
  const data = await workspaceService.updateWorkspaceStatus(wsId, req.body, req.user);
  return res.status(200).json(new ApiResponse(200, data, 'Workspace status updated successfully'));
});

export const deleteWorkspace = asyncHandler(async (req, res) => {
  const wsId = getWorkspaceId(req);
  const data = await workspaceService.deleteWorkspace(wsId, req.user);
  return res.status(200).json(new ApiResponse(200, data, 'Workspace deleted successfully'));
});
