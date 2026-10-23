import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate.js';
import { checkWorkspaceAccess } from '../../middleware/checkWorkspaceAccess.js';
import { authorizeWorkspaceRole } from '../../middleware/authorizeWorkspaceRole.js';
import { WORKSPACE_ROLES } from '../../constants/roles.js';

import dashboardRoutes from './dashboard/dashboard.routes.js';
import workspaceRoutes from './workspace/workspace.routes.js';
import memberRoutes from './members/member.routes.js';
import invitationRoutes from './invitations/invitation.routes.js';

const router = Router();

// Protect all Workspace Admin routes
router.use(
  authenticate,
  checkWorkspaceAccess,
  authorizeWorkspaceRole(WORKSPACE_ROLES.OWNER, WORKSPACE_ROLES.ADMIN)
);

// 1. Workspace Dashboard APIs
router.use('/dashboard', dashboardRoutes);

// 2. Member Management APIs
router.use('/members', memberRoutes);

// 3. Invitation Management APIs
router.use('/invitations', invitationRoutes);

// 4. Workspace Management & Settings APIs
router.use('/workspace', workspaceRoutes);
router.use('/', workspaceRoutes);

export default router;
