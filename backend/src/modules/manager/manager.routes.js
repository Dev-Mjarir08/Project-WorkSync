import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate.js';
import { authorizeWorkspaceRole } from '../../middleware/authorizeWorkspaceRole.js';
import { WORKSPACE_ROLES } from '../../constants/roles.js';

const router = Router();

// Protect Manager routes
router.use(authenticate, authorizeWorkspaceRole(WORKSPACE_ROLES.MANAGER, WORKSPACE_ROLES.ADMIN, WORKSPACE_ROLES.OWNER));

router.get('/dashboard', (req, res) => {
  res.status(200).json({ success: true, message: 'Manager dashboard metrics' });
});

export default router;

