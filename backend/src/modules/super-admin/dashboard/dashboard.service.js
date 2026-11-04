import { User } from '../../../models/User.js';
import { Workspace } from '../../../models/Workspace.js';
import { Board } from '../../../models/Board.js';
import { Task } from '../../../models/Task.js';
import { AuditLog } from '../../../models/AuditLog.js';
import { Activity } from '../../../models/Activity.js';

export const getDashboardOverview = async () => {
  const [
    totalUsers,
    activeUsers,
    totalWorkspaces,
    activeWorkspaces,
    totalBoards,
    totalTasks,
    recentUsers,
    recentWorkspaces,
    recentActivities
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ isActive: true }),
    Workspace.countDocuments(),
    Workspace.countDocuments({ status: 'Active' }),
    Board.countDocuments(),
    Task.countDocuments(),
    User.find().sort({ createdAt: -1 }).limit(5).select('-password').lean(),
    Workspace.find().sort({ createdAt: -1 }).limit(5).lean(),
    AuditLog.find().sort({ createdAt: -1 }).limit(6).lean()
  ]);

  return {
    stats: {
      totalUsers,
      activeUsers,
      totalWorkspaces,
      activeWorkspaces,
      totalBoards,
      totalTasks
    },
    recentUsers: recentUsers.map(u => ({
      id: u._id.toString(),
      name: u.name,
      email: u.email,
      role: u.role,
      avatar: u.avatar || '',
      isActive: u.isActive,
      createdAt: u.createdAt
    })),
    recentWorkspaces: recentWorkspaces.map(w => ({
      id: w._id.toString(),
      name: w.name,
      slug: w.slug,
      plan: w.plan,
      status: w.status,
      membersCount: w.membersCount || 1,
      createdAt: w.createdAt
    })),
    recentActivities: recentActivities.map(a => ({
      id: a._id.toString(),
      action: a.action,
      details: a.details,
      actor: a.actor?.name || 'System',
      target: a.target || '',
      status: a.status,
      createdAt: a.createdAt
    }))
  };
};

export const getDashboardStats = async () => {
  const [totalUsers, activeUsers, totalWorkspaces, activeWorkspaces, totalBoards, totalTasks] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ isActive: true }),
    Workspace.countDocuments(),
    Workspace.countDocuments({ status: 'Active' }),
    Board.countDocuments(),
    Task.countDocuments()
  ]);

  return {
    totalUsers,
    activeUsers,
    totalWorkspaces,
    activeWorkspaces,
    totalBoards,
    totalTasks,
    systemStatus: 'healthy',
    timestamp: new Date().toISOString()
  };
};

export const getUserGrowth = async (days = 30) => {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - parseInt(days, 10));

  const growthData = await User.aggregate([
    { $match: { createdAt: { $gte: startDate } } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        count: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  return {
    timeframeDays: days,
    timeline: growthData.map(item => ({
      date: item._id,
      newUsers: item.count
    }))
  };
};

export const getWorkspaceGrowth = async (days = 30) => {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - parseInt(days, 10));

  const growthData = await Workspace.aggregate([
    { $match: { createdAt: { $gte: startDate } } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        count: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  return {
    timeframeDays: days,
    timeline: growthData.map(item => ({
      date: item._id,
      newWorkspaces: item.count
    }))
  };
};

export const getRecentUsers = async (limit = 10) => {
  const parsedLimit = Math.min(50, Math.max(1, parseInt(limit, 10) || 10));
  const users = await User.find()
    .sort({ createdAt: -1 })
    .limit(parsedLimit)
    .select('-password')
    .lean();

  return users.map(u => ({
    id: u._id.toString(),
    name: u.name,
    email: u.email,
    role: u.role,
    avatar: u.avatar || '',
    isActive: u.isActive,
    lastLogin: u.lastLogin,
    createdAt: u.createdAt
  }));
};

export const getRecentWorkspaces = async (limit = 10) => {
  const parsedLimit = Math.min(50, Math.max(1, parseInt(limit, 10) || 10));
  const workspaces = await Workspace.find()
    .sort({ createdAt: -1 })
    .limit(parsedLimit)
    .populate('owner', 'name email avatar')
    .lean();

  return workspaces.map(w => ({
    id: w._id.toString(),
    name: w.name,
    slug: w.slug,
    description: w.description || '',
    plan: w.plan,
    status: w.status,
    membersCount: w.membersCount || 1,
    boardsCount: w.boardsCount || 0,
    owner: w.owner || w.ownerDetails,
    createdAt: w.createdAt
  }));
};

export const getRecentActivities = async (limit = 15) => {
  const parsedLimit = Math.min(50, Math.max(1, parseInt(limit, 10) || 15));

  const activities = await Activity.find()
    .sort({ createdAt: -1 })
    .limit(parsedLimit)
    .populate('user', 'name email avatar')
    .populate('workspace', 'name slug')
    .lean();

  if (activities.length > 0) {
    return activities.map(a => ({
      id: a._id.toString(),
      action: a.action,
      type: a.type,
      description: a.description,
      user: a.user ? { id: a.user._id.toString(), name: a.user.name, email: a.user.email } : null,
      workspace: a.workspace ? { id: a.workspace._id.toString(), name: a.workspace.name } : null,
      createdAt: a.createdAt
    }));
  }

  const auditLogs = await AuditLog.find()
    .sort({ createdAt: -1 })
    .limit(parsedLimit)
    .lean();

  return auditLogs.map(a => ({
    id: a._id.toString(),
    action: a.action,
    type: a.category || 'system',
    description: a.details,
    actor: a.actor?.name || 'System Sentinel',
    target: a.target || '',
    status: a.status,
    createdAt: a.createdAt
  }));
};

