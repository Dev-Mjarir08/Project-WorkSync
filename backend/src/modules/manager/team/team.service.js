import mongoose from 'mongoose';
import { WorkspaceMember } from '../../../models/WorkspaceMember.js';
import { User } from '../../../models/User.js';
import { Task } from '../../../models/Task.js';
import { Project } from '../../../models/Project.js';
import { Activity } from '../../../models/Activity.js';
import { ApiError } from '../../../utils/ApiError.js';

const resolveMemberUserId = async (workspaceId, memberId) => {
  if (!mongoose.Types.ObjectId.isValid(memberId)) {
    throw new ApiError(400, 'Invalid member identifier');
  }

  // memberId could be the WorkspaceMember._id or the User._id
  let membership = await WorkspaceMember.findOne({
    _id: memberId,
    workspace: workspaceId
  });

  if (!membership) {
    membership = await WorkspaceMember.findOne({
      user: memberId,
      workspace: workspaceId
    });
  }

  if (!membership) {
    throw new ApiError(404, 'Team member not found in this workspace');
  }

  return { membership, userId: membership.user };
};

export const getTeamMembers = async (workspaceId, query = {}) => {
  if (!workspaceId) throw new ApiError(400, 'Workspace ID is required');

  const filter = {
    workspace: new mongoose.Types.ObjectId(workspaceId),
    status: query.status || 'active'
  };

  if (query.role) {
    filter.role = query.role.toLowerCase();
  }

  const members = await WorkspaceMember.find(filter)
    .populate('user', 'name email avatar role isActive lastLogin')
    .sort({ joinedAt: -1 });

  const memberUserIds = members.map((m) => m.user?._id).filter(Boolean);

  // Aggregate task counts for all members in one query
  const taskAggregations = await Task.aggregate([
    {
      $match: {
        workspace: new mongoose.Types.ObjectId(workspaceId),
        assignee: { $in: memberUserIds }
      }
    },
    {
      $group: {
        _id: '$assignee',
        totalTasks: { $sum: 1 },
        completedTasks: {
          $sum: { $cond: [{ $eq: ['$status', 'done'] }, 1, 0] }
        },
        inProgressTasks: {
          $sum: { $cond: [{ $eq: ['$status', 'in_progress'] }, 1, 0] }
        },
        todoTasks: {
          $sum: { $cond: [{ $eq: ['$status', 'todo'] }, 1, 0] }
        },
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

  const taskStatsMap = new Map();
  taskAggregations.forEach((stat) => {
    taskStatsMap.set(stat._id.toString(), stat);
  });

  const formattedMembers = members
    .filter((m) => m.user)
    .map((m) => {
      const stats = taskStatsMap.get(m.user._id.toString()) || {
        totalTasks: 0,
        completedTasks: 0,
        inProgressTasks: 0,
        todoTasks: 0,
        overdueTasks: 0
      };

      const activeTasks = (stats.totalTasks || 0) - (stats.completedTasks || 0);

      return {
        id: m._id.toString(),
        memberId: m._id.toString(),
        userId: m.user._id.toString(),
        name: m.user.name,
        email: m.user.email,
        avatar: m.user.avatar || '',
        workspaceRole: m.role,
        status: m.status,
        joinedAt: m.joinedAt,
        isActive: m.user.isActive,
        lastLogin: m.user.lastLogin,
        tasksCount: stats.totalTasks || 0,
        activeTasksCount: activeTasks,
        completedTasksCount: stats.completedTasks || 0,
        overdueTasksCount: stats.overdueTasks || 0,
        workloadLevel: activeTasks > 8 ? 'high' : activeTasks > 4 ? 'medium' : 'low'
      };
    });

  return {
    members: formattedMembers,
    total: formattedMembers.length
  };
};

export const getMemberDetails = async (workspaceId, memberId) => {
  const { membership, userId } = await resolveMemberUserId(workspaceId, memberId);

  const user = await User.findById(userId).select('name email avatar role isActive lastLogin createdAt bio');
  if (!user) {
    throw new ApiError(404, 'User profile not found');
  }

  const [tasks, distinctProjects, recentActivities] = await Promise.all([
    Task.find({ workspace: workspaceId, assignee: userId }).lean(),
    Task.distinct('project', { workspace: workspaceId, assignee: userId }),
    Activity.find({ workspace: workspaceId, user: userId })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean()
  ]);

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === 'done').length;
  const inProgressTasks = tasks.filter((t) => t.status === 'in_progress').length;
  const now = new Date();
  const overdueTasks = tasks.filter((t) => t.status !== 'done' && t.dueDate && new Date(t.dueDate) < now).length;

  return {
    id: membership._id.toString(),
    memberId: membership._id.toString(),
    userId: user._id.toString(),
    name: user.name,
    email: user.email,
    avatar: user.avatar || '',
    bio: user.bio || '',
    workspaceRole: membership.role,
    status: membership.status,
    joinedAt: membership.joinedAt,
    isActive: user.isActive,
    lastLogin: user.lastLogin,
    stats: {
      totalTasks,
      completedTasks,
      inProgressTasks,
      overdueTasks,
      activeProjectsCount: distinctProjects.filter(Boolean).length,
      completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 100
    },
    recentActivities
  };
};

export const getMemberTasks = async (workspaceId, memberId, query = {}) => {
  const { userId } = await resolveMemberUserId(workspaceId, memberId);

  const filter = {
    workspace: new mongoose.Types.ObjectId(workspaceId),
    assignee: userId
  };

  if (query.status) filter.status = query.status.toLowerCase();
  if (query.priority) filter.priority = query.priority.toLowerCase();
  if (query.project) filter.project = new mongoose.Types.ObjectId(query.project);

  const tasks = await Task.find(filter)
    .populate('project', 'title name key status')
    .populate('board', 'title name')
    .populate('list', 'title name')
    .sort({ dueDate: 1, createdAt: -1 });

  return {
    tasks,
    total: tasks.length
  };
};

export const getMemberProjects = async (workspaceId, memberId) => {
  const { userId } = await resolveMemberUserId(workspaceId, memberId);

  // Projects where member has assigned tasks or is assigned directly
  const projectIdsFromTasks = await Task.distinct('project', {
    workspace: workspaceId,
    assignee: userId
  });

  const validProjectIds = projectIdsFromTasks.filter(Boolean);

  const projects = await Project.find({
    workspace: workspaceId,
    $or: [
      { _id: { $in: validProjectIds } },
      { 'members.user': userId },
      { owner: userId }
    ]
  }).populate('owner', 'name email avatar');

  return {
    projects,
    total: projects.length
  };
};

export const getMemberActivities = async (workspaceId, memberId, query = {}) => {
  const { userId } = await resolveMemberUserId(workspaceId, memberId);
  const limit = parseInt(query.limit, 10) || 20;

  const activities = await Activity.find({
    workspace: workspaceId,
    user: userId
  })
    .sort({ createdAt: -1 })
    .limit(limit);

  return {
    activities,
    total: activities.length
  };
};

export const getTeamWorkload = async (workspaceId) => {
  if (!workspaceId) throw new ApiError(400, 'Workspace ID is required');

  const members = await WorkspaceMember.find({
    workspace: workspaceId,
    status: 'active'
  }).populate('user', 'name email avatar');

  const memberUserIds = members.map((m) => m.user?._id).filter(Boolean);

  const taskStats = await Task.aggregate([
    {
      $match: {
        workspace: new mongoose.Types.ObjectId(workspaceId),
        assignee: { $in: memberUserIds }
      }
    },
    {
      $group: {
        _id: '$assignee',
        totalAssigned: { $sum: 1 },
        todo: { $sum: { $cond: [{ $eq: ['$status', 'todo'] }, 1, 0] } },
        inProgress: { $sum: { $cond: [{ $eq: ['$status', 'in_progress'] }, 1, 0] } },
        review: { $sum: { $cond: [{ $eq: ['$status', 'review'] }, 1, 0] } },
        done: { $sum: { $cond: [{ $eq: ['$status', 'done'] }, 1, 0] } },
        urgentPriority: { $sum: { $cond: [{ $eq: ['$priority', 'urgent'] }, 1, 0] } },
        highPriority: { $sum: { $cond: [{ $eq: ['$priority', 'high'] }, 1, 0] } },
        overdue: {
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

  const standardCapacity = 8; // standard task benchmark for full capacity

  const workloads = members
    .filter((m) => m.user)
    .map((m) => {
      const s = statsMap.get(m.user._id.toString()) || {
        totalAssigned: 0,
        todo: 0,
        inProgress: 0,
        review: 0,
        done: 0,
        urgentPriority: 0,
        highPriority: 0,
        overdue: 0
      };

      const activeTasks = s.todo + s.inProgress + s.review;
      const loadPercentage = Math.min(100, Math.round((activeTasks / standardCapacity) * 100));

      let capacityStatus = 'available';
      if (loadPercentage >= 100) capacityStatus = 'overloaded';
      else if (loadPercentage >= 70) capacityStatus = 'busy';
      else if (loadPercentage >= 35) capacityStatus = 'moderate';

      return {
        memberId: m._id.toString(),
        userId: m.user._id.toString(),
        name: m.user.name,
        email: m.user.email,
        avatar: m.user.avatar || '',
        role: m.role,
        activeTasks,
        completedTasks: s.done,
        totalTasks: s.totalAssigned,
        breakdown: {
          todo: s.todo,
          inProgress: s.inProgress,
          review: s.review,
          done: s.done,
          urgent: s.urgentPriority,
          high: s.highPriority,
          overdue: s.overdue
        },
        capacity: standardCapacity,
        loadPercentage,
        capacityStatus
      };
    });

  const totalActiveTasks = workloads.reduce((sum, w) => sum + w.activeTasks, 0);
  const avgLoadPercentage = workloads.length > 0
    ? Math.round(workloads.reduce((sum, w) => sum + w.loadPercentage, 0) / workloads.length)
    : 0;

  return {
    workloads,
    summary: {
      teamSize: workloads.length,
      totalActiveTasks,
      averageLoadPercentage: avgLoadPercentage,
      overloadedCount: workloads.filter((w) => w.capacityStatus === 'overloaded').length,
      availableCount: workloads.filter((w) => w.capacityStatus === 'available').length
    }
  };
};

export const getTeamPerformance = async (workspaceId) => {
  if (!workspaceId) throw new ApiError(400, 'Workspace ID is required');

  const members = await WorkspaceMember.find({
    workspace: workspaceId,
    status: 'active'
  }).populate('user', 'name email avatar');

  const memberUserIds = members.map((m) => m.user?._id).filter(Boolean);

  const performanceAggregations = await Task.aggregate([
    {
      $match: {
        workspace: new mongoose.Types.ObjectId(workspaceId),
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
  performanceAggregations.forEach((p) => perfMap.set(p._id.toString(), p));

  const performanceList = members
    .filter((m) => m.user)
    .map((m) => {
      const p = perfMap.get(m.user._id.toString()) || {
        totalTasks: 0,
        completedTasks: 0,
        inProgressTasks: 0,
        overdueTasks: 0
      };

      const completionRate = p.totalTasks > 0 ? Math.round((p.completedTasks / p.totalTasks) * 100) : 100;
      const onTimeRate = p.completedTasks > 0
        ? Math.max(0, Math.round(((p.completedTasks - p.overdueTasks) / p.completedTasks) * 100))
        : 100;

      let rating = 'Excellent';
      if (completionRate < 50 || p.overdueTasks > 3) rating = 'Needs Attention';
      else if (completionRate < 75) rating = 'Good';

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
        completionRate,
        onTimeRate,
        rating
      };
    });

  const overallTotal = performanceList.reduce((sum, p) => sum + p.totalTasks, 0);
  const overallCompleted = performanceList.reduce((sum, p) => sum + p.completedTasks, 0);
  const overallCompletionRate = overallTotal > 0 ? Math.round((overallCompleted / overallTotal) * 100) : 100;

  return {
    performance: performanceList,
    summary: {
      teamSize: performanceList.length,
      overallCompletionRate,
      totalCompletedTasks: overallCompleted,
      totalAssignedTasks: overallTotal
    }
  };
};

export const getTeamAvailability = async (workspaceId) => {
  if (!workspaceId) throw new ApiError(400, 'Workspace ID is required');

  const workloadData = await getTeamWorkload(workspaceId);

  const availability = workloadData.workloads.map((w) => ({
    memberId: w.memberId,
    userId: w.userId,
    name: w.name,
    email: w.email,
    avatar: w.avatar,
    role: w.role,
    activeTasks: w.activeTasks,
    capacity: w.capacity,
    availableSlots: Math.max(0, w.capacity - w.activeTasks),
    status: w.capacityStatus,
    isAvailableForAssignment: w.activeTasks < w.capacity
  }));

  return {
    availability,
    summary: {
      availableMembers: availability.filter((a) => a.isAvailableForAssignment).length,
      totalMembers: availability.length
    }
  };
};

export const getMemberWorkload = async (workspaceId, memberId) => {
  const { membership, userId } = await resolveMemberUserId(workspaceId, memberId);

  const user = await User.findById(userId).select('name email avatar');
  const tasks = await Task.find({
    workspace: workspaceId,
    assignee: userId
  }).populate('project', 'title name');

  const now = new Date();
  const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  const todo = tasks.filter((t) => t.status === 'todo').length;
  const inProgress = tasks.filter((t) => t.status === 'in_progress').length;
  const review = tasks.filter((t) => t.status === 'review').length;
  const done = tasks.filter((t) => t.status === 'done').length;

  const urgent = tasks.filter((t) => t.priority === 'urgent' && t.status !== 'done').length;
  const high = tasks.filter((t) => t.priority === 'high' && t.status !== 'done').length;
  const overdue = tasks.filter((t) => t.status !== 'done' && t.dueDate && new Date(t.dueDate) < now).length;
  const dueThisWeek = tasks.filter(
    (t) => t.status !== 'done' && t.dueDate && new Date(t.dueDate) >= now && new Date(t.dueDate) <= nextWeek
  ).length;

  const activeTasks = todo + inProgress + review;
  const standardCapacity = 8;
  const loadPercentage = Math.min(100, Math.round((activeTasks / standardCapacity) * 100));

  let capacityStatus = 'available';
  if (loadPercentage >= 100) capacityStatus = 'overloaded';
  else if (loadPercentage >= 70) capacityStatus = 'busy';
  else if (loadPercentage >= 35) capacityStatus = 'moderate';

  return {
    memberId: membership._id.toString(),
    userId: user?._id?.toString() || userId.toString(),
    name: user?.name || 'Team Member',
    email: user?.email || '',
    avatar: user?.avatar || '',
    workspaceRole: membership.role,
    activeTasks,
    completedTasks: done,
    totalTasks: tasks.length,
    capacity: standardCapacity,
    loadPercentage,
    capacityStatus,
    metrics: {
      todo,
      inProgress,
      review,
      done,
      urgent,
      high,
      overdue,
      dueThisWeek
    },
    upcomingTasks: tasks
      .filter((t) => t.status !== 'done' && t.dueDate)
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
      .slice(0, 5)
  };
};
