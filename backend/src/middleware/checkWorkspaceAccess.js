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
        } else if (req.user.createdBy) {
          const creatorWs = await Workspace.findOne({ owner: req.user.createdBy });
          if (creatorWs) {
            workspaceIdentifier = creatorWs._id;
            await WorkspaceMember.findOneAndUpdate(
              { workspace: creatorWs._id, user: req.user._id },
              {
                workspace: creatorWs._id,
                user: req.user._id,
                role: req.user.role || 'member',
                status: 'active'
              },
              { upsert: true, returnDocument: 'after' }
            ).catch(() => {});
          }
        }
        if (!workspaceIdentifier) {
          const firstWs = await Workspace.findOne({ isActive: true });
          if (firstWs) {
            workspaceIdentifier = firstWs._id;
            await WorkspaceMember.findOneAndUpdate(
              { workspace: firstWs._id, user: req.user._id },
              {
                workspace: firstWs._id,
                user: req.user._id,
                role: req.user.role || 'member',
                status: 'active'
              },
              { upsert: true, returnDocument: 'after' }
            ).catch(() => {});
          }
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

  let membership = await WorkspaceMember.findOne({
    workspace: ws._id,
    user: req.user._id,
    status: 'active'
  });

  const isOwner = ws.owner?.toString() === req.user._id.toString();

  if (!membership && !isOwner) {
    const autoRole = req.user.role === 'admin' ? 'admin' : (req.user.role === 'manager' ? 'manager' : (req.user.role === 'employee' ? 'employee' : 'member'));
    membership = await WorkspaceMember.findOneAndUpdate(
      { workspace: ws._id, user: req.user._id },
      {
        workspace: ws._id,
        user: req.user._id,
        role: autoRole,
        status: 'active'
      },
      { upsert: true, returnDocument: 'after' }
    );
  }

  req.workspace = ws;
  req.workspaceMember = membership;
  next();
});

export default checkWorkspaceAccess;
