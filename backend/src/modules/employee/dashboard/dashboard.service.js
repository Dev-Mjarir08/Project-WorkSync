import mongoose from 'mongoose';
import { Project } from '../../../models/Project.js';
import { Board } from '../../../models/Board.js';
import { Task } from '../../../models/Task.js';
import { WorkspaceMember } from '../../../models/WorkspaceMember.js';
import { Workspace } from '../../../models/Workspace.js';
import { Activity } from '../../../models/Activity.js';
import { ApiError } from '../../../utils/ApiError.js';

const resolveWsId = async (workspaceId, user) => {
  if (workspaceId && mongoose.Types.ObjectId.isValid(workspaceId)) {
    const exists = await Workspace.findOne({ _id: workspaceId, isActive: true }).select('_id');
    if (exists) return exists._id;
  }
  if (user?._id) {
    const member = await WorkspaceMember.findOne({ user: user._id, status: 'active' }).select('workspace');
    if (member?.workspace) return member.workspace;
    const taskWs = await Task.findOne({ assignee: user._id }).select('workspace');
    if (taskWs?.workspace) return taskWs.workspace;
    const owned = await Workspace.findOne({ $or: [{ owner: user._id }, { createdBy: user._id }], isActive: true }).select('_id');
    if (owned?._id) return owned._id;
  }
  const defaultWs = await Workspace.findOne({ isActive: true }).select('_id');
  return defaultWs?._id || null;
};

export const getEmployeeDashboardStats = async (workspaceId, user) => {
  const wsId = await resolveWsId(workspaceId, user);
  const userId = user?._id && mongoose.Types.ObjectId.isValid(user._id)
    ? new mongoose.Types.ObjectId(user._id)
    : null;
  const now = new Date();

  const myTaskQuery = userId ? { assignee: userId } : { workspace: wsId };
  const allWorkspaceTaskQuery = wsId ? { workspace: wsId } : myTaskQuery;

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
      ? Project.countDocuments({
          workspace: wsId,
          $or: [{ lead: userId }, { members: userId }, { 'members.user': userId }, { owner: userId }]
        })
      : Project.countDocuments(),
    Task.countDocuments(allWorkspaceTaskQuery),
    Task.countDocuments(myTaskQuery),
    Task.countDocuments({ ...myTaskQuery, status: { $in: ['done', 'completed', 'Done', 'Completed'] } }),
    Task.countDocuments({ ...myTaskQuery, status: { $in: ['in_progress', 'InProgress', 'In Progress', 'review', 'in_review'] } }),
    Task.countDocuments({
      ...myTaskQuery,
      dueDate: { $lt: now },
      status: { $nin: ['done', 'completed', 'Done', 'Completed'] }
    }),
    wsId ? WorkspaceMember.countDocuments({ workspace: wsId, status: 'active' }) : WorkspaceMember.countDocuments({ status: 'active' })
  ]);

  return {
    totalProjects,
    assignedProjects,
    totalTasks: totalTasks || myAssignedTasks,
    myAssignedTasks,
    completedTasks,
    inProgressTasks,
    overdueTasks,
    totalTeamMembers: teamMembersCount,
    completionRate: myAssignedTasks > 0 ? Math.round((completedTasks / myAssignedTasks) * 100) : 100
  };
};

export const getEmployeeAssignedProjects = async (workspaceId, user) => {
  const wsId = await resolveWsId(workspaceId, user);
  const userId = user?._id && mongoose.Types.ObjectId.isValid(user._id)
    ? new mongoose.Types.ObjectId(user._id)
    : null;

  if (!userId) return [];

  // Projects where employee is assigned, a member, or has tasks
  const projectIdsWithTasks = await Task.distinct('project', { assignee: userId });

  const query = {
    $or: [
      { lead: userId },
      { members: userId },
      { 'members.user': userId },
      { owner: userId },
      { _id: { $in: projectIdsWithTasks.filter(Boolean) } }
    ]
  };
  if (wsId) query.workspace = wsId;

  let projects = await Project.find(query)
    .populate('lead', 'name email avatar')
    .populate('members', 'name email avatar')
    .sort({ updatedAt: -1 });

  if (projects.length === 0 && wsId) {
    projects = await Project.find({ workspace: wsId })
      .populate('lead', 'name email avatar')
      .populate('members', 'name email avatar')
      .sort({ updatedAt: -1 });
  }

  const projectIds = projects.map((p) => p._id);
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
  taskAggregations.forEach((t) => {
    taskMap[t._id.toString()] = t;
  });

  return projects.map((p) => {
    const taskInfo = taskMap[p._id.toString()] || { totalTasks: 0, completedTasks: 0 };
    const progress =
      taskInfo.totalTasks > 0
        ? Math.round((taskInfo.completedTasks / taskInfo.totalTasks) * 100)
        : p.progress || 0;

    return {
      id: p._id.toString(),
      _id: p._id.toString(),
      name: p.name,
      description: p.description,
      key: p.key,
      status: p.status,
      category: p.category,
      startDate: p.startDate,
      endDate: p.endDate,
      lead: p.lead,
      members: p.members,
      progress,
      totalTasks: taskInfo.totalTasks,
      completedTasks: taskInfo.completedTasks
    };
  });
};

export const getEmployeeTaskOverview = async (workspaceId, user) => {
  const wsId = await resolveWsId(workspaceId, user);
  const userId = user?._id && mongoose.Types.ObjectId.isValid(user._id)
    ? new mongoose.Types.ObjectId(user._id)
    : null;

  const myFilter = userId ? { assignee: userId } : (wsId ? { workspace: wsId } : {});
  const wsFilter = wsId ? { workspace: wsId } : myFilter;

  const [myTasksAgg, allTasksAgg] = await Promise.all([
    Task.aggregate([
      ...(Object.keys(myFilter).length ? [{ $match: myFilter }] : []),
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]),
    Task.aggregate([
      ...(Object.keys(wsFilter).length ? [{ $match: wsFilter }] : []),
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ])
  ]);

  const myCounts = { todo: 0, in_progress: 0, review: 0, done: 0 };
  let myTotal = 0;
  myTasksAgg.forEach((item) => {
    const s = String(item._id || '').toLowerCase().replace(/[\s-]+/g, '_');
    if (s === 'done' || s === 'completed') myCounts.done += item.count;
    else if (s === 'in_progress' || s === 'inprogress') myCounts.in_progress += item.count;
    else if (s === 'review' || s === 'in_review') myCounts.review += item.count;
    else myCounts.todo += item.count;
    myTotal += item.count;
  });

  const workspaceCounts = { todo: 0, in_progress: 0, review: 0, done: 0 };
  let workspaceTotal = 0;
  allTasksAgg.forEach((item) => {
    const s = String(item._id || '').toLowerCase().replace(/[\s-]+/g, '_');
    if (s === 'done' || s === 'completed') workspaceCounts.done += item.count;
    else if (s === 'in_progress' || s === 'inprogress') workspaceCounts.in_progress += item.count;
    else if (s === 'review' || s === 'in_review') workspaceCounts.review += item.count;
    else workspaceCounts.todo += item.count;
    workspaceTotal += item.count;
  });

  return {
    myTasks: {
      ...myCounts,
      total: myTotal,
      completionRate: myTotal > 0 ? Math.round((myCounts.done / myTotal) * 100) : 100
    },
    workspaceTasks: {
      ...workspaceCounts,
      total: workspaceTotal,
      completionRate: workspaceTotal > 0 ? Math.round((workspaceCounts.done / workspaceTotal) * 100) : 100
    }
  };
};

export const getEmployeeRecentTasks = async (workspaceId, user, limit = 10) => {
  const wsId = await resolveWsId(workspaceId, user);
  const userId = user?._id && mongoose.Types.ObjectId.isValid(user._id)
    ? new mongoose.Types.ObjectId(user._id)
    : null;

  const query = userId
    ? { $or: [{ assignee: userId }, { reporter: userId }, { createdBy: userId }] }
    : (wsId ? { workspace: wsId } : {});

  let tasks = await Task.find(query)
    .populate('project', 'title name key status')
    .populate('board', 'title name')
    .populate('assignee', 'name email avatar')
    .sort({ updatedAt: -1 })
    .limit(limit);

  if (tasks.length === 0 && wsId) {
    tasks = await Task.find({ workspace: wsId })
      .populate('project', 'title name key status')
      .populate('board', 'title name')
      .populate('assignee', 'name email avatar')
      .sort({ updatedAt: -1 })
      .limit(limit);
  }

  return tasks.map(t => ({
    id: t._id.toString(),
    _id: t._id.toString(),
    title: t.title,
    description: t.description || '',
    status: t.status,
    priority: t.priority,
    dueDate: t.dueDate,
    assignee: t.assignee ? {
      id: t.assignee._id?.toString(),
      name: t.assignee.name,
      email: t.assignee.email,
      avatar: t.assignee.avatar
    } : null,
    project: t.project ? (t.project.name || t.project.title || 'General') : 'General Work',
    board: t.board ? (t.board.name || t.board.title) : null,
    createdAt: t.createdAt,
    updatedAt: t.updatedAt
  }));
};

export const getEmployeeOverdueTasks = async (workspaceId, user) => {
  const wsId = await resolveWsId(workspaceId, user);
  const userId = user?._id && mongoose.Types.ObjectId.isValid(user._id)
    ? new mongoose.Types.ObjectId(user._id)
    : null;
  const now = new Date();

  const query = userId
    ? { assignee: userId, dueDate: { $lt: now }, status: { $nin: ['done', 'completed', 'Done', 'Completed'] } }
    : { workspace: wsId, dueDate: { $lt: now }, status: { $nin: ['done', 'completed', 'Done', 'Completed'] } };

  return Task.find(query)
    .populate('project', 'title name key')
    .populate('board', 'title name')
    .populate('assignee', 'name email avatar')
    .sort({ dueDate: 1 });
};

export const getEmployeeRecentActivities = async (workspaceId, user, limit = 15) => {
  const wsId = await resolveWsId(workspaceId, user);
  const query = wsId ? { workspace: wsId } : {};

  return Activity.find(query)
    .populate('user', 'name email avatar role')
    .sort({ createdAt: -1 })
    .limit(limit);
};

export const getEmployeeTeamPerformance = async (workspaceId) => {
  const wsId = await resolveWsId(workspaceId);
  if (!wsId) return { members: [], summary: { teamSize: 0, totalAssigned: 0, totalCompleted: 0, overallCompletionRate: 100 } };

  const members = await WorkspaceMember.find({
    workspace: wsId,
    status: 'active'
  }).populate('user', 'name email avatar');

  const memberUserIds = members.map((m) => m.user?._id).filter(Boolean);

  const performanceAgg = await Task.aggregate([
    {
      $match: {
        workspace: wsId,
        assignee: { $in: memberUserIds }
      }
    },
    {
      $group: {
        _id: '$assignee',
        totalTasks: { $sum: 1 },
        completedTasks: { $sum: { $cond: [{ $in: ['$status', ['done', 'completed', 'Done', 'Completed']] }, 1, 0] } },
        inProgressTasks: { $sum: { $cond: [{ $in: ['$status', ['in_progress', 'InProgress', 'In Progress']] }, 1, 0] } },
        overdueTasks: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $nin: ['$status', ['done', 'completed', 'Done', 'Completed']] },
                  { $lt: ['$dueDate', new Date()] }
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

  const perfMap = new Map();
  performanceAgg.forEach((p) => perfMap.set(p._id.toString(), p));

  const list = members
    .filter((m) => m.user)
    .map((m) => {
      const p = perfMap.get(m.user._id.toString()) || {
        totalTasks: 0,
        completedTasks: 0,
        inProgressTasks: 0,
        overdueTasks: 0
      };

      const completionRate = p.totalTasks > 0 ? Math.round((p.completedTasks / p.totalTasks) * 100) : 100;

      return {
        memberId: m._id.toString(),
        userId: m.user._id.toString(),
        name: m.user.name,
        email: m.user.email,
        avatar: m.user.avatar || '',
        role: m.role,
        totalTasks: p.totalTasks,
        completedTasks: p.completedTasks,
        inProgressTasks: p.inProgressTasks,
        overdueTasks: p.overdueTasks,
        completionRate
      };
    });

  const totalAssigned = list.reduce((sum, p) => sum + p.totalTasks, 0);
  const totalCompleted = list.reduce((sum, p) => sum + p.completedTasks, 0);
  const overallRate = totalAssigned > 0 ? Math.round((totalCompleted / totalAssigned) * 100) : 100;

  return {
    members: list,
    summary: {
      teamSize: list.length,
      totalAssigned,
      totalCompleted,
      overallCompletionRate: overallRate
    }
  };
};

export const getEmployeeUpcomingDeadlines = async (workspaceId, user, limit = 10) => {
  const wsId = await resolveWsId(workspaceId, user);
  const userId = user?._id && mongoose.Types.ObjectId.isValid(user._id)
    ? new mongoose.Types.ObjectId(user._id)
    : null;
  const now = new Date();

  const query = userId
    ? { assignee: userId, dueDate: { $gte: now }, status: { $nin: ['done', 'completed', 'Done', 'Completed'] } }
    : (wsId ? { workspace: wsId, dueDate: { $gte: now }, status: { $nin: ['done', 'completed', 'Done', 'Completed'] } } : {});

  return Task.find(query)
    .populate('project', 'title name key')
    .populate('board', 'title name')
    .sort({ dueDate: 1 })
    .limit(limit);
};

export const getEmployeeDashboardOverview = async (workspaceId, user) => {
  const [stats, myProjects, taskOverview, recentTasks, overdueTasks, recentActivities, upcomingDeadlines] =
    await Promise.all([
      getEmployeeDashboardStats(workspaceId, user),
      getEmployeeAssignedProjects(workspaceId, user),
      getEmployeeTaskOverview(workspaceId, user),
      getEmployeeRecentTasks(workspaceId, user, 6),
      getEmployeeOverdueTasks(workspaceId, user),
      getEmployeeRecentActivities(workspaceId, user, 8),
      getEmployeeUpcomingDeadlines(workspaceId, user, 5)
    ]);

  return {
    stats,
    projects: myProjects,
    taskOverview,
    recentTasks,
    overdueTasks,
    recentActivities,
    upcomingDeadlines
  };
};
