import { asyncHandler } from '../../../utils/asyncHandler.js';
import { ApiResponse } from '../../../utils/ApiResponse.js';
import * as projectsService from './projects.service.js';

const getWorkspaceId = (req) => {
  return (
    req.workspace?._id?.toString() ||
    req.params.workspaceId ||
    req.headers['x-workspace-id'] ||
    req.query.workspaceId
  );
};

export const getProjects = asyncHandler(async (req, res) => {
  const wsId = getWorkspaceId(req);
  const data = await projectsService.getProjects(wsId, req.query, req.user);
  return res.status(200).json(new ApiResponse(200, { projects: data }, 'Accessible projects fetched successfully'));
});

export const createProject = asyncHandler(async (req, res) => {
  const wsId = getWorkspaceId(req);
  const data = await projectsService.createProject(wsId, req.body, req.user);
  return res.status(201).json(new ApiResponse(201, { project: data }, 'Project created successfully'));
});

export const getProjectById = asyncHandler(async (req, res) => {
  const wsId = getWorkspaceId(req);
  const data = await projectsService.getProjectById(wsId, req.params.projectId);
  return res.status(200).json(new ApiResponse(200, { project: data }, 'Project details fetched successfully'));
});

export const updateProject = asyncHandler(async (req, res) => {
  const wsId = getWorkspaceId(req);
  const data = await projectsService.updateProject(wsId, req.params.projectId, req.body, req.user);
  return res.status(200).json(new ApiResponse(200, { project: data }, 'Project updated successfully'));
});

export const deleteProject = asyncHandler(async (req, res) => {
  const wsId = getWorkspaceId(req);
  const data = await projectsService.deleteProject(wsId, req.params.projectId, req.user);
  return res.status(200).json(new ApiResponse(200, data, 'Project deleted successfully'));
});

export const updateProjectStatus = asyncHandler(async (req, res) => {
  const wsId = getWorkspaceId(req);
  const data = await projectsService.updateProjectStatus(wsId, req.params.projectId, req.body.status, req.user);
  return res.status(200).json(new ApiResponse(200, data, 'Project status updated successfully'));
});

export const updateProjectPriority = asyncHandler(async (req, res) => {
  const wsId = getWorkspaceId(req);
  const data = await projectsService.updateProjectPriority(wsId, req.params.projectId, req.body.priority, req.user);
  return res.status(200).json(new ApiResponse(200, data, 'Project priority updated successfully'));
});

export const getProjectMembers = asyncHandler(async (req, res) => {
  const wsId = getWorkspaceId(req);
  const data = await projectsService.getProjectMembers(wsId, req.params.projectId);
  return res.status(200).json(new ApiResponse(200, { members: data }, 'Project members fetched successfully'));
});

export const addProjectMembers = asyncHandler(async (req, res) => {
  const wsId = getWorkspaceId(req);
  const memberIds = req.body.memberIds || req.body.members || [req.body.userId];
  const data = await projectsService.addProjectMembers(wsId, req.params.projectId, memberIds, req.user);
  return res.status(201).json(new ApiResponse(201, { members: data }, 'Members assigned to project successfully'));
});

export const removeProjectMember = asyncHandler(async (req, res) => {
  const wsId = getWorkspaceId(req);
  const data = await projectsService.removeProjectMember(wsId, req.params.projectId, req.params.memberId, req.user);
  return res.status(200).json(new ApiResponse(200, data, 'Project member removed successfully'));
});

export const getProjectBoards = asyncHandler(async (req, res) => {
  const wsId = getWorkspaceId(req);
  const data = await projectsService.getProjectBoards(wsId, req.params.projectId);
  return res.status(200).json(new ApiResponse(200, { boards: data }, 'Project boards fetched successfully'));
});

export const getProjectActivities = asyncHandler(async (req, res) => {
  const wsId = getWorkspaceId(req);
  const data = await projectsService.getProjectActivities(wsId, req.params.projectId);
  return res.status(200).json(new ApiResponse(200, { activities: data }, 'Project activities fetched successfully'));
});
