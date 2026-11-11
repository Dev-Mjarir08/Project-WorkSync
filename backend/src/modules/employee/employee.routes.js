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

import assignmentsRoutes from '../manager/assignments/assignments.routes.js';
import * as assignmentsController from '../manager/assignments/assignments.controller.js';
import teamRoutes from '../manager/team/team.routes.js';
import reportsRoutes from '../manager/reports/reports.routes.js';
import commentsRoutes from '../manager/comments/comments.routes.js';
import activitiesRoutes from '../manager/activities/activities.routes.js';
import notificationsRoutes from '../manager/notifications/notifications.routes.js';
import profileRoutes from '../manager/profile/profile.routes.js';
import {
  getNotificationSettings,
  updateNotificationSettings
} from '../manager/notifications/notifications.controller.js';

const router = Router();

router.use(
  authenticate,
  checkWorkspaceAccess,
  authorizeWorkspaceRole(
    WORKSPACE_ROLES.OWNER,
    WORKSPACE_ROLES.ADMIN,
    WORKSPACE_ROLES.MANAGER,
    WORKSPACE_ROLES.MEMBER,
    'employee'
  )
);

router.use('/dashboard', dashboardRoutes);
router.use('/projects', projectsRoutes);
router.use('/boards', boardsRoutes);
router.use('/lists', listsRoutes);
router.use('/tasks', tasksRoutes);

router.use('/assignments', assignmentsRoutes);
router.get('/members/:memberId/assignments', assignmentsController.getMemberAssignments);
router.use('/team', teamRoutes);
router.use('/reports', reportsRoutes);
router.use('/comments', commentsRoutes);
router.use('/activities', activitiesRoutes);
router.use('/notifications', notificationsRoutes);
router.get('/notification-settings', getNotificationSettings);
router.patch('/notification-settings', updateNotificationSettings);
router.use('/profile', profileRoutes);

export default router;
