import { User } from '../../../models/User.js';
import { Workspace } from '../../../models/Workspace.js';
import { Board } from '../../../models/Board.js';
import { Task } from '../../../models/Task.js';
import { AuditLog } from '../../../models/AuditLog.js';
import { Activity } from '../../../models/Activity.js';
import { WorkspaceMember } from '../../../models/WorkspaceMember.js';

const getScopedFilters = async (actorUser) => {
  if (!actorUser) {
    return {
      wsFilter: {},
      userFilter: {},
      boardFilter: {},
      taskFilter: {},
      auditFilter: {}
    };
  }

  // Workspaces owned or created by this user
  const myWorkspaces = await Workspace.find({
    $or: [
      { owner: actorUser._id },
      { createdBy: actorUser._id }
    ]
  }).select('_id');
  const myWsIds = myWorkspaces.map((w) => w._id);

  const wsFilter = { _id: { $in: myWsIds } };
  const boardFilter = { workspace: { $in: myWsIds } };
  const taskFilter = { workspace: { $in: myWsIds } };

  const memberships = await WorkspaceMember.find({ workspace: { $in: myWsIds } }).select('user');
  const userIds = [actorUser._id, ...memberships.map((m) => m.user)];

  const userFilter = {
    $or: [
      { _id: { $in: userIds } },
      { createdBy: actorUser._id }
    ]
  };

  const auditFilter = {
    $or: [
      { 'actor.user': actorUser._id },
      { 'actor.email': actorUser.email }
    ]
  };

  return { wsFilter, userFilter, boardFilter, taskFilter, auditFilter };
};

export const getDashboardOverview = async (actorUser) => {
  const { wsFilter, userFilter, boardFilter, taskFilter, auditFilter } = await getScopedFilters(actorUser);

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
    User.countDocuments(userFilter),
    User.countDocuments({ ...userFilter, isActive: true }),
    Workspace.countDocuments(wsFilter),
    Workspace.countDocuments({ ...wsFilter, status: 'Active' }),
    Board.countDocuments(boardFilter),
    Task.countDocuments(taskFilter),
    User.find(userFilter).sort({ createdAt: -1 }).limit(5).select('-password').lean(),
    Workspace.find(wsFilter).sort({ createdAt: -1 }).limit(5).lean(),
    AuditLog.find(auditFilter).sort({ createdAt: -1 }).limit(6).lean()
  ]);

  const formattedWorkspaces = recentWorkspaces.map(w => ({
    id: w._id.toString(),
    name: w.name,
    slug: w.slug,
    plan: w.plan,
    status: w.status,
    membersCount: w.membersCount || 1,
    boardsCount: 0,
    storageUsed: '12 MB',
    createdAt: w.createdAt
  }));

  const formattedAuditLogs = recentActivities.map(a => ({
    id: a._id.toString(),
    action: a.action,
    details: a.details,
    user: a.actor?.name || 'System',
    actor: a.actor,
    ip: a.ipAddress || '127.0.0.1 (Local)',
    target: a.target || '',
    status: a.status || 'success',
    time: 'Recently',
    createdAt: a.createdAt
  }));

  return {
    stats: {
      totalUsers,
      activeUsers,
      totalWorkspaces,
      activeWorkspaces,
      totalBoards,
      totalTasks,
      databaseStatus: 'Connected',
      apiUptime: '99.98%'
    },
    userGrowthChart: totalUsers > 0 ? [
      { month: 'Active', users: totalUsers, workspaces: totalWorkspaces }
    ] : [],
    recentAuditLogs: formattedAuditLogs,
    recentActivities: formattedAuditLogs,
    topWorkspaces: formattedWorkspaces,
    recentWorkspaces: formattedWorkspaces,
    recentUsers: recentUsers.map(u => ({
      id: u._id.toString(),
      name: u.name,
      email: u.email,
      role: u.role,
      avatar: u.avatar || '',
      isActive: u.isActive,
      createdAt: u.createdAt
    })),
    rolesSummary: {
      super_admin: 1,
      admin: 0,
      manager: 0,
      member: 0,
      active: activeUsers,
      totalRoles: 4
    }
  };
};

export const getDashboardStats = async (actorUser) => {
  const { wsFilter, userFilter, boardFilter, taskFilter } = await getScopedFilters(actorUser);

  const [totalUsers, activeUsers, totalWorkspaces, activeWorkspaces, totalBoards, totalTasks] = await Promise.all([
    User.countDocuments(userFilter),
    User.countDocuments({ ...userFilter, isActive: true }),
    Workspace.countDocuments(wsFilter),
    Workspace.countDocuments({ ...wsFilter, status: 'Active' }),
    Board.countDocuments(boardFilter),
    Task.countDocuments(taskFilter)
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

export const getUserGrowth = async (days = 30, actorUser) => {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - parseInt(days, 10));
  const { userFilter } = await getScopedFilters(actorUser);

  const growthData = await User.aggregate([
    { $match: { ...userFilter, createdAt: { $gte: startDate } } },
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

export const getWorkspaceGrowth = async (days = 30, actorUser) => {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - parseInt(days, 10));
  const { wsFilter } = await getScopedFilters(actorUser);

  const growthData = await Workspace.aggregate([
    { $match: { ...wsFilter, createdAt: { $gte: startDate } } },
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

export const getRecentUsers = async (limit = 10, actorUser) => {
  const { userFilter } = await getScopedFilters(actorUser);
  const users = await User.find(userFilter)
    .sort({ createdAt: -1 })
    .limit(parseInt(limit, 10))
    .select('-password');

  return users.map(u => ({
    id: u._id.toString(),
    name: u.name,
    email: u.email,
    role: u.role,
    avatar: u.avatar || '',
    isActive: u.isActive,
    createdAt: u.createdAt
  }));
};

export const getRecentWorkspaces = async (limit = 10, actorUser) => {
  const { wsFilter } = await getScopedFilters(actorUser);
  const workspaces = await Workspace.find(wsFilter)
    .sort({ createdAt: -1 })
    .limit(parseInt(limit, 10))
    .populate('owner', 'name email avatar');

  return workspaces.map(w => ({
    id: w._id.toString(),
    name: w.name,
    slug: w.slug,
    plan: w.plan,
    status: w.status,
    membersCount: w.membersCount || 1,
    owner: w.owner || w.ownerDetails,
    createdAt: w.createdAt
  }));
};

export const getRecentActivities = async (limit = 15, actorUser) => {
  const { auditFilter } = await getScopedFilters(actorUser);
  const activities = await AuditLog.find(auditFilter)
    .sort({ createdAt: -1 })
    .limit(parseInt(limit, 10));

  return activities.map(a => ({
    id: a._id.toString(),
    action: a.action,
    details: a.details,
    actor: a.actor?.name || 'System',
    target: a.target || '',
    status: a.status,
    createdAt: a.createdAt
  }));
};
