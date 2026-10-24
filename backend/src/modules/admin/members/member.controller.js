import { asyncHandler } from '../../../utils/asyncHandler.js';
import { ApiResponse } from '../../../utils/ApiResponse.js';
import * as memberService from './member.service.js';

const getWorkspaceId = (req) => {
  return (
    req.workspace?._id?.toString() ||
    req.params.workspaceId ||
    req.headers['x-workspace-id'] ||
    req.query.workspaceId
  );
};

export const getMembers = asyncHandler(async (req, res) => {
  const wsId = getWorkspaceId(req);
  const data = await memberService.getMembers(wsId, req.query);
  return res.status(200).json(new ApiResponse(200, { members: data }, 'Workspace members fetched successfully'));
});

export const addMember = asyncHandler(async (req, res) => {
  const wsId = getWorkspaceId(req);
  const data = await memberService.addMember(wsId, req.body, req.user);
  return res.status(201).json(new ApiResponse(201, { member: data }, 'Member added to workspace successfully'));
});

export const getMemberById = asyncHandler(async (req, res) => {
  const wsId = getWorkspaceId(req);
  const data = await memberService.getMemberById(wsId, req.params.memberId);
  return res.status(200).json(new ApiResponse(200, { member: data }, 'Member details fetched successfully'));
});

export const updateMember = asyncHandler(async (req, res) => {
  const wsId = getWorkspaceId(req);
  const data = await memberService.updateMember(wsId, req.params.memberId, req.body, req.user);
  return res.status(200).json(new ApiResponse(200, { member: data }, 'Member updated successfully'));
});

export const updateMemberRole = asyncHandler(async (req, res) => {
  const wsId = getWorkspaceId(req);
  const data = await memberService.updateMemberRole(wsId, req.params.memberId, req.body.role, req.user);
  return res.status(200).json(new ApiResponse(200, data, 'Member role updated successfully'));
});

export const updateMemberStatus = asyncHandler(async (req, res) => {
  const wsId = getWorkspaceId(req);
  const data = await memberService.updateMemberStatus(wsId, req.params.memberId, req.body.status, req.user);
  return res.status(200).json(new ApiResponse(200, data, 'Member status updated successfully'));
});

export const removeMember = asyncHandler(async (req, res) => {
  const wsId = getWorkspaceId(req);
  const data = await memberService.removeMember(wsId, req.params.memberId, req.user);
  return res.status(200).json(new ApiResponse(200, data, 'Member removed from workspace successfully'));
});

export const getMemberActivities = asyncHandler(async (req, res) => {
  const wsId = getWorkspaceId(req);
  const data = await memberService.getMemberActivities(wsId, req.params.memberId, req.query);
  return res.status(200).json(new ApiResponse(200, { activities: data }, 'Member activities fetched successfully'));
});

export const getMemberTasks = asyncHandler(async (req, res) => {
  const wsId = getWorkspaceId(req);
  const data = await memberService.getMemberTasks(wsId, req.params.memberId);
  return res.status(200).json(new ApiResponse(200, { tasks: data }, 'Member tasks fetched successfully'));
});

export const getMemberBoards = asyncHandler(async (req, res) => {
  const wsId = getWorkspaceId(req);
  const data = await memberService.getMemberBoards(wsId, req.params.memberId);
  return res.status(200).json(new ApiResponse(200, { boards: data }, 'Member accessible boards fetched successfully'));
});

