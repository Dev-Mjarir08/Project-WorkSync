import crypto from 'crypto';
import mongoose from 'mongoose';
import { Invitation } from '../../../models/Invitation.js';
import { Workspace } from '../../../models/Workspace.js';
import { WorkspaceMember } from '../../../models/WorkspaceMember.js';
import { User } from '../../../models/User.js';
import { Activity } from '../../../models/Activity.js';
import { ApiError } from '../../../utils/ApiError.js';

export const sendInvitation = async (workspaceId, { email, role = 'member', message = '' }, actorUser) => {
  if (!workspaceId) throw new ApiError(400, 'Workspace ID is required');
  const normalizedEmail = email.toLowerCase().trim();

  // Check if user is already a member
  const existingUser = await User.findOne({ email: normalizedEmail });
  if (existingUser) {
    const isMember = await WorkspaceMember.findOne({
      workspace: workspaceId,
      user: existingUser._id
    });
    if (isMember) {
      throw new ApiError(409, 'User is already a member of this workspace');
    }
  }

  // Check if active pending invitation already exists
  const existingInvite = await Invitation.findOne({
    workspace: workspaceId,
    email: normalizedEmail,
    status: 'pending',
    expiresAt: { $gt: new Date() }
  });

  if (existingInvite) {
    throw new ApiError(409, 'An active pending invitation has already been sent to this email');
  }

  const token = crypto.randomBytes(24).toString('hex');
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  const invitation = await Invitation.create({
    workspace: workspaceId,
    email: normalizedEmail,
    role: role.toLowerCase(),
    invitedBy: actorUser._id,
    token,
    status: 'pending',
    message,
    expiresAt
  });

  await Activity.create({
    workspace: workspaceId,
    user: actorUser._id,
    action: 'INVITATION_SENT',
    entityType: 'invitation',
    entityName: normalizedEmail,
    details: `Invited ${normalizedEmail} as ${role}`
  }).catch(() => {});

  return {
    id: invitation._id.toString(),
    email: invitation.email,
    role: invitation.role,
    status: invitation.status,
    expiresAt: invitation.expiresAt,
    inviteUrl: `http://localhost:5173/invite/${token}`
  };
};

export const getAllInvitations = async (workspaceId, query = {}) => {
  if (!workspaceId) throw new ApiError(400, 'Workspace ID is required');
  const wsId = new mongoose.Types.ObjectId(workspaceId);

  const filter = { workspace: wsId };
  if (query.status && query.status !== 'all') {
    filter.status = query.status.toLowerCase();
  }

  const invitations = await Invitation.find(filter)
    .populate('invitedBy', 'name email avatar')
    .sort({ createdAt: -1 });

  return invitations.map(inv => ({
    id: inv._id.toString(),
    email: inv.email,
    role: inv.role,
    status: inv.status,
    message: inv.message,
    invitedBy: inv.invitedBy?.name || 'Administrator',
    invitedByEmail: inv.invitedBy?.email,
    expiresAt: inv.expiresAt,
    createdAt: inv.createdAt
  }));
};

export const getInvitationById = async (workspaceId, invitationId) => {
  const invitation = await Invitation.findOne({
    _id: invitationId,
    workspace: workspaceId
  }).populate('invitedBy', 'name email avatar');

  if (!invitation) throw new ApiError(404, 'Invitation not found');

  return {
    id: invitation._id.toString(),
    email: invitation.email,
    role: invitation.role,
    status: invitation.status,
    message: invitation.message,
    invitedByName: invitation.invitedBy?.name,
    invitedByEmail: invitation.invitedBy?.email,
    expiresAt: invitation.expiresAt,
    createdAt: invitation.createdAt
  };
};

export const updateInvitation = async (workspaceId, invitationId, data) => {
  const invitation = await Invitation.findOne({ _id: invitationId, workspace: workspaceId });
  if (!invitation) throw new ApiError(404, 'Invitation not found');

  if (data.role !== undefined) invitation.role = data.role.toLowerCase();
  if (data.message !== undefined) invitation.message = data.message;

  await invitation.save();
  return invitation;
};

export const resendInvitation = async (workspaceId, invitationId, actorUser) => {
  const invitation = await Invitation.findOne({ _id: invitationId, workspace: workspaceId });
  if (!invitation) throw new ApiError(404, 'Invitation not found');

  invitation.token = crypto.randomBytes(24).toString('hex');
  invitation.expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  invitation.status = 'pending';
  await invitation.save();

  await Activity.create({
    workspace: workspaceId,
    user: actorUser._id,
    action: 'INVITATION_RESENT',
    entityType: 'invitation',
    entityName: invitation.email,
    details: `Resent invitation to ${invitation.email}`
  }).catch(() => {});

  return {
    id: invitation._id.toString(),
    email: invitation.email,
    status: invitation.status,
    expiresAt: invitation.expiresAt,
    resent: true
  };
};

export const cancelInvitation = async (workspaceId, invitationId, actorUser) => {
  const invitation = await Invitation.findOne({ _id: invitationId, workspace: workspaceId });
  if (!invitation) throw new ApiError(404, 'Invitation not found');

  invitation.status = 'cancelled';
  await invitation.save();

  return {
    id: invitationId,
    cancelled: true,
    email: invitation.email
  };
};

export const getPendingInvitations = async (workspaceId) => {
  return getAllInvitations(workspaceId, { status: 'pending' });
};

export const getAcceptedInvitations = async (workspaceId) => {
  return getAllInvitations(workspaceId, { status: 'accepted' });
};

export const getExpiredInvitations = async (workspaceId) => {
  const wsId = new mongoose.Types.ObjectId(workspaceId);
  const invitations = await Invitation.find({
    workspace: wsId,
    $or: [{ status: 'expired' }, { expiresAt: { $lt: new Date() }, status: 'pending' }]
  }).sort({ createdAt: -1 });

  return invitations.map(inv => ({
    id: inv._id.toString(),
    email: inv.email,
    role: inv.role,
    status: 'expired',
    expiresAt: inv.expiresAt,
    createdAt: inv.createdAt
  }));
};
