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

const router = Router();

// Protect all Manager routes
router.use(
  authenticate,
  checkWorkspaceAccess,
  authorizeWorkspaceRole(
    WORKSPACE_ROLES.OWNER,
    WORKSPACE_ROLES.ADMIN,
    WORKSPACE_ROLES.MANAGER
  )
);

// 1. Manager Dashboard APIs
router.use('/dashboard', dashboardRoutes);

// 2. Project Management APIs
router.use('/projects', projectsRoutes);

// 3. Board Management APIs
router.use('/boards', boardsRoutes);

// 4. List Management APIs
router.use('/lists', listsRoutes);

// 5. Task Management APIs
router.use('/tasks', tasksRoutes);

export default router;
