import { asyncHandler } from '../../utils/asyncHandler.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import * as memberService from './member.service.js';

/**
 * Helper to resolve workspace ID from params, headers, query, or body
 */
const getWorkspaceId = (req) => {
  return (
    req.params?.workspaceId ||
    req.headers?.['x-workspace-id'] ||
    req.query?.workspaceId ||
    req.body?.workspaceId ||
    null
  );
};

/**
 * 1. GET /dashboard - Workspace dashboard overview
 */
export const getDashboard = asyncHandler(async (req, res) => {
  const workspaceId = getWorkspaceId(req);
  const result = await memberService.getWorkspaceDashboard(workspaceId, req.user);

  return res
    .status(200)
    .json(new ApiResponse(200, result, 'Workspace dashboard statistics fetched successfully.'));
});

/**
 * 2. GET /members - Workspace members
 */
export const getMembers = asyncHandler(async (req, res) => {
  const workspaceId = getWorkspaceId(req);
  const result = await memberService.getWorkspaceMembers(workspaceId, req.query);

  return res
    .status(200)
    .json(new ApiResponse(200, result, 'Workspace members fetched successfully.'));
});

/**
 * 3. POST /members - Add existing user to workspace
 */
export const addMember = asyncHandler(async (req, res) => {
  const workspaceId = getWorkspaceId(req);
  const result = await memberService.addWorkspaceMember(workspaceId, req.body, req.user);

  return res
    .status(201)
    .json(new ApiResponse(201, result, 'Member added to workspace successfully.'));
});

/**
 * 4. GET /members/:memberId - Member details
 */
export const getMemberDetails = asyncHandler(async (req, res) => {
  const workspaceId = getWorkspaceId(req);
  const { memberId } = req.params;
  const result = await memberService.getMemberDetails(workspaceId, memberId);

  return res
    .status(200)
    .json(new ApiResponse(200, result, 'Member details fetched successfully.'));
});

/**
 * 5. PATCH /members/:memberId/role - Change workspace role
 */
export const updateMemberRole = asyncHandler(async (req, res) => {
  const workspaceId = getWorkspaceId(req);
  const { memberId } = req.params;
  const { role } = req.body;
  const result = await memberService.updateMemberRole(workspaceId, memberId, role, req.user);

  return res
    .status(200)
    .json(new ApiResponse(200, result, `Member role updated to '${role}' successfully.`));
});

/**
 * 6. DELETE /members/:memberId - Remove member
 */
export const removeMember = asyncHandler(async (req, res) => {
  const workspaceId = getWorkspaceId(req);
  const { memberId } = req.params;
  const result = await memberService.removeWorkspaceMember(workspaceId, memberId, req.user);

  return res
    .status(200)
    .json(new ApiResponse(200, result, 'Member removed from workspace successfully.'));
});

/**
 * 7. POST /invitations - Invite new member
 */
export const inviteMember = asyncHandler(async (req, res) => {
  const workspaceId = getWorkspaceId(req);
  const result = await memberService.inviteMember(workspaceId, req.body, req.user);

  return res
    .status(201)
    .json(new ApiResponse(201, result, 'Invitation sent successfully.'));
});

/**
 * 8. GET /invitations - All invitations
 */
export const getInvitations = asyncHandler(async (req, res) => {
  const workspaceId = getWorkspaceId(req);
  const result = await memberService.getWorkspaceInvitations(workspaceId, req.query);

  return res
    .status(200)
    .json(new ApiResponse(200, result, 'Workspace invitations fetched successfully.'));
});

/**
 * 9. DELETE /invitations/:invitationId - Cancel invitation
 */
export const cancelInvitation = asyncHandler(async (req, res) => {
  const workspaceId = getWorkspaceId(req);
  const { invitationId } = req.params;
  const result = await memberService.cancelInvitation(workspaceId, invitationId, req.user);

  return res
    .status(200)
    .json(new ApiResponse(200, result, 'Invitation cancelled successfully.'));
});