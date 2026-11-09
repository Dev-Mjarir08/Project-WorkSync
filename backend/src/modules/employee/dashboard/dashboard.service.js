import mongoose from 'mongoose';
import { Project } from '../../../models/Project.js';
import { Board } from '../../../models/Board.js';
import { Task } from '../../../models/Task.js';
import { WorkspaceMember } from '../../../models/WorkspaceMember.js';
import { Activity } from '../../../models/Activity.js';
import { ApiError } from '../../../utils/ApiError.js';

export const getEmployeeDashboardStats = async (workspaceId, user) => {
  if (!workspaceId) throw new ApiError(400, 'Workspace ID is required');
  const wsId = new mongoose.Types.ObjectId(workspaceId);
  const userId = new mongoose.Types.ObjectId(user._id);
  const now = new Date();

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
    Project.countDocuments({ workspace: wsId }),
    Project.countDocuments({
      workspace: wsId,
      $or: [{ lead: userId }, { members: userId }, { 'members.user': userId }, { owner: userId }]
    }),
    Task.countDocuments({ workspace: wsId }),
    Task.countDocuments({ workspace: wsId, assignee: userId }),
    Task.countDocuments({ workspace: wsId, assignee: userId, status: 'done' }),
    Task.countDocuments({ workspace: wsId, assignee: userId, status: 'in_progress' }),
    Task.countDocuments({
      workspace: wsId,
      assignee: userId,
      dueDate: { $lt: now },
      status: { $ne: 'done' }
    }),
    WorkspaceMember.countDocuments({ workspace: wsId, status: 'active' })
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
    completionRate: myAssignedTasks > 0 ? Math.round((completedTasks / myAssignedTasks) * 100) : 100
  };
};

export const getEmployeeAssignedProjects = async (workspaceId, user) => {
  if (!workspaceId) throw new ApiError(400, 'Workspace ID is required');
  const wsId = new mongoose.Types.ObjectId(workspaceId);
  const userId = new mongoose.Types.ObjectId(user._id);

  // Projects where employee is assigned, a member, or has tasks
  const projectIdsWithTasks = await Task.distinct('project', {
    workspace: wsId,
    assignee: userId
  });

  const projects = await Project.find({
    workspace: wsId,
    $or: [
      { lead: userId },
      { members: userId },
      { 'members.user': userId },
      { owner: userId },
      { _id: { $in: projectIdsWithTasks.filter(Boolean) } }
    ]
  })
    .populate('lead', 'name email avatar')
    .populate('members', 'name email avatar')
    .sort({ updatedAt: -1 });

  const projectIds = projects.map((p) => p._id);
  const taskAggregations = await Task.aggregate([
    { $match: { project: { $in: projectIds } } },
    {
      $group: {
        _id: '$project',
        totalTasks: { $sum: 1 },
        completedTasks: {
          $sum: { $cond: [{ $eq: ['$status', 'done'] }, 1, 0] }
        }
      }
    }
  ]);

  const taskMap = {};
  taskAggregations.forEach((t) => {
    taskMap[t._id.toString()] = t;
  });

  return projects.map((p) => {
    const pId = p._id.toString();
    const taskData = taskMap[pId] || { totalTasks: 0, completedTasks: 0 };
    const progress =
      taskData.totalTasks > 0
        ? Math.round((taskData.completedTasks / taskData.totalTasks) * 100)
        : 0;

    return {
      id: pId,
      name: p.name || p.title,
      title: p.title || p.name,
      key: p.key || '',
      description: p.description || '',
      status: p.status,
      priority: p.priority || 'medium',
      lead: p.lead,
      members: p.members || [],
      membersCount: p.members?.length || 0,
      totalTasks: taskData.totalTasks,
      completedTasks: taskData.completedTasks,
      progress,
      startDate: p.startDate,
      dueDate: p.dueDate || p.endDate,
      createdAt: p.createdAt
    };
  });
};

export const getEmployeeTaskOverview = async (workspaceId, user) => {
  if (!workspaceId) throw new ApiError(400, 'Workspace ID is required');
  const wsId = new mongoose.Types.ObjectId(workspaceId);
  const userId = new mongoose.Types.ObjectId(user._id);

  const [myTasksAgg, allTasksAgg] = await Promise.all([
    Task.aggregate([
      { $match: { workspace: wsId, assignee: userId } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]),
    Task.aggregate([
      { $match: { workspace: wsId } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ])
  ]);

  const myCounts = { todo: 0, in_progress: 0, review: 0, done: 0 };
  let myTotal = 0;
  myTasksAgg.forEach((item) => {
    if (myCounts[item._id] !== undefined) myCounts[item._id] = item.count;
    myTotal += item.count;
  });

  const workspaceCounts = { todo: 0, in_progress: 0, review: 0, done: 0 };
  let workspaceTotal = 0;
  allTasksAgg.forEach((item) => {
    if (workspaceCounts[item._id] !== undefined) workspaceCounts[item._id] = item.count;
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
  if (!workspaceId) throw new ApiError(400, 'Workspace ID is required');
  const wsId = new mongoose.Types.ObjectId(workspaceId);
  const userId = new mongoose.Types.ObjectId(user._id);

  return Task.find({
    workspace: wsId,
    $or: [{ assignee: userId }, { reporter: userId }, { createdBy: userId }]
  })
    .populate('project', 'title name key status')
    .populate('board', 'title name')
    .populate('assignee', 'name email avatar')
    .sort({ updatedAt: -1 })
    .limit(limit);
};

export const getEmployeeOverdueTasks = async (workspaceId, user) => {
  if (!workspaceId) throw new ApiError(400, 'Workspace ID is required');
  const wsId = new mongoose.Types.ObjectId(workspaceId);
  const userId = new mongoose.Types.ObjectId(user._id);
  const now = new Date();

  return Task.find({
    workspace: wsId,
    assignee: userId,
    dueDate: { $lt: now },
    status: { $ne: 'done' }
  })
    .populate('project', 'title name key')
    .populate('board', 'title name')
    .populate('assignee', 'name email avatar')
    .sort({ dueDate: 1 });
};

export const getEmployeeRecentActivities = async (workspaceId, user, limit = 15) => {
  if (!workspaceId) throw new ApiError(400, 'Workspace ID is required');
  const wsId = new mongoose.Types.ObjectId(workspaceId);

  return Activity.find({ workspace: wsId })
    .populate('user', 'name email avatar role')
    .sort({ createdAt: -1 })
    .limit(limit);
};

export const getEmployeeTeamPerformance = async (workspaceId) => {
  if (!workspaceId) throw new ApiError(400, 'Workspace ID is required');
  const wsId = new mongoose.Types.ObjectId(workspaceId);

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
        completedTasks: { $sum: { $cond: [{ $eq: ['$status', 'done'] }, 1, 0] } },
        inProgressTasks: { $sum: { $cond: [{ $eq: ['$status', 'in_progress'] }, 1, 0] } },
        overdueTasks: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $ne: ['$status', 'done'] },
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
  if (!workspaceId) throw new ApiError(400, 'Workspace ID is required');
  const wsId = new mongoose.Types.ObjectId(workspaceId);
  const userId = new mongoose.Types.ObjectId(user._id);
  const now = new Date();

  return Task.find({
    workspace: wsId,
    assignee: userId,
    dueDate: { $gte: now },
    status: { $ne: 'done' }
  })
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
