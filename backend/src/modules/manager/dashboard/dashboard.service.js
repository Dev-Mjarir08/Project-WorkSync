import mongoose from 'mongoose';
import { Project } from '../../../models/Project.js';
import { Board } from '../../../models/Board.js';
import { Task } from '../../../models/Task.js';
import { WorkspaceMember } from '../../../models/WorkspaceMember.js';
import { Workspace } from '../../../models/Workspace.js';
import { Activity } from '../../../models/Activity.js';
import { ApiError } from '../../../utils/ApiError.js';

const resolveWorkspaceId = async (workspaceId, user) => {
  if (workspaceId && mongoose.Types.ObjectId.isValid(workspaceId)) {
    return new mongoose.Types.ObjectId(workspaceId);
  }
  if (user?._id) {
    const member = await WorkspaceMember.findOne({ user: user._id, status: 'active' }).select('workspace');
    if (member?.workspace) return member.workspace;

    const ownerWs = await Workspace.findOne({
      $or: [{ owner: user._id }, { createdBy: user._id }],
      isActive: true
    }).select('_id');
    if (ownerWs?._id) return ownerWs._id;
  }
  const defaultWs = await Workspace.findOne({ isActive: true }).select('_id');
  return defaultWs?._id || null;
};

export const getManagerDashboardStats = async (workspaceId, user) => {
  const wsId = await resolveWorkspaceId(workspaceId, user);
  const userId = user?._id && mongoose.Types.ObjectId.isValid(user._id)
    ? new mongoose.Types.ObjectId(user._id)
    : null;

  const now = new Date();
  const taskQuery = wsId
    ? (userId ? { $or: [{ workspace: wsId }, { assignee: userId }] } : { workspace: wsId })
    : (userId ? { assignee: userId } : {});

  const [
    totalProjects,
    assignedProjects,
    totalTasks,
    myAssignedTasks,
    completedTasks,
    inProgressTasks,
    overdueTasks,
    teamMembersCount
  ] = await Promise.all([
    wsId ? Project.countDocuments({ workspace: wsId }) : Project.countDocuments(),
    wsId && userId
      ? Project.countDocuments({ workspace: wsId, $or: [{ lead: userId }, { members: userId }] })
      : Project.countDocuments(),
    Task.countDocuments(taskQuery),
    userId
      ? Task.countDocuments({ assignee: userId })
      : Task.countDocuments(taskQuery),
    Task.countDocuments({ ...taskQuery, status: { $in: ['done', 'completed', 'Done', 'Completed'] } }),
    Task.countDocuments({ ...taskQuery, status: { $in: ['in_progress', 'InProgress', 'In Progress'] } }),
    Task.countDocuments({
      ...taskQuery,
      dueDate: { $lt: now },
      status: { $nin: ['done', 'completed', 'Done', 'Completed'] }
    }),
    wsId ? WorkspaceMember.countDocuments({ workspace: wsId, status: 'active' }) : WorkspaceMember.countDocuments({ status: 'active' })
  ]);

  return {
    totalProjects,
    assignedProjects,
    totalTasks,
    myAssignedTasks,
    completedTasks,
    inProgressTasks,
    overdueTasks,
    totalTeamMembers: teamMembersCount,
    completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
  };
};

export const getManagerAssignedProjects = async (workspaceId, user) => {
  const wsId = await resolveWorkspaceId(workspaceId, user);
  const userId = user?._id && mongoose.Types.ObjectId.isValid(user._id)
    ? new mongoose.Types.ObjectId(user._id)
    : null;

  let projects = [];
  if (wsId) {
    if (userId) {
      projects = await Project.find({
        workspace: wsId,
        $or: [{ lead: userId }, { members: userId }, { owner: userId }]
      })
        .populate('lead', 'name email avatar')
        .populate('members', 'name email avatar')
        .sort({ updatedAt: -1 });
    }
    if (projects.length === 0) {
      projects = await Project.find({ workspace: wsId })
        .populate('lead', 'name email avatar')
        .populate('members', 'name email avatar')
        .sort({ updatedAt: -1 });
    }
  }

  if (projects.length === 0) {
    projects = await Project.find({})
      .populate('lead', 'name email avatar')
      .populate('members', 'name email avatar')
      .sort({ updatedAt: -1 })
      .limit(20);
  }

  // Calculate task counts per project
  const projectIds = projects.map(p => p._id);
  const taskAggregations = await Task.aggregate([
    { $match: { project: { $in: projectIds } } },
    {
      $group: {
        _id: '$project',
        totalTasks: { $sum: 1 },
        completedTasks: {
          $sum: { $cond: [{ $in: ['$status', ['done', 'completed', 'Done', 'Completed']] }, 1, 0] }
        }
      }
    }
  ]);

  const taskMap = {};
  taskAggregations.forEach(t => {
    taskMap[t._id.toString()] = t;
  });

  return projects.map(p => {
    const pId = p._id.toString();
    const taskData = taskMap[pId] || { totalTasks: 0, completedTasks: 0 };
    const progress =
      taskData.totalTasks > 0
        ? Math.round((taskData.completedTasks / taskData.totalTasks) * 100)
        : 0;

    return {
      id: pId,
      name: p.name,
      key: p.key,
      description: p.description,
      status: p.status,
      priority: p.priority || 'medium',
      lead: p.lead
        ? {
            id: p.lead._id.toString(),
            name: p.lead.name,
            email: p.lead.email,
            avatar: p.lead.avatar
          }
        : null,
      members: (p.members || []).map(m => ({
        id: m._id.toString(),
        name: m.name,
        email: m.email,
        avatar: m.avatar
      })),
      membersCount: p.members?.length || 0,
      totalTasks: taskData.totalTasks,
      completedTasks: taskData.completedTasks,
      progress,
      startDate: p.startDate,
      dueDate: p.dueDate,
      createdAt: p.createdAt
    };
  });
};

export const getManagerTaskOverview = async (workspaceId, user) => {
  const wsId = await resolveWorkspaceId(workspaceId, user);
  const userId = user?._id && mongoose.Types.ObjectId.isValid(user._id)
    ? new mongoose.Types.ObjectId(user._id)
    : null;

  const matchFilter = wsId
    ? (userId ? { $or: [{ workspace: wsId }, { assignee: userId }] } : { workspace: wsId })
    : (userId ? { assignee: userId } : {});

  const agg = await Task.aggregate([
    ...(Object.keys(matchFilter).length ? [{ $match: matchFilter }] : []),
    { $group: { _id: '$status', count: { $sum: 1 } } }
  ]);

  const counts = { todo: 0, in_progress: 0, review: 0, done: 0 };
  let total = 0;

  agg.forEach(item => {
    if (counts[item._id] !== undefined) {
      counts[item._id] = item.count;
    }
    total += item.count;
  });

  const completionRate = total > 0 ? Math.round((counts.done / total) * 100) : 0;

  return {
    ...counts,
    total,
    completionRate
  };
};

export const getManagerRecentTasks = async (workspaceId, user, limit = 10) => {
  const wsId = await resolveWorkspaceId(workspaceId, user);
  const userObjectId = user?._id && mongoose.Types.ObjectId.isValid(user._id)
    ? new mongoose.Types.ObjectId(user._id)
    : null;

  const orConditions = [];
  if (wsId) orConditions.push({ workspace: wsId });
  if (userObjectId) orConditions.push({ assignee: userObjectId });

  let filter = orConditions.length > 0 ? { $or: orConditions } : {};

  let tasks = await Task.find(filter)
    .populate('assignee', 'name email avatar')
    .populate('project', 'name key status')
    .populate('board', 'name')
    .populate('list', 'name')
    .sort({ updatedAt: -1 })
    .limit(limit);

  if (tasks.length === 0 && userObjectId) {
    tasks = await Task.find({ assignee: userObjectId })
      .populate('assignee', 'name email avatar')
      .populate('project', 'name key status')
      .populate('board', 'name')
      .populate('list', 'name')
      .sort({ updatedAt: -1 })
      .limit(limit);
  }

  if (tasks.length === 0) {
    tasks = await Task.find({})
      .populate('assignee', 'name email avatar')
      .populate('project', 'name key status')
      .populate('board', 'name')
      .populate('list', 'name')
      .sort({ updatedAt: -1 })
      .limit(limit);
  }

  return tasks.map(t => ({
    id: t._id.toString(),
    _id: t._id.toString(),
    title: t.title,
    description: t.description,
    status: t.status,
    priority: t.priority,
    dueDate: t.dueDate,
    assignee: t.assignee
      ? {
          id: t.assignee._id.toString(),
          _id: t.assignee._id.toString(),
          name: t.assignee.name,
          email: t.assignee.email,
          avatar: t.assignee.avatar
        }
      : null,
    assigneeName: t.assignee?.name || 'Unassigned',
    project: t.project
      ? {
          id: t.project._id.toString(),
          _id: t.project._id.toString(),
          name: t.project.name,
          key: t.project.key
        }
      : null,
    projectName: t.project?.name || 'General Project',
    board: t.board ? { id: t.board._id.toString(), name: t.board.name } : null,
    list: t.list ? { id: t.list._id.toString(), name: t.list.name } : null,
    updatedAt: t.updatedAt,
    createdAt: t.createdAt
  }));
};

export const getManagerOverdueTasks = async (workspaceId, user) => {
  const wsId = await resolveWorkspaceId(workspaceId, user);
  const userObjectId = user?._id && mongoose.Types.ObjectId.isValid(user._id)
    ? new mongoose.Types.ObjectId(user._id)
    : null;
  const now = new Date();

  const orConditions = [];
  if (wsId) orConditions.push({ workspace: wsId });
  if (userObjectId) orConditions.push({ assignee: userObjectId });

  const filter = {
    dueDate: { $lt: now },
    status: { $ne: 'done' }
  };
  if (orConditions.length > 0) {
    filter.$or = orConditions;
  }

  const tasks = await Task.find(filter)
    .populate('assignee', 'name email avatar')
    .populate('project', 'name key')
    .populate('board', 'name')
    .populate('list', 'name')
    .sort({ dueDate: 1 });

  return tasks.map(t => ({
    id: t._id.toString(),
    title: t.title,
    description: t.description,
    status: t.status,
    priority: t.priority,
    dueDate: t.dueDate,
    daysOverdue: Math.ceil((now - new Date(t.dueDate)) / (1000 * 60 * 60 * 24)),
    assignee: t.assignee
      ? {
          id: t.assignee._id.toString(),
          name: t.assignee.name,
          email: t.assignee.email,
          avatar: t.assignee.avatar
        }
      : null,
    project: t.project ? { id: t.project._id.toString(), name: t.project.name, key: t.project.key } : null,
    board: t.board ? { id: t.board._id.toString(), name: t.board.name } : null,
    list: t.list ? { id: t.list._id.toString(), name: t.list.name } : null
  }));
};

export const getManagerRecentActivities = async (workspaceId, user, limit = 10) => {
  const wsId = await resolveWorkspaceId(workspaceId, user);
  const filter = wsId ? { workspace: wsId } : {};

  const activities = await Activity.find(filter)
    .populate('user', 'name email avatar role')
    .sort({ createdAt: -1 })
    .limit(limit);

  return activities.map(a => ({
    id: a._id.toString(),
    action: a.action,
    type: a.type,
    description: a.description,
    details: a.details,
    entityType: a.entityType,
    entityId: a.entityId,
    entityName: a.entityName,
    metadata: a.metadata,
    user: a.user
      ? {
          id: a.user._id.toString(),
          name: a.user.name,
          email: a.user.email,
          avatar: a.user.avatar,
          role: a.user.role
        }
      : null,
    createdAt: a.createdAt
  }));
};

export const getManagerTeamPerformance = async (workspaceId, user) => {
  const wsId = await resolveWorkspaceId(workspaceId, user);
  if (!wsId) return [];
  const now = new Date();

  // Get active members in workspace
  const memberships = await WorkspaceMember.find({
    workspace: wsId,
    status: 'active'
  }).populate('user', 'name email avatar role');

  const memberIds = memberships.map(m => m.user?._id).filter(Boolean);

  // Aggregate tasks per member
  const taskStats = await Task.aggregate([
    { $match: { workspace: wsId, assignee: { $in: memberIds } } },
    {
      $group: {
        _id: '$assignee',
        totalAssigned: { $sum: 1 },
        completed: {
          $sum: { $cond: [{ $eq: ['$status', 'done'] }, 1, 0] }
        },
        inProgress: {
          $sum: { $cond: [{ $eq: ['$status', 'in_progress'] }, 1, 0] }
        },
        overdue: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $ne: ['$status', 'done'] },
                  { $lt: ['$dueDate', now] }
                ]
              },
              1,
              0
            ]
          }
        }
      }
    }
  ]);

  const statsMap = {};
  taskStats.forEach(s => {
    statsMap[s._id.toString()] = s;
  });

  return memberships
    .filter(m => m.user)
    .map(m => {
      const uId = m.user._id.toString();
      const stats = statsMap[uId] || {
        totalAssigned: 0,
        completed: 0,
        inProgress: 0,
        overdue: 0
      };
      const completionRate =
        stats.totalAssigned > 0
          ? Math.round((stats.completed / stats.totalAssigned) * 100)
          : 0;

      return {
        id: uId,
        memberId: m._id.toString(),
        name: m.user.name,
        email: m.user.email,
        avatar: m.user.avatar,
        workspaceRole: m.role,
        totalAssigned: stats.totalAssigned,
        completed: stats.completed,
        inProgress: stats.inProgress,
        overdue: stats.overdue,
        completionRate
      };
    })
    .sort((a, b) => b.completed - a.completed);
};

export const getManagerUpcomingDeadlines = async (workspaceId, user, days = 7) => {
  const wsId = await resolveWorkspaceId(workspaceId, user);
  const userObjectId = user?._id && mongoose.Types.ObjectId.isValid(user._id)
    ? new mongoose.Types.ObjectId(user._id)
    : null;
  const now = new Date();
  const maxDate = new Date();
  maxDate.setDate(now.getDate() + days);

  const orConditions = [];
  if (wsId) orConditions.push({ workspace: wsId });
  if (userObjectId) orConditions.push({ assignee: userObjectId });

  const filter = {
    status: { $ne: 'done' },
    dueDate: { $gte: now, $lte: maxDate }
  };
  if (orConditions.length > 0) {
    filter.$or = orConditions;
  }

  const tasks = await Task.find(filter)
    .populate('assignee', 'name email avatar')
    .populate('project', 'name key')
    .populate('board', 'name')
    .populate('list', 'name')
    .sort({ dueDate: 1 });

  return tasks.map(t => ({
    id: t._id.toString(),
    title: t.title,
    description: t.description,
    status: t.status,
    priority: t.priority,
    dueDate: t.dueDate,
    daysRemaining: Math.ceil((new Date(t.dueDate) - now) / (1000 * 60 * 60 * 24)),
    assignee: t.assignee
      ? {
          id: t.assignee._id.toString(),
          name: t.assignee.name,
          email: t.assignee.email,
          avatar: t.assignee.avatar
        }
      : null,
    project: t.project ? { id: t.project._id.toString(), name: t.project.name, key: t.project.key } : null,
    board: t.board ? { id: t.board._id.toString(), name: t.board.name } : null,
    list: t.list ? { id: t.list._id.toString(), name: t.list.name } : null
  }));
};

export const getManagerDashboardOverview = async (workspaceId, user) => {
  const [
    stats,
    taskOverview,
    myProjects,
    recentTasks,
    overdueTasks,
    upcomingDeadlines,
    recentActivities
  ] = await Promise.all([
    getManagerDashboardStats(workspaceId, user),
    getManagerTaskOverview(workspaceId, user),
    getManagerAssignedProjects(workspaceId, user),
    getManagerRecentTasks(workspaceId, user, 10),
    getManagerOverdueTasks(workspaceId, user),
    getManagerUpcomingDeadlines(workspaceId, user, 7),
    getManagerRecentActivities(workspaceId, user, 8)
  ]);

  return {
    stats,
    taskOverview,
    myProjects: myProjects.slice(0, 5),
    recentTasks,
    overdueTasks: overdueTasks.slice(0, 5),
    upcomingDeadlines: upcomingDeadlines.slice(0, 5),
    recentActivities
  };
};
