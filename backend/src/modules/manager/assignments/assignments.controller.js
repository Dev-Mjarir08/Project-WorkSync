import { asyncHandler } from '../../../utils/asyncHandler.js';
import { ApiResponse } from '../../../utils/ApiResponse.js';
import * as assignmentsService from './assignments.service.js';

const getWorkspaceId = (req) => {
  return (
    req.workspace?._id?.toString() ||
    req.params.workspaceId ||
    req.headers['x-workspace-id'] ||
    req.query.workspaceId
  );
};

export const getAssignments = asyncHandler(async (req, res) => {
  const wsId = getWorkspaceId(req);
  const data = await assignmentsService.getAssignments(wsId, req.query, req.user);
  return res.status(200).json(new ApiResponse(200, { assignments: data }, 'Task assignments fetched successfully'));
});

export const assignTaskToMember = asyncHandler(async (req, res) => {
  const wsId = getWorkspaceId(req);
  const data = await assignmentsService.assignTaskToMember(wsId, req.body, req.user);
  return res.status(201).json(new ApiResponse(201, { assignment: data }, 'Task assigned to member successfully'));
});

export const getAssignmentById = asyncHandler(async (req, res) => {
  const wsId = getWorkspaceId(req);
  const data = await assignmentsService.getAssignmentById(wsId, req.params.assignmentId);
  return res.status(200).json(new ApiResponse(200, { assignment: data }, 'Assignment details fetched successfully'));
});

export const updateAssignment = asyncHandler(async (req, res) => {
  const wsId = getWorkspaceId(req);
  const data = await assignmentsService.updateAssignment(wsId, req.params.assignmentId, req.body, req.user);
  return res.status(200).json(new ApiResponse(200, { assignment: data }, 'Assignment updated successfully'));
});

export const removeAssignment = asyncHandler(async (req, res) => {
  const wsId = getWorkspaceId(req);
  const data = await assignmentsService.removeAssignment(wsId, req.params.assignmentId, req.user);
  return res.status(200).json(new ApiResponse(200, data, 'Assignment removed successfully'));
});

export const assignTask = asyncHandler(async (req, res) => {
  const wsId = getWorkspaceId(req);
  const data = await assignmentsService.assignTask(wsId, req.params.taskId, req.body, req.user);
  return res.status(200).json(new ApiResponse(200, { task: data }, 'Task assigned successfully'));
});

export const unassignTask = asyncHandler(async (req, res) => {
  const wsId = getWorkspaceId(req);
  const data = await assignmentsService.unassignTask(wsId, req.params.taskId, req.user);
  return res.status(200).json(new ApiResponse(200, data, 'Task unassigned successfully'));
});

export const getMemberAssignments = asyncHandler(async (req, res) => {
  const wsId = getWorkspaceId(req);
  const data = await assignmentsService.getMemberAssignments(wsId, req.params.memberId);
  return res.status(200).json(new ApiResponse(200, { assignments: data }, 'Member assignments fetched successfully'));
});
