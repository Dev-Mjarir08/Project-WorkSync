import { asyncHandler } from '../../../utils/asyncHandler.js';
import { ApiResponse } from '../../../utils/ApiResponse.js';
import * as auditLogsService from './auditLogs.service.js';

export const getAuditLogs = asyncHandler(async (req, res) => {
  const result = await auditLogsService.getAllAuditLogs(req.query);
  return res.status(200).json(new ApiResponse(200, result, 'Audit logs retrieved successfully'));
});

export const getAuditLogById = asyncHandler(async (req, res) => {
  const log = await auditLogsService.getAuditLogById(req.params.logId);
  return res.status(200).json(new ApiResponse(200, { log }, 'Audit log details retrieved successfully'));
});

export const getUserAuditLogs = asyncHandler(async (req, res) => {
  const result = await auditLogsService.getUserAuditLogs(req.params.userId, req.query);
  return res.status(200).json(new ApiResponse(200, result, 'User audit logs retrieved successfully'));
});

export const getWorkspaceAuditLogs = asyncHandler(async (req, res) => {
  const result = await auditLogsService.getWorkspaceAuditLogs(req.params.workspaceId, req.query);
  return res.status(200).json(new ApiResponse(200, result, 'Workspace audit logs retrieved successfully'));
});

