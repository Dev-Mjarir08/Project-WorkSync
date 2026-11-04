import { User } from '../../../models/User.js';
import { Workspace } from '../../../models/Workspace.js';
import { Board } from '../../../models/Board.js';
import { Task } from '../../../models/Task.js';
import { AuditLog } from '../../../models/AuditLog.js';

export const getAnalyticsOverview = async () => {
  const [
    totalUsers,
    activeUsers,
    totalWorkspaces,
    activeWorkspaces,
    totalBoards,
    totalTasks
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ isActive: true }),
    Workspace.countDocuments(),
    Workspace.countDocuments({ status: 'Active' }),
    Board.countDocuments(),
    Task.countDocuments()
  ]);

  return {
    overview: {
      totalUsers,
      activeUsers,
      totalWorkspaces,
      activeWorkspaces,
      totalBoards,
      totalTasks,
      activeRatio: totalUsers > 0 ? `${Math.round((activeUsers / totalUsers) * 100)}%` : '0%',
      databaseStatus: 'connected',
      systemHealth: 'optimal'
    }
  };
};

export const getUserAnalytics = async () => {
  const [totalUsers, activeUsers, inactiveUsers, roleStats] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ isActive: true }),
    User.countDocuments({ isActive: false }),
    User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } }
    ])
  ]);

  const roleDistribution = {};
  roleStats.forEach(r => {
    if (r._id) roleDistribution[r._id] = r.count;
  });

  return {
    totalUsers,
    activeUsers,
    inactiveUsers,
    activePercentage: totalUsers > 0 ? `${Math.round((activeUsers / totalUsers) * 100)}%` : '0%',
    roleDistribution
  };
};

export const getWorkspaceAnalytics = async () => {
  const [totalWorkspaces, activeWorkspaces, archivedWorkspaces, planStats] = await Promise.all([
    Workspace.countDocuments(),
    Workspace.countDocuments({ status: 'Active' }),
    Workspace.countDocuments({ status: 'Archived' }),
    Workspace.aggregate([
      { $group: { _id: '$plan', count: { $sum: 1 } } }
    ])
  ]);

  const planDistribution = { Starter: 0, Pro: 0, Enterprise: 0 };
  planStats.forEach(p => {
    if (p._id && planDistribution[p._id] !== undefined) {
      planDistribution[p._id] = p.count;
    }
  });

  return {
    totalWorkspaces,
    activeWorkspaces,
    archivedWorkspaces,
    planDistribution
  };
};

export const getBoardAnalytics = async () => {
  const [totalBoards, activeBoards, archivedBoards] = await Promise.all([
    Board.countDocuments(),
    Board.countDocuments({ isArchived: false }),
    Board.countDocuments({ isArchived: true })
  ]);

  return {
    totalBoards,
    activeBoards,
    archivedBoards,
    archivedPercentage: totalBoards > 0 ? `${Math.round((archivedBoards / totalBoards) * 100)}%` : '0%'
  };
};

export const getTaskAnalytics = async () => {
  const [totalTasks, statusStats, priorityStats] = await Promise.all([
    Task.countDocuments(),
    Task.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]),
    Task.aggregate([
      { $group: { _id: '$priority', count: { $sum: 1 } } }
    ])
  ]);

  const byStatus = { todo: 0, in_progress: 0, review: 0, done: 0 };
  statusStats.forEach(s => {
    if (s._id && byStatus[s._id] !== undefined) byStatus[s._id] = s.count;
  });

  const byPriority = { low: 0, medium: 0, high: 0, urgent: 0 };
  priorityStats.forEach(p => {
    if (p._id && byPriority[p._id] !== undefined) byPriority[p._id] = p.count;
  });

  return {
    totalTasks,
    byStatus,
    byPriority,
    completionRate: totalTasks > 0 ? `${Math.round((byStatus.done / totalTasks) * 100)}%` : '0%'
  };
};

export const getActivityAnalytics = async () => {
  const categoryStats = await AuditLog.aggregate([
    { $group: { _id: '$category', count: { $sum: 1 } } }
  ]);

  const breakdown = {};
  categoryStats.forEach(c => {
    if (c._id) breakdown[c._id] = c.count;
  });

  const recentCount = await AuditLog.countDocuments({
    createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
  });

  return {
    last24HoursEvents: recentCount,
    categoryDistribution: breakdown
  };
};

export const getEngagementAnalytics = async () => {
  const lastWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [activeThisWeek, totalUsers, totalTasks] = await Promise.all([
    User.countDocuments({ lastLogin: { $gte: lastWeek } }),
    User.countDocuments(),
    Task.countDocuments()
  ]);

  return {
    weeklyActiveUsers: activeThisWeek,
    weeklyActiveRatio: totalUsers > 0 ? `${Math.round((activeThisWeek / totalUsers) * 100)}%` : '0%',
    avgTasksPerUser: totalUsers > 0 ? (totalTasks / totalUsers).toFixed(1) : 0
  };
};

