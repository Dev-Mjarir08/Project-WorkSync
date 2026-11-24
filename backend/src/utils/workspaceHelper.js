import { WorkspaceMember } from '../models/WorkspaceMember.js';
import { Workspace } from '../models/Workspace.js';

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
  if (direct) return direct;

  if (req.user?._id) {
    const member = await WorkspaceMember.findOne({ user: req.user._id, status: 'active' }).select('workspace');
    if (member?.workspace) return member.workspace.toString();

    const ownerWs = await Workspace.findOne({
      $or: [{ owner: req.user._id }, { createdBy: req.user._id }],
      isActive: true
    }).select('_id');
    if (ownerWs?._id) return ownerWs._id.toString();
  }

  const defaultWs = await Workspace.findOne({ isActive: true }).select('_id');
  return defaultWs?._id?.toString() || null;
};
