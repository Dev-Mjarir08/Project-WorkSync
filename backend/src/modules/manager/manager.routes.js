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

export default router;
