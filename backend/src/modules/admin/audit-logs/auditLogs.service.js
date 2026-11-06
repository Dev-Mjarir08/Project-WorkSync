import mongoose from 'mongoose';
import { AuditLog } from '../../../models/AuditLog.js';
import { ApiError } from '../../../utils/ApiError.js';

export const getAuditLogs = async (workspaceId, query = {}) => {
  if (!workspaceId) throw new ApiError(400, 'Workspace ID is required');
  const wsId = new mongoose.Types.ObjectId(workspaceId);

  const page = parseInt(query.page, 10) || 1;
  const limit = parseInt(query.limit, 10) || 20;
  const skip = (page - 1) * limit;

  const filter = {
    $or: [
      { workspace: wsId },
      { targetId: wsId.toString() },
      { 'metadata.workspaceId': wsId.toString() }
    ]
  };

  if (query.category) {
    filter.category = query.category.toLowerCase();
  }
  if (query.status) {
    filter.status = query.status.toLowerCase();
  }
  if (query.action) {
    filter.action = { $regex: query.action, $options: 'i' };
  }
  if (query.search) {
    filter.$or = [
      { action: { $regex: query.search, $options: 'i' } },
      { details: { $regex: query.search, $options: 'i' } },
      { target: { $regex: query.search, $options: 'i' } }
    ];
  }

  const [logs, total] = await Promise.all([
    AuditLog.find(filter)
      .populate('actor.user', 'name email avatar role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    AuditLog.countDocuments(filter)
  ]);

  return {
    logs,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit) || 1
    }
  };
};

export const getAuditLogById = async (workspaceId, logId) => {
  if (!workspaceId) throw new ApiError(400, 'Workspace ID is required');
  if (!logId) throw new ApiError(400, 'Audit Log ID is required');

  const wsId = workspaceId.toString();

  const log = await AuditLog.findOne({
    _id: logId,
    $or: [
      { workspace: workspaceId },
      { targetId: wsId },
      { 'metadata.workspaceId': wsId }
    ]
  }).populate('actor.user', 'name email avatar role');

  if (!log) {
    throw new ApiError(404, 'Audit log not found');
  }

  return log;
};
