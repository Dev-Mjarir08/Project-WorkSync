import { ApiError } from '../utils/ApiError.js';
import { ROLES, WORKSPACE_ROLES } from '../constants/roles.js';

/**
 * Middleware to authorize workspace-level roles (e.g. 'owner', 'admin', 'manager')
 * Resolves workspace context if not already attached.
 */
export const authorizeWorkspaceRole = (...allowedRoles) => {
  return (req, res, next) => {
    // Platform Super Admin always has full access
    if (req.user?.role === ROLES.SUPER_ADMIN) {
      return next();
    }

    const isOwner = req.workspace?.owner?.toString() === req.user?._id?.toString();
    const userRole = isOwner ? WORKSPACE_ROLES.OWNER : req.workspaceMember?.role;

    if (!userRole) {
      throw new ApiError(403, 'Forbidden: You do not have an active role in this workspace');
    }

    const normalizedAllowed = allowedRoles.map(r => r.toLowerCase());
    
    // Owner has super-workspace privileges
    if (isOwner && (normalizedAllowed.includes(WORKSPACE_ROLES.OWNER) || normalizedAllowed.includes(WORKSPACE_ROLES.ADMIN))) {
      return next();
    }

    if (!normalizedAllowed.includes(userRole.toLowerCase())) {
      throw new ApiError(403, `Forbidden: Requires [${allowedRoles.join(', ')}] role. Current role: ${userRole}`);
    }

    next();
  };
};

export default authorizeWorkspaceRole;
