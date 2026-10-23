import { asyncHandler } from '../../../utils/asyncHandler.js';
import { ApiResponse } from '../../../utils/ApiResponse.js';
import * as invitationService from './invitation.service.js';

const getWorkspaceId = (req) => {
  return (
    req.workspace?._id?.toString() ||
    req.params.workspaceId ||
    req.headers['x-workspace-id'] ||
    req.query.workspaceId
  );
};

export const sendInvitation = asyncHandler(async (req, res) => {
  const wsId = getWorkspaceId(req);
  const data = await invitationService.sendInvitation(wsId, req.body, req.user);
  return res.status(201).json(new ApiResponse(201, { invitation: data }, 'Invitation sent successfully'));
});

export const getAllInvitations = asyncHandler(async (req, res) => {
  const wsId = getWorkspaceId(req);
  const data = await invitationService.getAllInvitations(wsId, req.query);
  return res.status(200).json(new ApiResponse(200, { invitations: data }, 'Invitations fetched successfully'));
});

export const getInvitationById = asyncHandler(async (req, res) => {
  const wsId = getWorkspaceId(req);
  const data = await invitationService.getInvitationById(wsId, req.params.invitationId);
  return res.status(200).json(new ApiResponse(200, { invitation: data }, 'Invitation details fetched successfully'));
});

export const updateInvitation = asyncHandler(async (req, res) => {
  const wsId = getWorkspaceId(req);
  const data = await invitationService.updateInvitation(wsId, req.params.invitationId, req.body);
  return res.status(200).json(new ApiResponse(200, { invitation: data }, 'Invitation updated successfully'));
});

export const resendInvitation = asyncHandler(async (req, res) => {
  const wsId = getWorkspaceId(req);
  const data = await invitationService.resendInvitation(wsId, req.params.invitationId, req.user);
  return res.status(200).json(new ApiResponse(200, data, 'Invitation resent successfully'));
});

export const cancelInvitation = asyncHandler(async (req, res) => {
  const wsId = getWorkspaceId(req);
  const data = await invitationService.cancelInvitation(wsId, req.params.invitationId, req.user);
  return res.status(200).json(new ApiResponse(200, data, 'Invitation cancelled successfully'));
});

export const getPendingInvitations = asyncHandler(async (req, res) => {
  const wsId = getWorkspaceId(req);
  const data = await invitationService.getPendingInvitations(wsId);
  return res.status(200).json(new ApiResponse(200, { invitations: data }, 'Pending invitations fetched successfully'));
});

export const getAcceptedInvitations = asyncHandler(async (req, res) => {
  const wsId = getWorkspaceId(req);
  const data = await invitationService.getAcceptedInvitations(wsId);
  return res.status(200).json(new ApiResponse(200, { invitations: data }, 'Accepted invitations fetched successfully'));
});

export const getExpiredInvitations = asyncHandler(async (req, res) => {
  const wsId = getWorkspaceId(req);
  const data = await invitationService.getExpiredInvitations(wsId);
  return res.status(200).json(new ApiResponse(200, { invitations: data }, 'Expired invitations fetched successfully'));
});
