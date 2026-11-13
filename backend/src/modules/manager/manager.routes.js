import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate.js';
import { checkWorkspaceAccess } from '../../middleware/checkWorkspaceAccess.js';
import { authorizeWorkspaceRole } from '../../middleware/authorizeWorkspaceRole.js';
import { WORKSPACE_ROLES } from '../../constants/roles.js';

import dashboardRoutes from './dashboard/dashboard.routes.js';
import projectsRoutes from './projects/projects.routes.js';
import boardsRoutes from './boards/boards.routes.js';
import listsRoutes from './lists/lists.routes.js';
import tasksRoutes from './tasks/tasks.routes.js';
import teamRoutes from './team/team.routes.js';
import reportsRoutes from './reports/reports.routes.js';
import commentsRoutes from './comments/comments.routes.js';
import activitiesRoutes from './activities/activities.routes.js';
import notificationsRoutes from './notifications/notifications.routes.js';
import profileRoutes from './profile/profile.routes.js';
import {
  getNotificationSettings,
  updateNotificationSettings
} from './notifications/notifications.controller.js';

const router = Router();

router.use(
  authenticate,
  checkWorkspaceAccess,
  authorizeWorkspaceRole(
    WORKSPACE_ROLES.OWNER,
    WORKSPACE_ROLES.ADMIN,
    WORKSPACE_ROLES.MANAGER
  )
);

router.use('/dashboard', dashboardRoutes);
router.use('/projects', projectsRoutes);
router.use('/boards', boardsRoutes);
router.use('/lists', listsRoutes);
router.use('/tasks', tasksRoutes);
router.use('/team', teamRoutes);
router.use('/reports', reportsRoutes);
router.use('/comments', commentsRoutes);
router.use('/activities', activitiesRoutes);
router.use('/notifications', notificationsRoutes);
router.get('/notification-settings', getNotificationSettings);
router.patch('/notification-settings', updateNotificationSettings);
router.use('/profile', profileRoutes);

export default router;
