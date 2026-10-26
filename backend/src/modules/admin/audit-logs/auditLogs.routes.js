import { Router } from 'express';
import * as auditLogsController from './auditLogs.controller.js';

const router = Router();

router.get('/', auditLogsController.getAuditLogs);
router.get('/:logId', auditLogsController.getAuditLogById);

export default router;
