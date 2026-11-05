import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate.js';
import { authorizePlatformRole } from '../../middleware/authorizePlatformRole.js';
import { ROLES } from '../../constants/roles.js';

import dashboardRoutes from './dashboard/dashboard.routes.js';
import usersRoutes from './users/users.routes.js';
import workspacesRoutes from './workspaces/workspaces.routes.js';
import adminsRoutes from './admins/admins.routes.js';
import rolesRoutes from './roles/roles.routes.js';
import boardsRoutes from './boards/boards.routes.js';
import tasksRoutes from './tasks/tasks.routes.js';
import analyticsRoutes from './analytics/analytics.routes.js';
import auditLogsRoutes from './audit-logs/auditLogs.routes.js';
import announcementsRoutes from './announcements/announcements.routes.js';
import settingsRoutes from './settings/settings.routes.js';
import systemRoutes from './system/system.routes.js';
import profileRoutes from './profile/profile.routes.js';

import { getPermissions } from './roles/roles.controller.js';
import { getSystemHealth } from './system/system.controller.js';
import { getAnalyticsOverview } from './analytics/analytics.controller.js';
import { updateGeneralSettings } from './settings/settings.controller.js';
import { validateRequest } from '../../middleware/validateRequest.js';
import { updateGeneralSettingsSchema } from './superAdmin.validation.js';

const router = Router();

// =========================================================================
// Protect all Super Admin routes with Authentication & Super Admin Role
// =========================================================================
router.use(authenticate, authorizePlatformRole(ROLES.SUPER_ADMIN));

// =========================================================================
// Feature-Wise Sub-Routers
// =========================================================================
router.use('/dashboard', dashboardRoutes);
router.use('/users', usersRoutes);
router.use('/workspaces', workspacesRoutes);
router.use('/admins', adminsRoutes);
router.use('/roles', rolesRoutes);
router.use('/boards', boardsRoutes);
router.use('/tasks', tasksRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/audit-logs', auditLogsRoutes);
router.use('/announcements', announcementsRoutes);
router.use('/settings', settingsRoutes);
router.use('/system', systemRoutes);
router.use('/profile', profileRoutes);

// Root-level endpoints and backwards-compatibility aliases
router.get('/permissions', getPermissions);
router.get('/health', getSystemHealth);
router.get('/analytics', getAnalyticsOverview);
router.patch('/settings', validateRequest(updateGeneralSettingsSchema, 'body'), updateGeneralSettings);

export default router;
