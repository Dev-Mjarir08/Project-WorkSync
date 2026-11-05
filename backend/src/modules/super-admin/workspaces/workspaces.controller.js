import { asyncHandler } from '../../../utils/asyncHandler.js';
import { ApiResponse } from '../../../utils/ApiResponse.js';
import * as workspacesService from './workspaces.service.js';
import * as memberService from '../../members/member.service.js';

export const getWorkspaces = asyncHandler(async (req, res) => {
  const result = await workspacesService.getAllWorkspaces(req.query);
  return res.status(200).json(new ApiResponse(200, result, 'Workspaces retrieved successfully'));
});

export const createWorkspace = asyncHandler(async (req, res) => {
  const workspace = await workspacesService.createWorkspace(req.body, req.user);
  return res.status(201).json(new ApiResponse(201, { workspace }, 'Workspace provisioned successfully'));
});

export const getWorkspaceById = asyncHandler(async (req, res) => {
  const workspace = await workspacesService.getWorkspaceById(req.params.workspaceId);
  return res.status(200).json(new ApiResponse(200, { workspace }, 'Workspace details retrieved successfully'));
});

export const updateWorkspace = asyncHandler(async (req, res) => {
  const workspace = await workspacesService.updateWorkspace(req.params.workspaceId, req.body, req.user);
  return res.status(200).json(new ApiResponse(200, { workspace }, 'Workspace updated successfully'));
});

export const updateWorkspaceStatus = asyncHandler(async (req, res) => {
  const workspace = await workspacesService.updateWorkspaceStatus(req.params.workspaceId, req.body, req.user);
  return res.status(200).json(new ApiResponse(200, { workspace }, 'Workspace status updated successfully'));
});

export const deleteWorkspace = asyncHandler(async (req, res) => {
  const result = await workspacesService.deleteWorkspace(req.params.workspaceId, req.user);
  return res.status(200).json(new ApiResponse(200, result, 'Workspace deleted successfully'));
});

export const getWorkspaceMembers = asyncHandler(async (req, res) => {
  const result = await memberService.getWorkspaceMembers(req.params.workspaceId, req.query);
  return res.status(200).json(new ApiResponse(200, result, 'Workspace members retrieved successfully'));
});

export const getWorkspaceBoards = asyncHandler(async (req, res) => {
  const result = await workspacesService.getWorkspaceBoards(req.params.workspaceId);
  return res.status(200).json(new ApiResponse(200, result, 'Workspace boards retrieved successfully'));
});

export const getWorkspaceActivities = asyncHandler(async (req, res) => {
  const limit = req.query.limit || 20;
  const result = await workspacesService.getWorkspaceActivities(req.params.workspaceId, limit);
  return res.status(200).json(new ApiResponse(200, result, 'Workspace activities retrieved successfully'));
});

export const getWorkspaceAnalytics = asyncHandler(async (req, res) => {
  const result = await workspacesService.getWorkspaceAnalytics(req.params.workspaceId);
  return res.status(200).json(new ApiResponse(200, result, 'Workspace analytics retrieved successfully'));
});

export const getWorkspaceProjects = asyncHandler(async (req, res) => {
  const result = await workspacesService.getWorkspaceProjects(req.params.workspaceId);
  return res.status(200).json(new ApiResponse(200, result, 'Workspace projects retrieved successfully'));
});

export const createWorkspaceProject = asyncHandler(async (req, res) => {
  const result = await workspacesService.createWorkspaceProject(req.params.workspaceId, req.body, req.user);
  return res.status(201).json(new ApiResponse(201, { project: result }, 'Workspace project created successfully'));
});

export const addWorkspaceMember = asyncHandler(async (req, res) => {
  const result = await workspacesService.addWorkspaceMember(req.params.workspaceId, req.body, req.user);
  return res.status(201).json(new ApiResponse(201, { member: result }, 'Workspace member added successfully'));
});


