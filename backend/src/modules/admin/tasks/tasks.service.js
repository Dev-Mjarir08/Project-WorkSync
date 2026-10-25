import mongoose from 'mongoose';
import { Task } from '../../../models/Task.js';
import { Board } from '../../../models/Board.js';
import { List } from '../../../models/List.js';
import { Activity } from '../../../models/Activity.js';
import { ApiError } from '../../../utils/ApiError.js';

export const getTasks = async (workspaceId, query = {}) => {
  if (!workspaceId) throw new ApiError(400, 'Workspace ID is required');
  const wsId = new mongoose.Types.ObjectId(workspaceId);

  const filter = { workspace: wsId };

  if (query.status && query.status !== 'all') {
    filter.status = query.status.toLowerCase();
  }
  if (query.priority && query.priority !== 'all') {
    filter.priority = query.priority.toLowerCase();
  }
  if (query.assignee) {
    filter.assignee = new mongoose.Types.ObjectId(query.assignee);
  }
  if (query.board) {
    filter.board = new mongoose.Types.ObjectId(query.board);
  }
  if (query.project) {
    filter.project = new mongoose.Types.ObjectId(query.project);
  }
  if (query.search) {
    filter.$or = [
      { title: { $regex: query.search, $options: 'i' } },
      { description: { $regex: query.search, $options: 'i' } }
    ];
  }

  const tasks = await Task.find(filter)
    .populate('assignee', 'name email avatar')
    .populate('board', 'name')
    .populate('project', 'name key')
    .populate('list', 'name')
    .sort({ order: 1, createdAt: -1 });

  return tasks;
};

export const createTask = async (workspaceId, data, actorUser) => {
  if (!workspaceId) throw new ApiError(400, 'Workspace ID is required');
  if (!data.title || !data.title.trim()) throw new ApiError(400, 'Task title is required');

  const taskData = {
    workspace: workspaceId,
    title: data.title.trim(),
    description: data.description || '',
    board: data.boardId || data.board || null,
    project: data.projectId || data.project || null,
    list: data.listId || data.list || null,
    assignee: data.assigneeId || data.assignee || null,
    status: data.status || 'todo',
    priority: data.priority || 'medium',
    dueDate: data.dueDate ? new Date(data.dueDate) : null,
    order: data.order !== undefined ? Number(data.order) : 0
  };

  const task = await Task.create(taskData);

  if (task.board) {
    await Board.findByIdAndUpdate(task.board, { $inc: { tasksCount: 1 } }).catch(() => {});
  }

  await Activity.create({
    workspace: workspaceId,
    user: actorUser._id,
    action: 'TASK_CREATED',
    entityType: 'task',
    entityName: task.title,
    details: `Created task: ${task.title}`
  }).catch(() => {});

  const populatedTask = await Task.findById(task._id)
    .populate('assignee', 'name email avatar')
    .populate('board', 'name')
    .populate('project', 'name key')
    .populate('list', 'name');

  return populatedTask;
};

export const getTaskById = async (workspaceId, taskId) => {
  if (!workspaceId) throw new ApiError(400, 'Workspace ID is required');
  if (!taskId) throw new ApiError(400, 'Task ID is required');

  const task = await Task.findOne({ _id: taskId, workspace: workspaceId })
    .populate('assignee', 'name email avatar role')
    .populate('board', 'name')
    .populate('project', 'name key')
    .populate('list', 'name');

  if (!task) throw new ApiError(404, 'Task not found');
  return task;
};

export const updateTask = async (workspaceId, taskId, data, actorUser) => {
  if (!workspaceId) throw new ApiError(400, 'Workspace ID is required');
  if (!taskId) throw new ApiError(400, 'Task ID is required');

  const task = await Task.findOne({ _id: taskId, workspace: workspaceId });
  if (!task) throw new ApiError(404, 'Task not found');

  if (data.title !== undefined) task.title = data.title.trim();
  if (data.description !== undefined) task.description = data.description;
  if (data.status !== undefined) task.status = data.status.toLowerCase();
  if (data.priority !== undefined) task.priority = data.priority.toLowerCase();
  if (data.dueDate !== undefined) task.dueDate = data.dueDate ? new Date(data.dueDate) : null;
  if (data.assignee !== undefined || data.assigneeId !== undefined) {
    task.assignee = data.assigneeId || data.assignee || null;
  }
  if (data.project !== undefined || data.projectId !== undefined) {
    task.project = data.projectId || data.project || null;
  }
  if (data.list !== undefined || data.listId !== undefined) {
    task.list = data.listId || data.list || null;
  }
  if (data.order !== undefined) task.order = Number(data.order);

  const prevBoard = task.board?.toString();
  const nextBoard = data.boardId || data.board;
  if (nextBoard !== undefined && nextBoard?.toString() !== prevBoard) {
    if (prevBoard) {
      await Board.findByIdAndUpdate(prevBoard, { $inc: { tasksCount: -1 } }).catch(() => {});
    }
    task.board = nextBoard || null;
    if (task.board) {
      await Board.findByIdAndUpdate(task.board, { $inc: { tasksCount: 1 } }).catch(() => {});
    }
  }

  await task.save();

  await Activity.create({
    workspace: workspaceId,
    user: actorUser._id,
    action: 'TASK_UPDATED',
    entityType: 'task',
    entityName: task.title,
    details: `Updated task: ${task.title}`
  }).catch(() => {});

  const populatedTask = await Task.findById(task._id)
    .populate('assignee', 'name email avatar')
    .populate('board', 'name')
    .populate('project', 'name key')
    .populate('list', 'name');

  return populatedTask;
};

export const deleteTask = async (workspaceId, taskId, actorUser) => {
  if (!workspaceId) throw new ApiError(400, 'Workspace ID is required');
  if (!taskId) throw new ApiError(400, 'Task ID is required');

  const task = await Task.findOneAndDelete({ _id: taskId, workspace: workspaceId });
  if (!task) throw new ApiError(404, 'Task not found');

  if (task.board) {
    await Board.findByIdAndUpdate(task.board, { $inc: { tasksCount: -1 } }).catch(() => {});
  }

  await Activity.create({
    workspace: workspaceId,
    user: actorUser._id,
    action: 'TASK_DELETED',
    entityType: 'task',
    entityName: task.title,
    details: `Deleted task: ${task.title}`
  }).catch(() => {});

  return {
    id: taskId,
    title: task.title,
    deleted: true
  };
};

export const assignTask = async (workspaceId, taskId, assigneeId, actorUser) => {
  if (!workspaceId) throw new ApiError(400, 'Workspace ID is required');
  if (!taskId) throw new ApiError(400, 'Task ID is required');

  const task = await Task.findOne({ _id: taskId, workspace: workspaceId });
  if (!task) throw new ApiError(404, 'Task not found');

  task.assignee = assigneeId || null;
  await task.save();

  await Activity.create({
    workspace: workspaceId,
    user: actorUser._id,
    action: 'TASK_ASSIGNED',
    entityType: 'task',
    entityName: task.title,
    details: assigneeId ? `Assigned task to user: ${assigneeId}` : `Unassigned task: ${task.title}`
  }).catch(() => {});

  const populatedTask = await Task.findById(task._id)
    .populate('assignee', 'name email avatar')
    .populate('board', 'name')
    .populate('project', 'name key')
    .populate('list', 'name');

  return populatedTask;
};

export const updateTaskStatus = async (workspaceId, taskId, status, actorUser) => {
  if (!workspaceId) throw new ApiError(400, 'Workspace ID is required');
  if (!taskId) throw new ApiError(400, 'Task ID is required');
  if (!status) throw new ApiError(400, 'Task status is required');

  const validStatuses = ['todo', 'in_progress', 'review', 'done'];
  const normalizedStatus = status.toLowerCase();
  if (!validStatuses.includes(normalizedStatus)) {
    throw new ApiError(400, `Invalid task status. Allowed: ${validStatuses.join(', ')}`);
  }

  const task = await Task.findOne({ _id: taskId, workspace: workspaceId });
  if (!task) throw new ApiError(404, 'Task not found');

  task.status = normalizedStatus;
  await task.save();

  await Activity.create({
    workspace: workspaceId,
    user: actorUser._id,
    action: 'TASK_STATUS_UPDATED',
    entityType: 'task',
    entityName: task.title,
    details: `Updated task status to: ${normalizedStatus}`
  }).catch(() => {});

  return {
    id: task._id.toString(),
    status: task.status
  };
};

export const updateTaskPriority = async (workspaceId, taskId, priority, actorUser) => {
  if (!workspaceId) throw new ApiError(400, 'Workspace ID is required');
  if (!taskId) throw new ApiError(400, 'Task ID is required');
  if (!priority) throw new ApiError(400, 'Task priority is required');

  const validPriorities = ['low', 'medium', 'high', 'urgent'];
  const normalizedPriority = priority.toLowerCase();
  if (!validPriorities.includes(normalizedPriority)) {
    throw new ApiError(400, `Invalid task priority. Allowed: ${validPriorities.join(', ')}`);
  }

  const task = await Task.findOne({ _id: taskId, workspace: workspaceId });
  if (!task) throw new ApiError(404, 'Task not found');

  task.priority = normalizedPriority;
  await task.save();

  await Activity.create({
    workspace: workspaceId,
    user: actorUser._id,
    action: 'TASK_PRIORITY_UPDATED',
    entityType: 'task',
    entityName: task.title,
    details: `Updated task priority to: ${normalizedPriority}`
  }).catch(() => {});

  return {
    id: task._id.toString(),
    priority: task.priority
  };
};

export const updateTaskDueDate = async (workspaceId, taskId, dueDate, actorUser) => {
  if (!workspaceId) throw new ApiError(400, 'Workspace ID is required');
  if (!taskId) throw new ApiError(400, 'Task ID is required');

  const task = await Task.findOne({ _id: taskId, workspace: workspaceId });
  if (!task) throw new ApiError(404, 'Task not found');

  task.dueDate = dueDate ? new Date(dueDate) : null;
  await task.save();

  await Activity.create({
    workspace: workspaceId,
    user: actorUser._id,
    action: 'TASK_DUE_DATE_UPDATED',
    entityType: 'task',
    entityName: task.title,
    details: `Updated task due date to: ${task.dueDate ? task.dueDate.toISOString() : 'None'}`
  }).catch(() => {});

  return {
    id: task._id.toString(),
    dueDate: task.dueDate
  };
};

export const moveTask = async (workspaceId, taskId, moveData = {}, actorUser) => {
  if (!workspaceId) throw new ApiError(400, 'Workspace ID is required');
  if (!taskId) throw new ApiError(400, 'Task ID is required');

  const task = await Task.findOne({ _id: taskId, workspace: workspaceId });
  if (!task) throw new ApiError(404, 'Task not found');

  const { listId, list, boardId, board, order } = moveData;

  const targetList = listId || list;
  if (targetList !== undefined) {
    task.list = targetList || null;
  }

  const targetBoard = boardId || board;
  if (targetBoard !== undefined && targetBoard?.toString() !== task.board?.toString()) {
    if (task.board) {
      await Board.findByIdAndUpdate(task.board, { $inc: { tasksCount: -1 } }).catch(() => {});
    }
    task.board = targetBoard || null;
    if (task.board) {
      await Board.findByIdAndUpdate(task.board, { $inc: { tasksCount: 1 } }).catch(() => {});
    }
  }

  if (order !== undefined) {
    task.order = Number(order);
  }

  await task.save();

  await Activity.create({
    workspace: workspaceId,
    user: actorUser._id,
    action: 'TASK_MOVED',
    entityType: 'task',
    entityName: task.title,
    details: `Moved task: ${task.title}`
  }).catch(() => {});

  const populatedTask = await Task.findById(task._id)
    .populate('assignee', 'name email avatar')
    .populate('board', 'name')
    .populate('project', 'name key')
    .populate('list', 'name');

  return populatedTask;
};

export const getOverdueTasks = async (workspaceId) => {
  if (!workspaceId) throw new ApiError(400, 'Workspace ID is required');
  const wsId = new mongoose.Types.ObjectId(workspaceId);

  const tasks = await Task.find({
    workspace: wsId,
    dueDate: { $lt: new Date() },
    status: { $nin: ['done', 'completed'] }
  })
    .populate('assignee', 'name email avatar')
    .populate('board', 'name')
    .populate('project', 'name key')
    .populate('list', 'name')
    .sort({ dueDate: 1 });

  return tasks;
};

export const getUnassignedTasks = async (workspaceId) => {
  if (!workspaceId) throw new ApiError(400, 'Workspace ID is required');
  const wsId = new mongoose.Types.ObjectId(workspaceId);

  const tasks = await Task.find({
    workspace: wsId,
    $or: [{ assignee: null }, { assignee: { $exists: false } }]
  })
    .populate('board', 'name')
    .populate('project', 'name key')
    .populate('list', 'name')
    .sort({ createdAt: -1 });

  return tasks;
};
