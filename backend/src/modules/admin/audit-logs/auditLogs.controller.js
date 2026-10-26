import { asyncHandler } from '../../../utils/asyncHandler.js';
import { ApiResponse } from '../../../utils/ApiResponse.js';
import * as auditLogsService from './auditLogs.service.js';

const getWorkspaceId = (req) => {
  return (
    req.workspace?._id?.toString() ||
    req.params.workspaceId ||
    req.headers['x-workspace-id'] ||
    req.query.workspaceId
  );
};

export const getAuditLogs = asyncHandler(async (req, res) => {
  const wsId = getWorkspaceId(req);
  const data = await auditLogsService.getAuditLogs(wsId, req.query);
  return res.status(200).json(new ApiResponse(200, data, 'Workspace audit logs fetched successfully'));
});

export const getAuditLogById = asyncHandler(async (req, res) => {
  const wsId = getWorkspaceId(req);
  const data = await auditLogsService.getAuditLogById(wsId, req.params.logId);
  return res.status(200).json(new ApiResponse(200, { log: data }, 'Audit log details fetched successfully'));
});
