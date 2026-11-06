import { WorkspaceMember } from '../models/WorkspaceMember.js';
import { Workspace } from '../models/Workspace.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ROLES } from '../constants/roles.js';

export const checkWorkspaceAccess = asyncHandler(async (req, res, next) => {
  let workspaceIdentifier =
    req.params.workspaceId ||
    req.headers['x-workspace-id'] ||
    req.query.workspaceId ||
    req.body?.workspaceId;

  if (!workspaceIdentifier && req.user) {
    const privilegedMembership = await WorkspaceMember.findOne({
      user: req.user._id,
      role: { $in: ['admin', 'owner', 'manager'] },
      status: 'active'
    });
    if (privilegedMembership) {
      workspaceIdentifier = privilegedMembership.workspace;
    } else {
      const ownedWs = await Workspace.findOne({ owner: req.user._id });
      if (ownedWs) {
        workspaceIdentifier = ownedWs._id;
      } else {
        const anyMembership = await WorkspaceMember.findOne({
          user: req.user._id,
          status: 'active'
        });
        if (anyMembership) {
          workspaceIdentifier = anyMembership.workspace;
        }
      }
    }
  }

  if (!workspaceIdentifier) {
    // If still no workspace found, let super admin continue or proceed to route handlers
    return next();
  }

  let ws = await Workspace.findById(workspaceIdentifier);
  if (!ws) {
    ws = await Workspace.findOne({ slug: workspaceIdentifier.toString().toLowerCase() });
  }

  if (!ws) {
    throw new ApiError(404, 'Workspace not found');
  }

  // Super Admin has global access
  if (req.user?.role === ROLES.SUPER_ADMIN) {
    req.workspace = ws;
    return next();
  }

  const membership = await WorkspaceMember.findOne({
    workspace: ws._id,
    user: req.user._id,
    status: 'active'
  });

  const isOwner = ws.owner?.toString() === req.user._id.toString();

  if (!membership && !isOwner) {
    throw new ApiError(403, 'You do not have active access to this workspace');
  }

  req.workspace = ws;
  req.workspaceMember = membership;
  next();
});

export default checkWorkspaceAccess;
