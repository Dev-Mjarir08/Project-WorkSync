import { Router } from 'express';
import * as auditLogsController from './auditLogs.controller.js';
import { validateRequest } from '../../../middleware/validateRequest.js';
import {
  logIdParamSchema,
  userIdParamSchema,
  workspaceIdParamSchema,
  getAuditLogsQuerySchema
} from '../superAdmin.validation.js';

const router = Router();

router.get('/', validateRequest(getAuditLogsQuerySchema, 'query'), auditLogsController.getAuditLogs);
router.get('/:logId', validateRequest(logIdParamSchema, 'params'), auditLogsController.getAuditLogById);
router.get('/users/:userId', validateRequest(userIdParamSchema, 'params'), auditLogsController.getUserAuditLogs);
router.get(
  '/workspaces/:workspaceId',
  validateRequest(workspaceIdParamSchema, 'params'),
  auditLogsController.getWorkspaceAuditLogs
);

export default router;

