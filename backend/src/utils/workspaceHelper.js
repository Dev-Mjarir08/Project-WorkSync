import mongoose from 'mongoose';
import { WorkspaceMember } from '../models/WorkspaceMember.js';
import { Workspace } from '../models/Workspace.js';
import { Task } from '../models/Task.js';

/**
 * Resolves the workspace ID from request parameters, headers, user membership, or fallback default workspace.
 * @param {import('express').Request} req
 * @returns {Promise<string|null>}
 */
export const getWorkspaceId = async (req) => {
  const direct = (
    req.workspace?._id?.toString() ||
    req.params?.workspaceId ||
    req.headers?.['x-workspace-id'] ||
    req.query?.workspaceId ||
    req.user?.workspaceId?.toString()
  );

  if (direct && typeof direct === 'string' && direct !== 'undefined' && direct !== 'null' && mongoose.Types.ObjectId.isValid(direct)) {
    const exists = await Workspace.findOne({ _id: direct, isActive: true }).select('_id');
    if (exists) return exists._id.toString();
  }

  if (req.user?._id) {
    // 1. Check user's active workspace membership
    const member = await WorkspaceMember.findOne({ user: req.user._id, status: 'active' }).select('workspace');
    if (member?.workspace) return member.workspace.toString();

    // 2. Check workspaces owned or created by user
    const ownerWs = await Workspace.findOne({
      $or: [{ owner: req.user._id }, { createdBy: req.user._id }],
      isActive: true
    }).select('_id');
    if (ownerWs?._id) return ownerWs._id.toString();

    // 3. Check any workspace where user has assigned tasks
    const taskWorkspaces = await Task.distinct('workspace', { assignee: req.user._id });
    if (taskWorkspaces && taskWorkspaces.length > 0) {
      const validWs = await Workspace.findOne({ _id: { $in: taskWorkspaces }, isActive: true }).select('_id');
      if (validWs) return validWs._id.toString();
    }
  }

  // 4. Fallback to any active workspace in the system
  const defaultWs = await Workspace.findOne({ isActive: true }).select('_id');
  return defaultWs?._id?.toString() || null;
};
