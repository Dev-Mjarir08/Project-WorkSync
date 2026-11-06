import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate.js';
import { checkWorkspaceAccess } from '../../middleware/checkWorkspaceAccess.js';
import { authorizeWorkspaceRole } from '../../middleware/authorizeWorkspaceRole.js';
import { WORKSPACE_ROLES } from '../../constants/roles.js';

import dashboardRoutes from './dashboard/dashboard.routes.js';
import workspaceRoutes from './workspace/workspace.routes.js';
import memberRoutes from './members/member.routes.js';
import invitationRoutes from './invitations/invitation.routes.js';
import rolesRoutes from './roles/roles.routes.js';
import boardsRoutes from './boards/boards.routes.js';
import projectsRoutes from './projects/projects.routes.js';
import tasksRoutes from './tasks/tasks.routes.js';
import analyticsRoutes from './analytics/analytics.routes.js';
import activitiesRoutes from './activities/activities.routes.js';
import auditLogsRoutes from './audit-logs/auditLogs.routes.js';
import announcementsRoutes from './announcements/announcements.routes.js';
import notificationsRoutes from './notifications/notifications.routes.js';
import profileRoutes from './profile/profile.routes.js';
import {
  getNotificationSettings,
  updateNotificationSettings
} from './notifications/notifications.controller.js';
import { getAvailablePermissions } from './roles/roles.controller.js';

const router = Router();

router.use(
  authenticate,
  checkWorkspaceAccess,
  authorizeWorkspaceRole(WORKSPACE_ROLES.OWNER, WORKSPACE_ROLES.ADMIN)
);

router.use('/dashboard', dashboardRoutes);
router.use('/members', memberRoutes);
router.use('/invitations', invitationRoutes);
router.use('/roles', rolesRoutes);
router.get('/permissions', getAvailablePermissions);
router.use('/boards', boardsRoutes);
router.use('/projects', projectsRoutes);
router.use('/tasks', tasksRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/activities', activitiesRoutes);
router.use('/audit-logs', auditLogsRoutes);
router.use('/announcements', announcementsRoutes);
router.use('/notifications', notificationsRoutes);
router.get('/notification-settings', getNotificationSettings);
router.patch('/notification-settings', updateNotificationSettings);
router.use('/profile', profileRoutes);
router.use('/workspace', workspaceRoutes);
router.use('/', workspaceRoutes);

export default router;
