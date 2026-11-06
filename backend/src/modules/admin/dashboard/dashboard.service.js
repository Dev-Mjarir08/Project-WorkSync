import mongoose from 'mongoose';
import { WorkspaceMember } from '../../../models/WorkspaceMember.js';
import { Workspace } from '../../../models/Workspace.js';
import { Board } from '../../../models/Board.js';
import { Project } from '../../../models/Project.js';
import { Task } from '../../../models/Task.js';
import { Activity } from '../../../models/Activity.js';
import { ApiError } from '../../../utils/ApiError.js';

export const getWorkspaceDashboardOverview = async (workspaceId) => {
  if (!workspaceId) throw new ApiError(400, 'Workspace ID is required');

  const [stats, taskOverview, recentMembers, recentBoards, recentActivities, overdueTasks] = await Promise.all([
    getWorkspaceDashboardStats(workspaceId),
    getWorkspaceTaskOverview(workspaceId),
    getWorkspaceRecentMembers(workspaceId, 5),
    getWorkspaceRecentBoards(workspaceId, 5),
    getWorkspaceRecentActivities(workspaceId, 10),
    getWorkspaceOverdueTasks(workspaceId)
  ]);

  return {
    stats,
    taskOverview,
    recentMembers,
    recentBoards,
    recentActivities,
    overdueTasks
  };
};

export const getWorkspaceDashboardStats = async (workspaceId) => {
  if (!workspaceId) throw new ApiError(400, 'Workspace ID is required');
  const wsId = new mongoose.Types.ObjectId(workspaceId);

  const [totalMembers, totalBoards, totalProjects, totalTasks] = await Promise.all([
    WorkspaceMember.countDocuments({ workspace: wsId, status: 'active' }),
    Board.countDocuments({ workspace: wsId, isArchived: false }),
    Project.countDocuments({ workspace: wsId }),
    Task.countDocuments({ workspace: wsId })
  ]);

  return {
    totalMembers,
    totalBoards,
    totalProjects,
    totalTasks
  };
};

export const getWorkspaceMemberGrowth = async (workspaceId, days = 30) => {
  if (!workspaceId) throw new ApiError(400, 'Workspace ID is required');
  const wsId = new mongoose.Types.ObjectId(workspaceId);
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const growth = await WorkspaceMember.aggregate([
    {
      $match: {
        workspace: wsId,
        createdAt: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        count: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  return {
    days,
    growth: growth.map(g => ({ date: g._id, newMembers: g.count }))
  };
};

export const getWorkspaceTaskOverview = async (workspaceId) => {
  if (!workspaceId) throw new ApiError(400, 'Workspace ID is required');
  const wsId = new mongoose.Types.ObjectId(workspaceId);

  const tasksByStatus = await Task.aggregate([
    { $match: { workspace: wsId } },
    { $group: { _id: '$status', count: { $sum: 1 } } }
  ]);

  const overview = {
    todo: 0,
    in_progress: 0,
    in_review: 0,
    done: 0,
    total: 0
  };

  tasksByStatus.forEach(item => {
    const statusKey = item._id ? item._id.toLowerCase().replace('-', '_') : 'todo';
    if (overview[statusKey] !== undefined) {
      overview[statusKey] = item.count;
    }
    overview.total += item.count;
  });

  return overview;
};

export const getWorkspaceRecentMembers = async (workspaceId, limit = 5) => {
  if (!workspaceId) throw new ApiError(400, 'Workspace ID is required');
  const wsId = new mongoose.Types.ObjectId(workspaceId);

  const members = await WorkspaceMember.find({ workspace: wsId })
    .populate('user', 'name email avatar')
    .sort({ createdAt: -1 })
    .limit(limit);

  return members.map(m => ({
    id: m._id.toString(),
    userId: m.user?._id?.toString(),
    name: m.user?.name || 'Member',
    email: m.user?.email,
    avatar: m.user?.avatar,
    role: m.role,
    status: m.status,
    joinedAt: m.createdAt
  }));
};

export const getWorkspaceRecentBoards = async (workspaceId, limit = 5) => {
  if (!workspaceId) throw new ApiError(400, 'Workspace ID is required');
  const wsId = new mongoose.Types.ObjectId(workspaceId);

  const boards = await Board.find({ workspace: wsId, isArchived: false })
    .sort({ createdAt: -1 })
    .limit(limit);

  return boards.map(b => ({
    id: b._id.toString(),
    name: b.name,
    description: b.description,
    tasksCount: b.tasksCount || 0,
    createdAt: b.createdAt
  }));
};

export const getWorkspaceRecentActivities = async (workspaceId, limit = 10) => {
  if (!workspaceId) throw new ApiError(400, 'Workspace ID is required');
  const wsId = new mongoose.Types.ObjectId(workspaceId);

  const activities = await Activity.find({ workspace: wsId })
    .populate('user', 'name email avatar')
    .sort({ createdAt: -1 })
    .limit(limit);

  return activities.map(a => ({
    id: a._id.toString(),
    action: a.action,
    entityType: a.entityType,
    entityName: a.entityName,
    userName: a.user?.name || 'System',
    userAvatar: a.user?.avatar,
    createdAt: a.createdAt
  }));
};

export const getWorkspaceOverdueTasks = async (workspaceId) => {
  if (!workspaceId) throw new ApiError(400, 'Workspace ID is required');
  const wsId = new mongoose.Types.ObjectId(workspaceId);
  const now = new Date();

  const overdue = await Task.find({
    workspace: wsId,
    dueDate: { $lt: now },
    status: { $nin: ['done', 'completed'] }
  })
    .populate('assignee', 'name email avatar')
    .sort({ dueDate: 1 })
    .limit(20);

  return {
    overdueCount: overdue.length,
    tasks: overdue.map(t => ({
      id: t._id.toString(),
      title: t.title,
      dueDate: t.dueDate,
      priority: t.priority,
      status: t.status,
      assigneeName: t.assignee?.name || 'Unassigned'
    }))
  };
};
