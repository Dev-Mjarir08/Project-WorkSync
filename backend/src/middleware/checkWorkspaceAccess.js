import { WorkspaceMember } from '../models/WorkspaceMember.js';
import { Workspace } from '../models/Workspace.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ROLES } from '../constants/roles.js';

export const checkWorkspaceAccess = asyncHandler(async (req, res, next) => {
  const workspaceIdentifier =
    req.params.workspaceId ||
    req.headers['x-workspace-id'] ||
    req.query.workspaceId ||
    req.body.workspaceId;

  if (!workspaceIdentifier) {
    return next();
  }

  // Super Admin has global bypass
  if (req.user?.role === ROLES.SUPER_ADMIN) {
    return next();
  }

  let ws = await Workspace.findById(workspaceIdentifier);
  if (!ws) {
    ws = await Workspace.findOne({ slug: workspaceIdentifier.toString().toLowerCase() });
  }

  if (!ws) {
    throw new ApiError(404, 'Workspace not found');
  }

  const membership = await WorkspaceMember.findOne({
    workspace: ws._id,
    user: req.user._id,
    status: 'active'
  });

  if (!membership && ws.owner?.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'You do not have active access to this workspace');
  }

  req.workspace = ws;
  req.workspaceMember = membership;
  next();
});

export default checkWorkspaceAccess;

