import { AuditLog } from '../../../models/AuditLog.js';
import { User } from '../../../models/User.js';
import { ApiError } from '../../../utils/ApiError.js';
import { resolveWorkspaceDoc } from '../workspaces/workspaces.service.js';

const escapeRegex = (str = '') => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export const getAllAuditLogs = async (query = {}) => {
  const { search = '', category = 'all', status = 'all', page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc' } = query;

  const filter = {};

  if (search.trim()) {
    const cleanSearch = escapeRegex(search.trim());
    filter.$or = [
      { action: { $regex: cleanSearch, $options: 'i' } },
      { details: { $regex: cleanSearch, $options: 'i' } },
      { target: { $regex: cleanSearch, $options: 'i' } },
      { 'actor.name': { $regex: cleanSearch, $options: 'i' } }
    ];
  }

  if (category && category !== 'all') {
    filter.category = category.toLowerCase();
  }

  if (status && status !== 'all') {
    filter.status = status.toLowerCase();
  }

  const parsedPage = Math.max(1, parseInt(page, 10) || 1);
  const parsedLimit = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
  const skip = (parsedPage - 1) * parsedLimit;
  const sortDirection = sortOrder === 'asc' ? 1 : -1;

  const [logs, totalCount] = await Promise.all([
    AuditLog.find(filter)
      .sort({ [sortBy]: sortDirection })
      .skip(skip)
      .limit(parsedLimit)
      .lean(),
    AuditLog.countDocuments(filter)
  ]);

  const totalPages = Math.ceil(totalCount / parsedLimit) || 1;

  return {
    logs: logs.map(l => ({
      id: l._id.toString(),
      action: l.action,
      category: l.category,
      details: l.details,
      actor: l.actor || { name: 'System Sentinel', email: 'system@worksync.internal' },
      target: l.target || '',
      status: l.status,
      ip: l.ip || '127.0.0.1',
      createdAt: l.createdAt
    })),
    totalCount,
    pagination: {
      currentPage: parsedPage,
      totalPages,
      limit: parsedLimit,
      hasNextPage: parsedPage < totalPages,
      hasPrevPage: parsedPage > 1
    }
  };
};

export const getAuditLogById = async (logId) => {
  const log = await AuditLog.findById(logId);
  if (!log) {
    throw new ApiError(404, `Audit log entry not found with ID: ${logId}`);
  }

  return {
    id: log._id.toString(),
    action: log.action,
    category: log.category,
    details: log.details,
    actor: log.actor,
    target: log.target,
    targetId: log.targetId,
    ip: log.ip,
    status: log.status,
    metadata: log.metadata || {},
    createdAt: log.createdAt
  };
};

export const getUserAuditLogs = async (userId, query = {}) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, `User not found with ID: ${userId}`);
  }

  const logs = await AuditLog.find({
    $or: [{ 'actor.user': user._id }, { targetId: user._id.toString() }, { target: user.email }]
  })
    .sort({ createdAt: -1 })
    .limit(50)
    .lean();

  return {
    userId: user._id.toString(),
    userName: user.name,
    totalLogs: logs.length,
    logs: logs.map(l => ({
      id: l._id.toString(),
      action: l.action,
      details: l.details,
      status: l.status,
      createdAt: l.createdAt
    }))
  };
};

export const getWorkspaceAuditLogs = async (workspaceIdentifier, query = {}) => {
  const ws = await resolveWorkspaceDoc(workspaceIdentifier);

  const logs = await AuditLog.find({
    $or: [{ targetId: ws._id.toString() }, { target: ws.name }]
  })
    .sort({ createdAt: -1 })
    .limit(50)
    .lean();

  return {
    workspaceId: ws._id.toString(),
    workspaceName: ws.name,
    totalLogs: logs.length,
    logs: logs.map(l => ({
      id: l._id.toString(),
      action: l.action,
      details: l.details,
      actor: l.actor?.name || 'System',
      status: l.status,
      createdAt: l.createdAt
    }))
  };
};

