import mongoose from 'mongoose';
import { Workspace } from '../../../models/Workspace.js';
import { WorkspaceMember } from '../../../models/WorkspaceMember.js';
import { Project } from '../../../models/Project.js';
import { Board } from '../../../models/Board.js';
import { Task } from '../../../models/Task.js';
import { ApiError } from '../../../utils/ApiError.js';

export const getAnalyticsOverview = async (workspaceId) => {
  if (!workspaceId) throw new ApiError(400, 'Workspace ID is required');
  const wsId = new mongoose.Types.ObjectId(workspaceId);

  const [
    totalMembers,
    totalProjects,
    totalBoards,
    totalTasks,
    completedTasks,
    overdueTasks
  ] = await Promise.all([
    WorkspaceMember.countDocuments({ workspace: wsId, status: 'active' }),
    Project.countDocuments({ workspace: wsId }),
    Board.countDocuments({ workspace: wsId }),
    Task.countDocuments({ workspace: wsId }),
    Task.countDocuments({ workspace: wsId, status: 'done' }),
    Task.countDocuments({
      workspace: wsId,
      dueDate: { $lt: new Date() },
      status: { $ne: 'done' }
    })
  ]);

  const activeTasks = Math.max(0, totalTasks - completedTasks);
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const overdueRate = activeTasks > 0 ? Math.round((overdueTasks / activeTasks) * 100) : 0;

  // Productivity score calculation
  const productivityScore = Math.min(
    100,
    Math.max(0, Math.round(completionRate * 0.7 + (100 - overdueRate) * 0.3))
  );

  return {
    overview: {
      totalMembers,
      totalProjects,
      totalBoards,
      totalTasks,
      completedTasks,
      activeTasks,
      overdueTasks,
      completionRate,
      overdueRate,
      productivityScore
    }
  };
};

export const getMemberStatistics = async (workspaceId) => {
  if (!workspaceId) throw new ApiError(400, 'Workspace ID is required');
  const wsId = new mongoose.Types.ObjectId(workspaceId);

  const [totalMembers, byRoleAgg, byStatusAgg, recentMembers] = await Promise.all([
    WorkspaceMember.countDocuments({ workspace: wsId }),
    WorkspaceMember.aggregate([
      { $match: { workspace: wsId } },
      { $group: { _id: '$role', count: { $sum: 1 } } }
    ]),
    WorkspaceMember.aggregate([
      { $match: { workspace: wsId } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]),
    WorkspaceMember.find({ workspace: wsId })
      .populate('user', 'name email avatar')
      .sort({ createdAt: -1 })
      .limit(5)
  ]);

  const byRole = {};
  ['owner', 'admin', 'manager', 'member', 'viewer'].forEach(r => { byRole[r] = 0; });
  byRoleAgg.forEach(item => {
    if (item._id) byRole[item._id] = item.count;
  });

  const byStatus = {};
  ['active', 'invited', 'suspended'].forEach(s => { byStatus[s] = 0; });
  byStatusAgg.forEach(item => {
    if (item._id) byStatus[item._id] = item.count;
  });

  return {
    totalMembers,
    activeMembers: byStatus.active || 0,
    byRole,
    byStatus,
    recentMembers: recentMembers.map(m => ({
      id: m._id.toString(),
      user: m.user ? { id: m.user._id?.toString(), name: m.user.name, email: m.user.email, avatar: m.user.avatar } : null,
      role: m.role,
      status: m.status,
      joinedAt: m.joinedAt || m.createdAt
    }))
  };
};

export const getProjectStatistics = async (workspaceId) => {
  if (!workspaceId) throw new ApiError(400, 'Workspace ID is required');
  const wsId = new mongoose.Types.ObjectId(workspaceId);

  const [totalProjects, byStatusAgg, recentProjects] = await Promise.all([
    Project.countDocuments({ workspace: wsId }),
    Project.aggregate([
      { $match: { workspace: wsId } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]),
    Project.find({ workspace: wsId })
      .populate('lead', 'name email avatar')
      .sort({ createdAt: -1 })
      .limit(5)
  ]);

  const byStatus = {
    planning: 0,
    active: 0,
    on_hold: 0,
    completed: 0,
    archived: 0
  };
  byStatusAgg.forEach(item => {
    if (item._id && byStatus[item._id] !== undefined) {
      byStatus[item._id] = item.count;
    }
  });

  const completedProjects = byStatus.completed || 0;
  const activeProjects = byStatus.active || 0;
  const completionRate = totalProjects > 0 ? Math.round((completedProjects / totalProjects) * 100) : 0;

  return {
    totalProjects,
    activeProjects,
    completedProjects,
    completionRate,
    byStatus,
    recentProjects: recentProjects.map(p => ({
      id: p._id.toString(),
      name: p.name,
      key: p.key,
      status: p.status,
      lead: p.lead ? { id: p.lead._id.toString(), name: p.lead.name, email: p.lead.email } : null,
      membersCount: p.members?.length || 0,
      createdAt: p.createdAt
    }))
  };
};

export const getBoardStatistics = async (workspaceId) => {
  if (!workspaceId) throw new ApiError(400, 'Workspace ID is required');
  const wsId = new mongoose.Types.ObjectId(workspaceId);

  const [totalBoards, activeBoards, archivedBoards, boardsList] = await Promise.all([
    Board.countDocuments({ workspace: wsId }),
    Board.countDocuments({ workspace: wsId, isArchived: false }),
    Board.countDocuments({ workspace: wsId, isArchived: true }),
    Board.find({ workspace: wsId }).select('name tasksCount members isArchived createdAt')
  ]);

  const totalTasksAcrossBoards = boardsList.reduce((acc, b) => acc + (b.tasksCount || 0), 0);
  const averageTasksPerBoard = totalBoards > 0 ? Math.round(totalTasksAcrossBoards / totalBoards) : 0;

  return {
    totalBoards,
    activeBoards,
    archivedBoards,
    averageTasksPerBoard,
    boards: boardsList.map(b => ({
      id: b._id.toString(),
      name: b.name,
      isArchived: b.isArchived,
      tasksCount: b.tasksCount || 0,
      membersCount: b.members?.length || 0,
      createdAt: b.createdAt
    }))
  };
};

export const getTaskStatistics = async (workspaceId) => {
  if (!workspaceId) throw new ApiError(400, 'Workspace ID is required');
  const wsId = new mongoose.Types.ObjectId(workspaceId);

  const [
    totalTasks,
    byStatusAgg,
    byPriorityAgg,
    unassignedCount,
    overdueCount
  ] = await Promise.all([
    Task.countDocuments({ workspace: wsId }),
    Task.aggregate([
      { $match: { workspace: wsId } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]),
    Task.aggregate([
      { $match: { workspace: wsId } },
      { $group: { _id: '$priority', count: { $sum: 1 } } }
    ]),
    Task.countDocuments({
      workspace: wsId,
      $or: [{ assignee: null }, { assignee: { $exists: false } }]
    }),
    Task.countDocuments({
      workspace: wsId,
      dueDate: { $lt: new Date() },
      status: { $ne: 'done' }
    })
  ]);

  const byStatus = { todo: 0, in_progress: 0, review: 0, done: 0 };
  byStatusAgg.forEach(item => {
    if (item._id && byStatus[item._id] !== undefined) {
      byStatus[item._id] = item.count;
    }
  });

  const byPriority = { low: 0, medium: 0, high: 0, urgent: 0 };
  byPriorityAgg.forEach(item => {
    if (item._id && byPriority[item._id] !== undefined) {
      byPriority[item._id] = item.count;
    }
  });

  return {
    totalTasks,
    byStatus,
    byPriority,
    unassignedCount,
    overdueCount
  };
};

export const getCompletedTaskStatistics = async (workspaceId) => {
  if (!workspaceId) throw new ApiError(400, 'Workspace ID is required');
  const wsId = new mongoose.Types.ObjectId(workspaceId);

  const [totalTasks, totalCompleted, byPriorityAgg, recentlyCompleted] = await Promise.all([
    Task.countDocuments({ workspace: wsId }),
    Task.countDocuments({ workspace: wsId, status: 'done' }),
    Task.aggregate([
      { $match: { workspace: wsId, status: 'done' } },
      { $group: { _id: '$priority', count: { $sum: 1 } } }
    ]),
    Task.find({ workspace: wsId, status: 'done' })
      .populate('assignee', 'name email avatar')
      .populate('board', 'name')
      .sort({ updatedAt: -1 })
      .limit(10)
  ]);

  const byPriority = { low: 0, medium: 0, high: 0, urgent: 0 };
  byPriorityAgg.forEach(item => {
    if (item._id && byPriority[item._id] !== undefined) {
      byPriority[item._id] = item.count;
    }
  });

  const completionRate = totalTasks > 0 ? Math.round((totalCompleted / totalTasks) * 100) : 0;

  return {
    totalCompleted,
    totalTasks,
    completionRate,
    byPriority,
    recentlyCompleted
  };
};

export const getOverdueTaskStatistics = async (workspaceId) => {
  if (!workspaceId) throw new ApiError(400, 'Workspace ID is required');
  const wsId = new mongoose.Types.ObjectId(workspaceId);

  const overdueFilter = {
    workspace: wsId,
    dueDate: { $lt: new Date() },
    status: { $ne: 'done' }
  };

  const [totalOverdue, byPriorityAgg, overdueTasks] = await Promise.all([
    Task.countDocuments(overdueFilter),
    Task.aggregate([
      { $match: overdueFilter },
      { $group: { _id: '$priority', count: { $sum: 1 } } }
    ]),
    Task.find(overdueFilter)
      .populate('assignee', 'name email avatar')
      .populate('board', 'name')
      .sort({ dueDate: 1 })
      .limit(20)
  ]);

  const byPriority = { low: 0, medium: 0, high: 0, urgent: 0 };
  byPriorityAgg.forEach(item => {
    if (item._id && byPriority[item._id] !== undefined) {
      byPriority[item._id] = item.count;
    }
  });

  return {
    totalOverdue,
    byPriority,
    overdueTasks
  };
};

export const getTeamProductivity = async (workspaceId) => {
  if (!workspaceId) throw new ApiError(400, 'Workspace ID is required');
  const wsId = new mongoose.Types.ObjectId(workspaceId);

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [
    totalTasks,
    completedTasks,
    weeklyCompleted,
    monthlyCompleted,
    overdueTasks
  ] = await Promise.all([
    Task.countDocuments({ workspace: wsId }),
    Task.countDocuments({ workspace: wsId, status: 'done' }),
    Task.countDocuments({ workspace: wsId, status: 'done', updatedAt: { $gte: sevenDaysAgo } }),
    Task.countDocuments({ workspace: wsId, status: 'done', updatedAt: { $gte: thirtyDaysAgo } }),
    Task.countDocuments({ workspace: wsId, dueDate: { $lt: new Date() }, status: { $ne: 'done' } })
  ]);

  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const overdueRate = totalTasks > 0 ? Math.round((overdueTasks / totalTasks) * 100) : 0;
  const productivityIndex = Math.min(100, Math.max(0, Math.round(completionRate * 0.7 + (100 - overdueRate) * 0.3)));

  return {
    productivityIndex,
    completionRate,
    weeklyCompleted,
    monthlyCompleted,
    totalCompleted: completedTasks,
    totalTasks
  };
};

export const getMemberWorkload = async (workspaceId) => {
  if (!workspaceId) throw new ApiError(400, 'Workspace ID is required');
  const wsId = new mongoose.Types.ObjectId(workspaceId);

  const members = await WorkspaceMember.find({ workspace: wsId, status: 'active' })
    .populate('user', 'name email avatar role');

  const now = new Date();

  const workload = await Promise.all(
    members.map(async (m) => {
      const userId = m.user?._id;
      if (!userId) return null;

      const [totalTasks, completedTasks, overdueTasks] = await Promise.all([
        Task.countDocuments({ workspace: wsId, assignee: userId }),
        Task.countDocuments({ workspace: wsId, assignee: userId, status: 'done' }),
        Task.countDocuments({ workspace: wsId, assignee: userId, dueDate: { $lt: now }, status: { $ne: 'done' } })
      ]);

      const pendingTasks = Math.max(0, totalTasks - completedTasks);

      let workloadLevel = 'low';
      if (pendingTasks > 10) workloadLevel = 'overloaded';
      else if (pendingTasks >= 6) workloadLevel = 'high';
      else if (pendingTasks >= 3) workloadLevel = 'medium';

      return {
        memberId: m._id.toString(),
        user: {
          id: userId.toString(),
          name: m.user.name,
          email: m.user.email,
          avatar: m.user.avatar
        },
        workspaceRole: m.role,
        totalTasks,
        completedTasks,
        pendingTasks,
        overdueTasks,
        workloadLevel
      };
    })
  );

  return workload.filter(Boolean).sort((a, b) => b.pendingTasks - a.pendingTasks);
};
