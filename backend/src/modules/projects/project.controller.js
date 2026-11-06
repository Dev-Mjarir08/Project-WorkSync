import { asyncHandler } from '../../utils/asyncHandler.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import * as projectService from './project.service.js';

export const getProjects = asyncHandler(async (req, res) => {
  const workspaceId = req.query.workspaceId || req.headers['x-workspace-id'];
  const projects = await projectService.getProjects(workspaceId, req.query);
  return res.status(200).json(new ApiResponse(200, { projects }, 'Projects retrieved successfully'));
});

export const getProjectById = asyncHandler(async (req, res) => {
  const project = await projectService.getProjectById(req.params.projectId);
  return res.status(200).json(new ApiResponse(200, { project }, 'Project details retrieved successfully'));
});

export const createProject = asyncHandler(async (req, res) => {
  const project = await projectService.createProject(req.body, req.user);
  return res.status(201).json(new ApiResponse(201, { project }, 'Project created successfully'));
});

export const updateProject = asyncHandler(async (req, res) => {
  const project = await projectService.updateProject(req.params.projectId, req.body);
  return res.status(200).json(new ApiResponse(200, { project }, 'Project updated successfully'));
});

export const deleteProject = asyncHandler(async (req, res) => {
  const result = await projectService.deleteProject(req.params.projectId);
  return res.status(200).json(new ApiResponse(200, result, 'Project deleted successfully'));
});

