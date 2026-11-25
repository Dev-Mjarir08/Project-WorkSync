import mongoose from 'mongoose';
import { Task } from '../../../models/Task.js';
import { Board } from '../../../models/Board.js';
import { Workspace } from '../../../models/Workspace.js';
import { WorkspaceMember } from '../../../models/WorkspaceMember.js';
import { Project } from '../../../models/Project.js';
import { User } from '../../../models/User.js';
import { AuditLog } from '../../../models/AuditLog.js';
import { ApiError } from '../../../utils/ApiError.js';
import { createNotification } from '../../../utils/createNotification.js';

const resolveAssigneeUserId = async (rawAssignee) => {
  if (!rawAssignee) return null;
  if (typeof rawAssignee === 'object' && rawAssignee._id) {
    rawAssignee = rawAssignee._id.toString();
  }
  if (typeof rawAssignee === 'object' && rawAssignee.id) {
    rawAssignee = rawAssignee.id.toString();
  }
  if (rawAssignee === 'unassigned') return null;

  if (mongoose.Types.ObjectId.isValid(rawAssignee)) {
    const user = await User.findById(rawAssignee).select('_id');
    if (user) return user._id;

    const member = await WorkspaceMember.findById(rawAssignee).select('user');
    if (member?.user) return member.user;
  }
  if (typeof rawAssignee === 'string' && rawAssignee.trim()) {
    const user = await User.findOne({
      $or: [
        { email: rawAssignee.trim().toLowerCase() },
        { name: rawAssignee.trim() },
        { name: { $regex: new RegExp(`^${rawAssignee.trim()}$`, 'i') } }
      ]
    }).select('_id');
    if (user) return user._id;
  }
  return null;
};

const recordAudit = async ({ action, details, actor, target = '', targetId = '' }) => {
  try {
    await AuditLog.create({
      action,
      category: 'system',
      details,
      actor: {
        user: actor?._id || actor?.id,
        name: actor?.name || 'Super Admin',
        email: actor?.email || 'admin@worksync.io'
      },
      target,
      targetId: targetId ? targetId.toString() : '',
      status: 'success'
    });
  } catch (err) {
    console.error('AuditLog error in super admin tasks:', err.message);
  }
};

export const getAllTasks = async (query = {}) => {
  const {
    workspace,
    project,
    board,
    assignee,
    status,
    priority,
    search,
    page = 1,
    limit = 50
  } = query;

  const filter = {};

  if (workspace && workspace !== 'all' && mongoose.Types.ObjectId.isValid(workspace)) {
    filter.workspace = new mongoose.Types.ObjectId(workspace);
  }
  if (project && project !== 'all' && mongoose.Types.ObjectId.isValid(project)) {
    filter.project = new mongoose.Types.ObjectId(project);
  }
  if (board && board !== 'all' && mongoose.Types.ObjectId.isValid(board)) {
    filter.board = new mongoose.Types.ObjectId(board);
  }
  if (assignee && assignee !== 'all') {
    if (assignee === 'unassigned') {
      filter.$or = [{ assignee: null }, { assignee: { $exists: false } }];
    } else if (mongoose.Types.ObjectId.isValid(assignee)) {
      filter.assignee = new mongoose.Types.ObjectId(assignee);
    }
  }
  if (status && status !== 'all') {
    filter.status = status.toLowerCase();
  }
  if (priority && priority !== 'all') {
    filter.priority = priority.toLowerCase();
  }
  if (search && search.trim()) {
    filter.title = { $regex: search.trim(), $options: 'i' };
  }

  const parsedPage = Math.max(1, parseInt(page, 10) || 1);
  const parsedLimit = Math.min(100, Math.max(1, parseInt(limit, 10) || 50));
  const skip = (parsedPage - 1) * parsedLimit;

  const [rawTasks, totalCount, statusCountsAgg] = await Promise.all([
    Task.find(filter)
      .populate('assignee', 'name email avatar role')
      .populate('workspace', 'name slug')
      .populate('project', 'name key')
      .populate('board', 'name')
      .populate('list', 'name')
      .sort({ updatedAt: -1, order: 1 })
      .skip(skip)
      .limit(parsedLimit)
      .lean(),
    Task.countDocuments(filter),
    Task.aggregate([
      ...(workspace && mongoose.Types.ObjectId.isValid(workspace) ? [{ $match: { workspace: new mongoose.Types.ObjectId(workspace) } }] : []),
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ])
  ]);

  const statusCounts = { todo: 0, in_progress: 0, review: 0, done: 0 };
  statusCountsAgg.forEach(item => {
    if (item._id && statusCounts[item._id] !== undefined) {
      statusCounts[item._id] = item.count;
    }
  });

  const tasks = rawTasks.map(t => ({
    id: t._id.toString(),
    _id: t._id.toString(),
    title: t.title,
    description: t.description || '',
    status: t.status || 'todo',
    priority: t.priority || 'medium',
    dueDate: t.dueDate,
    order: t.order || 0,
    assignee: t.assignee ? {
      id: t.assignee._id?.toString(),
      _id: t.assignee._id?.toString(),
      name: t.assignee.name,
      email: t.assignee.email,
      avatar: t.assignee.avatar,
      role: t.assignee.role
    } : null,
    workspace: t.workspace ? {
      id: t.workspace._id?.toString(),
      _id: t.workspace._id?.toString(),
      name: t.workspace.name,
      slug: t.workspace.slug
    } : null,
    project: t.project ? {
      id: t.project._id?.toString(),
      _id: t.project._id?.toString(),
      name: t.project.name,
      key: t.project.key
    } : null,
    board: t.board ? {
      id: t.board._id?.toString(),
      _id: t.board._id?.toString(),
      name: t.board.name
    } : null,
    list: t.list ? {
      id: t.list._id?.toString(),
      name: t.list.name
    } : null,
    createdAt: t.createdAt,
    updatedAt: t.updatedAt
  }));

  return {
    tasks,
    totalCount,
    statusCounts,
    pagination: {
      currentPage: parsedPage,
      totalPages: Math.ceil(totalCount / parsedLimit) || 1,
      limit: parsedLimit
    }
  };
};

export const createTask = async (data, actorAdmin) => {
  if (!data.title || !data.title.trim()) {
    throw new ApiError(400, 'Task title is required');
  }

  const resolvedAssigneeId = await resolveAssigneeUserId(data.assigneeId || data.assignee || data.userId);

  let workspaceId = data.workspaceId || data.workspace;
  if (!workspaceId || !mongoose.Types.ObjectId.isValid(workspaceId)) {
    // If assignee provided, prioritize assignee's workspace
    if (resolvedAssigneeId) {
      const member = await WorkspaceMember.findOne({ user: resolvedAssigneeId, status: 'active' }).select('workspace');
      if (member?.workspace) {
        workspaceId = member.workspace;
      }
    }
  }

  if (!workspaceId || !mongoose.Types.ObjectId.isValid(workspaceId)) {
    const defaultWs = await Workspace.findOne({ isActive: true });
    if (!defaultWs) throw new ApiError(400, 'No active workspace available to create task');
    workspaceId = defaultWs._id;
  }

  // Ensure the assignee is enrolled as a member of the workspace so they have access
  if (resolvedAssigneeId && workspaceId) {
    const isMember = await WorkspaceMember.findOne({ workspace: workspaceId, user: resolvedAssigneeId });
    if (!isMember) {
      const u = await User.findById(resolvedAssigneeId).select('role');
      await WorkspaceMember.create({
        workspace: workspaceId,
        user: resolvedAssigneeId,
        role: u?.role || 'member',
        status: 'active'
      }).catch(() => {});
    }
  }

  let boardId = data.boardId || data.board;
  if (!boardId || !mongoose.Types.ObjectId.isValid(boardId)) {
    let defaultBoard = await Board.findOne({ workspace: workspaceId, isArchived: false });
    if (!defaultBoard) {
      defaultBoard = await Board.create({
        workspace: workspaceId,
        name: 'General Tasks Board',
        createdBy: actorAdmin?._id
      });
    }
    boardId = defaultBoard._id;
  }

  let projectId = data.projectId || data.project;
  if (!projectId || !mongoose.Types.ObjectId.isValid(projectId)) {
    projectId = null;
  }

  let listId = data.listId || data.list;
  if (!listId || !mongoose.Types.ObjectId.isValid(listId)) {
    listId = null;
  }

  const task = await Task.create({
    workspace: workspaceId,
    board: boardId,
    project: projectId,
    list: listId,
    assignee: resolvedAssigneeId || null,
    title: data.title.trim(),
    description: data.description || '',
    status: data.status ? data.status.toLowerCase() : 'todo',
    priority: data.priority ? data.priority.toLowerCase() : 'medium',
    dueDate: data.dueDate ? new Date(data.dueDate) : null,
    order: data.order !== undefined ? Number(data.order) : 0
  });

  // Non-blocking side effects
  Promise.all([
    boardId ? Board.findByIdAndUpdate(boardId, { $inc: { tasksCount: 1 } }) : null,
    workspaceId ? Workspace.findByIdAndUpdate(workspaceId, { $inc: { tasksCount: 1 } }) : null,
    resolvedAssigneeId ? createNotification({
      recipient: resolvedAssigneeId,
      workspace: workspaceId,
      sender: actorAdmin?._id,
      title: 'New Task Assigned',
      message: `You were assigned to task "${task.title}"`,
      type: 'task',
      link: '/tasks'
    }) : null,
    recordAudit({
      action: 'Task Created',
      details: `Super Admin created task "${task.title}"`,
      actor: actorAdmin,
      target: task.title,
      targetId: task._id.toString()
    })
  ]).catch(() => {});

  const populated = await Task.findById(task._id)
    .populate('assignee', 'name email avatar role')
    .populate('workspace', 'name slug')
    .populate('project', 'name key')
    .populate('board', 'name');

  return populated;
};

export const getTaskById = async (taskId) => {
  const task = await Task.findById(taskId)
    .populate('assignee', 'name email avatar role')
    .populate('workspace', 'name slug')
    .populate('project', 'name key')
    .populate('board', 'name');

  if (!task) throw new ApiError(404, 'Task not found');
  return task;
};

export const updateTask = async (taskId, data, actorAdmin) => {
  const task = await Task.findById(taskId);
  if (!task) throw new ApiError(404, 'Task not found');

  const previousAssignee = task.assignee?.toString();
  if (data.title !== undefined) task.title = data.title.trim();
  if (data.description !== undefined) task.description = data.description;
  if (data.status !== undefined) task.status = data.status.toLowerCase();
  if (data.priority !== undefined) task.priority = data.priority.toLowerCase();
  if (data.dueDate !== undefined) task.dueDate = data.dueDate ? new Date(data.dueDate) : null;
  if (data.assignee !== undefined || data.assigneeId !== undefined) {
    const rawAssignee = data.assigneeId !== undefined ? data.assigneeId : data.assignee;
    task.assignee = await resolveAssigneeUserId(rawAssignee);
    if (task.assignee && task.workspace) {
      const isMember = await WorkspaceMember.findOne({ workspace: task.workspace, user: task.assignee });
      if (!isMember) {
        const u = await User.findById(task.assignee).select('role');
        await WorkspaceMember.create({
          workspace: task.workspace,
          user: task.assignee,
          role: u?.role || 'member',
          status: 'active'
        }).catch(() => {});
      }
    }
  }
  if (data.project !== undefined || data.projectId !== undefined) {
    task.project = data.projectId || data.project || null;
  }
  if (data.workspace !== undefined || data.workspaceId !== undefined) {
    task.workspace = data.workspaceId || data.workspace || null;
  }
  if (data.board !== undefined || data.boardId !== undefined) {
    task.board = data.boardId || data.board || null;
  }
  if (data.order !== undefined) task.order = Number(data.order);

  await task.save();

  if (task.assignee && task.assignee.toString() !== previousAssignee) {
    await createNotification({
      recipient: task.assignee,
      workspace: task.workspace,
      sender: actorAdmin?._id,
      title: 'Task Assigned',
      message: `You were assigned to task "${task.title}"`,
      type: 'task',
      link: '/tasks'
    }).catch(() => {});
  }

  await recordAudit({
    action: 'Task Updated',
    details: `Super Admin updated task "${task.title}"`,
    actor: actorAdmin,
    target: task.title,
    targetId: task._id.toString()
  });

  const populated = await Task.findById(task._id)
    .populate('assignee', 'name email avatar role')
    .populate('workspace', 'name slug')
    .populate('project', 'name key')
    .populate('board', 'name');

  return populated;
};

export const updateTaskStatus = async (taskId, status, actorAdmin) => {
  const task = await Task.findById(taskId);
  if (!task) throw new ApiError(404, 'Task not found');

  const validStatuses = ['todo', 'in_progress', 'review', 'done'];
  const normalized = status.toLowerCase();
  if (!validStatuses.includes(normalized)) {
    throw new ApiError(400, `Invalid status. Allowed: ${validStatuses.join(', ')}`);
  }

  task.status = normalized;
  await task.save();

  await recordAudit({
    action: 'Task Status Updated',
    details: `Task "${task.title}" moved to ${normalized}`,
    actor: actorAdmin,
    target: task.title,
    targetId: task._id.toString()
  });

  return {
    id: task._id.toString(),
    status: task.status
  };
};

export const assignTask = async (taskId, assigneeId, actorAdmin) => {
  const task = await Task.findById(taskId);
  if (!task) throw new ApiError(404, 'Task not found');

  const resolvedAssigneeId = await resolveAssigneeUserId(assigneeId);
  task.assignee = resolvedAssigneeId || null;
  await task.save();

  if (resolvedAssigneeId && task.workspace) {
    const isMember = await WorkspaceMember.findOne({ workspace: task.workspace, user: resolvedAssigneeId });
    if (!isMember) {
      const u = await User.findById(resolvedAssigneeId).select('role');
      await WorkspaceMember.create({
        workspace: task.workspace,
        user: resolvedAssigneeId,
        role: u?.role || 'member',
        status: 'active'
      }).catch(() => {});
    }
    createNotification({
      recipient: resolvedAssigneeId,
      workspace: task.workspace,
      sender: actorAdmin?._id,
      title: 'Task Assigned',
      message: `You were assigned to task "${task.title}"`,
      type: 'task',
      link: '/tasks'
    }).catch(() => {});
  }

  recordAudit({
    action: 'Task Assignee Updated',
    details: resolvedAssigneeId ? `Assigned task "${task.title}" to user ${resolvedAssigneeId}` : `Unassigned task "${task.title}"`,
    actor: actorAdmin,
    target: task.title,
    targetId: task._id.toString()
  }).catch(() => {});

  const populated = await Task.findById(task._id)
    .populate('assignee', 'name email avatar role')
    .populate('workspace', 'name slug')
    .populate('project', 'name key')
    .populate('board', 'name');

  return populated;
};

export const deleteTask = async (taskId, actorAdmin) => {
  if (!taskId) throw new ApiError(400, 'Task ID is required');

  let task = null;
  if (mongoose.Types.ObjectId.isValid(taskId)) {
    task = await Task.findByIdAndDelete(taskId);
  } else {
    task = await Task.findOneAndDelete({ $or: [{ _id: taskId }, { id: taskId }] }).catch(() => null);
  }

  if (task) {
    if (task.board) {
      await Board.findByIdAndUpdate(task.board, { $inc: { tasksCount: -1 } }).catch(() => {});
    }
    if (task.workspace) {
      await Workspace.findByIdAndUpdate(task.workspace, { $inc: { tasksCount: -1 } }).catch(() => {});
    }

    await recordAudit({
      action: 'Task Deleted',
      details: `Super Admin permanently deleted task "${task.title}"`,
      actor: actorAdmin,
      target: task.title,
      targetId: taskId.toString()
    });
  }

  return {
    id: taskId,
    title: task?.title || 'Task',
    deleted: true
  };
};

