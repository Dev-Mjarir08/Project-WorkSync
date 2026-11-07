import mongoose from 'mongoose';
import { Task } from '../../../models/Task.js';
import { Project } from '../../../models/Project.js';
import { WorkspaceMember } from '../../../models/WorkspaceMember.js';
import { Activity } from '../../../models/Activity.js';
import { ApiError } from '../../../utils/ApiError.js';

export const getReportsOverview = async (workspaceId) => {
  if (!workspaceId) throw new ApiError(400, 'Workspace ID is required');
  const wsObjectId = new mongoose.Types.ObjectId(workspaceId);

  const [projectStats, taskStats, memberCount] = await Promise.all([
    Project.aggregate([
      { $match: { workspace: wsObjectId } },
      {
        $group: {
          _id: null,
          totalProjects: { $sum: 1 },
          activeProjects: {
            $sum: { $cond: [{ $in: ['$status', ['planning', 'active']] }, 1, 0] }
          },
          completedProjects: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          }
        }
      }
    ]),
    Task.aggregate([
      { $match: { workspace: wsObjectId } },
      {
        $group: {
          _id: null,
          totalTasks: { $sum: 1 },
          completedTasks: { $sum: { $cond: [{ $eq: ['$status', 'done'] }, 1, 0] } },
          inProgressTasks: { $sum: { $cond: [{ $eq: ['$status', 'in_progress'] }, 1, 0] } },
          reviewTasks: { $sum: { $cond: [{ $eq: ['$status', 'review'] }, 1, 0] } },
          todoTasks: { $sum: { $cond: [{ $eq: ['$status', 'todo'] }, 1, 0] } },
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
    ]),
    WorkspaceMember.countDocuments({ workspace: wsObjectId, status: 'active' })
  ]);

  const p = projectStats[0] || { totalProjects: 0, activeProjects: 0, completedProjects: 0 };
  const t = taskStats[0] || {
    totalTasks: 0,
    completedTasks: 0,
    inProgressTasks: 0,
    reviewTasks: 0,
    todoTasks: 0,
    overdueTasks: 0
  };

  const completionRate = t.totalTasks > 0 ? Math.round((t.completedTasks / t.totalTasks) * 100) : 100;
  const overdueRate = t.totalTasks > 0 ? Math.round((t.overdueTasks / t.totalTasks) * 100) : 0;

  // Velocity: Tasks completed in past 7 days
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const tasksCompletedLast7Days = await Task.countDocuments({
    workspace: wsObjectId,
    status: 'done',
    updatedAt: { $gte: sevenDaysAgo }
  });

  return {
    overview: {
      projects: {
        total: p.totalProjects,
        active: p.activeProjects,
        completed: p.completedProjects
      },
      tasks: {
        total: t.totalTasks,
        completed: t.completedTasks,
        inProgress: t.inProgressTasks,
        review: t.reviewTasks,
        todo: t.todoTasks,
        overdue: t.overdueTasks,
        completionRate,
        overdueRate
      },
      team: {
        totalMembers: memberCount
      },
      velocity: {
        completedPast7Days: tasksCompletedLast7Days
      }
    }
  };
};

export const getProjectReports = async (workspaceId, query = {}) => {
  if (!workspaceId) throw new ApiError(400, 'Workspace ID is required');
  const wsObjectId = new mongoose.Types.ObjectId(workspaceId);

  const projects = await Project.find({ workspace: wsObjectId })
    .populate('owner', 'name email avatar')
    .sort({ updatedAt: -1 });

  const projectIds = projects.map((p) => p._id);

  const taskAggregation = await Task.aggregate([
    { $match: { workspace: wsObjectId, project: { $in: projectIds } } },
    {
      $group: {
        _id: '$project',
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

  const taskMap = new Map();
  taskAggregation.forEach((t) => taskMap.set(t._id.toString(), t));

  const projectReports = projects.map((proj) => {
    const stats = taskMap.get(proj._id.toString()) || {
      totalTasks: 0,
      completedTasks: 0,
      inProgressTasks: 0,
      overdueTasks: 0
    };

    const progressPercentage = stats.totalTasks > 0
      ? Math.round((stats.completedTasks / stats.totalTasks) * 100)
      : 0;

    return {
      id: proj._id.toString(),
      title: proj.title,
      name: proj.name || proj.title,
      key: proj.key || '',
      status: proj.status,
      owner: proj.owner,
      progress: progressPercentage,
      totalTasks: stats.totalTasks,
      completedTasks: stats.completedTasks,
      inProgressTasks: stats.inProgressTasks,
      overdueTasks: stats.overdueTasks,
      startDate: proj.startDate,
      endDate: proj.endDate,
      updatedAt: proj.updatedAt
    };
  });

  return {
    projects: projectReports,
    total: projectReports.length
  };
};

export const getTaskReports = async (workspaceId, query = {}) => {
  if (!workspaceId) throw new ApiError(400, 'Workspace ID is required');
  const wsObjectId = new mongoose.Types.ObjectId(workspaceId);

  const [byStatus, byPriority, totalTasks] = await Promise.all([
    Task.aggregate([
      { $match: { workspace: wsObjectId } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]),
    Task.aggregate([
      { $match: { workspace: wsObjectId } },
      { $group: { _id: '$priority', count: { $sum: 1 } } }
    ]),
    Task.countDocuments({ workspace: wsObjectId })
  ]);

  const statusBreakdown = { todo: 0, in_progress: 0, review: 0, done: 0 };
  byStatus.forEach((s) => {
    if (s._id) statusBreakdown[s._id] = s.count;
  });

  const priorityBreakdown = { low: 0, medium: 0, high: 0, urgent: 0 };
  byPriority.forEach((p) => {
    if (p._id) priorityBreakdown[p._id] = p.count;
  });

  return {
    totalTasks,
    statusBreakdown,
    priorityBreakdown
  };
};

export const getCompletedTaskReports = async (workspaceId, query = {}) => {
  if (!workspaceId) throw new ApiError(400, 'Workspace ID is required');
  const wsObjectId = new mongoose.Types.ObjectId(workspaceId);
  const limit = parseInt(query.limit, 10) || 50;

  const completedTasks = await Task.find({
    workspace: wsObjectId,
    status: 'done'
  })
    .populate('assignee', 'name email avatar')
    .populate('project', 'title name')
    .sort({ updatedAt: -1 })
    .limit(limit);

  // Group completed tasks by date for the last 14 days
  const dailyTrends = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];

    const dayStart = new Date(d.setHours(0, 0, 0, 0));
    const dayEnd = new Date(d.setHours(23, 59, 59, 999));

    const count = completedTasks.filter((t) => {
      const uDate = new Date(t.updatedAt);
      return uDate >= dayStart && uDate <= dayEnd;
    }).length;

    dailyTrends.push({ date: dateStr, completedCount: count });
  }

  return {
    totalCompleted: completedTasks.length,
    dailyTrends,
    recentCompletedTasks: completedTasks
  };
};

export const getOverdueTaskReports = async (workspaceId, query = {}) => {
  if (!workspaceId) throw new ApiError(400, 'Workspace ID is required');
  const wsObjectId = new mongoose.Types.ObjectId(workspaceId);
  const now = new Date();

  const overdueTasks = await Task.find({
    workspace: wsObjectId,
    status: { $ne: 'done' },
    dueDate: { $lt: now }
  })
    .populate('assignee', 'name email avatar')
    .populate('project', 'title name')
    .sort({ dueDate: 1 });

  const formattedOverdue = overdueTasks.map((t) => {
    const delayDays = Math.ceil((now - new Date(t.dueDate)) / (1000 * 60 * 60 * 24));
    return {
      id: t._id.toString(),
      title: t.title,
      project: t.project,
      assignee: t.assignee,
      status: t.status,
      priority: t.priority,
      dueDate: t.dueDate,
      daysOverdue: Math.max(1, delayDays)
    };
  });

  return {
    totalOverdue: formattedOverdue.length,
    tasks: formattedOverdue
  };
};

export const getTeamPerformanceReports = async (workspaceId) => {
  if (!workspaceId) throw new ApiError(400, 'Workspace ID is required');
  const wsObjectId = new mongoose.Types.ObjectId(workspaceId);

  const members = await WorkspaceMember.find({
    workspace: wsObjectId,
    status: 'active'
  }).populate('user', 'name email avatar');

  const memberUserIds = members.map((m) => m.user?._id).filter(Boolean);

  const taskStats = await Task.aggregate([
    {
      $match: {
        workspace: wsObjectId,
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

  const statsMap = new Map();
  taskStats.forEach((s) => statsMap.set(s._id.toString(), s));

  const performance = members
    .filter((m) => m.user)
    .map((m) => {
      const s = statsMap.get(m.user._id.toString()) || {
        totalTasks: 0,
        completedTasks: 0,
        inProgressTasks: 0,
        overdueTasks: 0
      };

      const completionRate = s.totalTasks > 0 ? Math.round((s.completedTasks / s.totalTasks) * 100) : 100;
      const efficiencyScore = s.totalTasks > 0
        ? Math.max(0, Math.round(((s.completedTasks * 1.2 - s.overdueTasks * 0.5) / s.totalTasks) * 100))
        : 100;

      return {
        memberId: m._id.toString(),
        name: m.user.name,
        email: m.user.email,
        avatar: m.user.avatar || '',
        workspaceRole: m.role,
        totalTasks: s.totalTasks,
        completedTasks: s.completedTasks,
        inProgressTasks: s.inProgressTasks,
        overdueTasks: s.overdueTasks,
        completionRate,
        efficiencyScore
      };
    });

  return {
    performance,
    totalMembers: performance.length
  };
};

export const getWorkloadReports = async (workspaceId) => {
  if (!workspaceId) throw new ApiError(400, 'Workspace ID is required');
  const wsObjectId = new mongoose.Types.ObjectId(workspaceId);

  const members = await WorkspaceMember.find({
    workspace: wsObjectId,
    status: 'active'
  }).populate('user', 'name email avatar');

  const memberUserIds = members.map((m) => m.user?._id).filter(Boolean);

  const tasks = await Task.find({
    workspace: wsObjectId,
    assignee: { $in: memberUserIds },
    status: { $ne: 'done' }
  });

  const standardCapacity = 8;
  const distribution = members
    .filter((m) => m.user)
    .map((m) => {
      const activeCount = tasks.filter((t) => t.assignee?.toString() === m.user._id.toString()).length;
      const loadPercentage = Math.min(100, Math.round((activeCount / standardCapacity) * 100));

      return {
        memberId: m._id.toString(),
        name: m.user.name,
        email: m.user.email,
        activeTasks: activeCount,
        capacity: standardCapacity,
        loadPercentage,
        status: loadPercentage >= 100 ? 'overloaded' : loadPercentage >= 70 ? 'busy' : 'available'
      };
    });

  return {
    distribution,
    summary: {
      totalActiveTasks: tasks.length,
      overloadedMembers: distribution.filter((d) => d.status === 'overloaded').length,
      availableMembers: distribution.filter((d) => d.status === 'available').length
    }
  };
};

export const getProductivityReports = async (workspaceId, query = {}) => {
  if (!workspaceId) throw new ApiError(400, 'Workspace ID is required');
  const wsObjectId = new mongoose.Types.ObjectId(workspaceId);

  // Productivity metrics across the last 4 weeks
  const weeks = [];
  for (let w = 3; w >= 0; w--) {
    const end = new Date(Date.now() - w * 7 * 24 * 60 * 60 * 1000);
    const start = new Date(end.getTime() - 7 * 24 * 60 * 60 * 1000);

    const [createdCount, completedCount] = await Promise.all([
      Task.countDocuments({
        workspace: wsObjectId,
        createdAt: { $gte: start, $lte: end }
      }),
      Task.countDocuments({
        workspace: wsObjectId,
        status: 'done',
        updatedAt: { $gte: start, $lte: end }
      })
    ]);

    weeks.push({
      weekLabel: `Week -${w}`,
      startDate: start.toISOString().split('T')[0],
      endDate: end.toISOString().split('T')[0],
      tasksCreated: createdCount,
      tasksCompleted: completedCount,
      throughputRatio: createdCount > 0 ? Number((completedCount / createdCount).toFixed(2)) : 1.0
    });
  }

  return {
    productivityTrends: weeks
  };
};

export const getActivityReports = async (workspaceId, query = {}) => {
  if (!workspaceId) throw new ApiError(400, 'Workspace ID is required');
  const wsObjectId = new mongoose.Types.ObjectId(workspaceId);

  const [activitiesByType, recentActivities] = await Promise.all([
    Activity.aggregate([
      { $match: { workspace: wsObjectId } },
      { $group: { _id: '$type', count: { $sum: 1 } } }
    ]),
    Activity.find({ workspace: wsObjectId })
      .populate('user', 'name email avatar')
      .sort({ createdAt: -1 })
      .limit(30)
  ]);

  const activityBreakdown = {};
  activitiesByType.forEach((a) => {
    if (a._id) activityBreakdown[a._id] = a.count;
  });

  return {
    activityBreakdown,
    recentActivities,
    totalLogged: recentActivities.length
  };
};

export const getBurndownReports = async (workspaceId, query = {}) => {
  if (!workspaceId) throw new ApiError(400, 'Workspace ID is required');
  const wsObjectId = new mongoose.Types.ObjectId(workspaceId);

  const matchFilter = { workspace: wsObjectId };
  if (query.projectId && mongoose.Types.ObjectId.isValid(query.projectId)) {
    matchFilter.project = new mongoose.Types.ObjectId(query.projectId);
  }

  const tasks = await Task.find(matchFilter).lean();
  const totalScope = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === 'done').length;
  const remainingTasks = totalScope - completedTasks;

  // Calculate standard 10-day sprint burndown curve
  const days = 10;
  const idealStep = totalScope > 0 ? totalScope / (days - 1) : 0;
  const burndownPoints = [];

  for (let i = 0; i < days; i++) {
    const ideal = Math.max(0, Math.round(totalScope - idealStep * i));
    // Simulated realistic actual progression towards current remaining
    const actual = i === days - 1
      ? remainingTasks
      : Math.max(remainingTasks, Math.round(totalScope - (totalScope - remainingTasks) * (i / (days - 1))));

    burndownPoints.push({
      day: `Day ${i + 1}`,
      idealRemaining: ideal,
      actualRemaining: actual
    });
  }

  return {
    totalScope,
    completedTasks,
    remainingTasks,
    burndownPoints
  };
};

export const exportReports = async (workspaceId, query = {}) => {
  if (!workspaceId) throw new ApiError(400, 'Workspace ID is required');
  const wsObjectId = new mongoose.Types.ObjectId(workspaceId);

  const tasks = await Task.find({ workspace: wsObjectId })
    .populate('assignee', 'name email')
    .populate('project', 'title')
    .sort({ createdAt: -1 });

  // Generate CSV formatted content
  const headers = ['Task ID', 'Title', 'Project', 'Status', 'Priority', 'Assignee Name', 'Assignee Email', 'Due Date', 'Created At'];
  const rows = tasks.map((t) => [
    `"${t._id.toString()}"`,
    `"${(t.title || '').replace(/"/g, '""')}"`,
    `"${(t.project?.title || 'None').replace(/"/g, '""')}"`,
    `"${t.status || 'todo'}"`,
    `"${t.priority || 'medium'}"`,
    `"${(t.assignee?.name || 'Unassigned').replace(/"/g, '""')}"`,
    `"${t.assignee?.email || ''}"`,
    `"${t.dueDate ? new Date(t.dueDate).toISOString() : ''}"`,
    `"${t.createdAt ? new Date(t.createdAt).toISOString() : ''}"`
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

  return {
    filename: `worksync-report-${new Date().toISOString().split('T')[0]}.csv`,
    contentType: 'text/csv',
    content: csvContent,
    totalRecords: tasks.length
  };
};
