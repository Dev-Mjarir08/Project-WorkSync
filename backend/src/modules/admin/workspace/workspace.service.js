import mongoose from 'mongoose';
import { Workspace } from '../../../models/Workspace.js';
import { WorkspaceMember } from '../../../models/WorkspaceMember.js';
import { Board } from '../../../models/Board.js';
import { Task } from '../../../models/Task.js';
import { Activity } from '../../../models/Activity.js';
import { ApiError } from '../../../utils/ApiError.js';
import { ROLES, WORKSPACE_ROLES } from '../../../constants/roles.js';

export const getWorkspaceDetails = async (workspaceId) => {
  if (!workspaceId) throw new ApiError(400, 'Workspace ID is required');

  const ws = await Workspace.findById(workspaceId)
    .populate('owner', 'name email avatar')
    .lean();

  if (!ws) throw new ApiError(404, 'Workspace not found');

  const [membersCount, boardsCount, tasksCount] = await Promise.all([
    WorkspaceMember.countDocuments({ workspace: ws._id, status: 'active' }),
    Board.countDocuments({ workspace: ws._id, isArchived: false }),
    Task.countDocuments({ workspace: ws._id })
  ]);

  return {
    ...ws,
    id: ws._id.toString(),
    membersCount,
    boardsCount,
    tasksCount
  };
};

export const updateWorkspaceDetails = async (workspaceId, data) => {
  if (!workspaceId) throw new ApiError(400, 'Workspace ID is required');

  const ws = await Workspace.findById(workspaceId);
  if (!ws) throw new ApiError(404, 'Workspace not found');

  if (data.name !== undefined) ws.name = data.name.trim();
  if (data.description !== undefined) ws.description = data.description.trim();
  if (data.plan !== undefined) ws.plan = data.plan;

  await ws.save();
  return ws;
};

export const getWorkspaceSettings = async (workspaceId) => {
  if (!workspaceId) throw new ApiError(400, 'Workspace ID is required');

  const ws = await Workspace.findById(workspaceId);
  if (!ws) throw new ApiError(404, 'Workspace not found');

  return ws.settings || {
    general: { defaultRole: 'member', allowMemberInvites: true, timezone: 'UTC' },
    privacy: { isPublic: false, inviteOnly: true },
    notifications: { emailNotifications: true, taskAlerts: true, weeklyDigest: true },
    permissions: { memberCanCreateBoards: true, memberCanCreateProjects: true, memberCanInvite: false }
  };
};

export const updateWorkspaceSettings = async (workspaceId, newSettings) => {
  if (!workspaceId) throw new ApiError(400, 'Workspace ID is required');

  const ws = await Workspace.findById(workspaceId);
  if (!ws) throw new ApiError(404, 'Workspace not found');

  ws.settings = {
    ...ws.settings?.toObject(),
    ...newSettings
  };

  await ws.save();
  return ws.settings;
};

export const updateGeneralSettings = async (workspaceId, generalData) => {
  if (!workspaceId) throw new ApiError(400, 'Workspace ID is required');

  const ws = await Workspace.findById(workspaceId);
  if (!ws) throw new ApiError(404, 'Workspace not found');

  ws.settings.general = {
    ...ws.settings?.general?.toObject(),
    ...generalData
  };

  await ws.save();
  return ws.settings.general;
};

export const updatePrivacySettings = async (workspaceId, privacyData) => {
  if (!workspaceId) throw new ApiError(400, 'Workspace ID is required');

  const ws = await Workspace.findById(workspaceId);
  if (!ws) throw new ApiError(404, 'Workspace not found');

  ws.settings.privacy = {
    ...ws.settings?.privacy?.toObject(),
    ...privacyData
  };

  await ws.save();
  return ws.settings.privacy;
};

export const updateNotificationSettings = async (workspaceId, notificationData) => {
  if (!workspaceId) throw new ApiError(400, 'Workspace ID is required');

  const ws = await Workspace.findById(workspaceId);
  if (!ws) throw new ApiError(404, 'Workspace not found');

  ws.settings.notifications = {
    ...ws.settings?.notifications?.toObject(),
    ...notificationData
  };

  await ws.save();
  return ws.settings.notifications;
};

export const updatePermissionSettings = async (workspaceId, permissionData) => {
  if (!workspaceId) throw new ApiError(400, 'Workspace ID is required');

  const ws = await Workspace.findById(workspaceId);
  if (!ws) throw new ApiError(404, 'Workspace not found');

  ws.settings.permissions = {
    ...ws.settings?.permissions?.toObject(),
    ...permissionData
  };

  await ws.save();
  return ws.settings.permissions;
};

export const updateWorkspaceStatus = async (workspaceId, { status, isActive }, user) => {
  if (!workspaceId) throw new ApiError(400, 'Workspace ID is required');

  const ws = await Workspace.findById(workspaceId);
  if (!ws) throw new ApiError(404, 'Workspace not found');

  if (status !== undefined) ws.status = status;
  if (isActive !== undefined) ws.isActive = isActive;

  await ws.save();
  return {
    id: ws._id.toString(),
    status: ws.status,
    isActive: ws.isActive
  };
};

export const deleteWorkspace = async (workspaceId, user) => {
  if (!workspaceId) throw new ApiError(400, 'Workspace ID is required');

  const ws = await Workspace.findById(workspaceId);
  if (!ws) throw new ApiError(404, 'Workspace not found');

  const isOwner = ws.owner?.toString() === user._id.toString();
  const isSuperAdmin = user.role === ROLES.SUPER_ADMIN;

  if (!isOwner && !isSuperAdmin) {
    throw new ApiError(403, 'Forbidden: Only the workspace owner or platform super admin can delete this workspace');
  }

  // Cascade cleanup
  await Promise.all([
    Workspace.findByIdAndDelete(ws._id),
    WorkspaceMember.deleteMany({ workspace: ws._id }),
    Board.deleteMany({ workspace: ws._id }),
    Task.deleteMany({ workspace: ws._id }),
    Activity.deleteMany({ workspace: ws._id })
  ]);

  return {
    id: ws._id.toString(),
    name: ws.name,
    deleted: true
  };
};

