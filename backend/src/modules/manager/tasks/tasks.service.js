import mongoose from 'mongoose';
import { Task } from '../../../models/Task.js';
import { Board } from '../../../models/Board.js';
import { List } from '../../../models/List.js';
import { Project } from '../../../models/Project.js';
import { Activity } from '../../../models/Activity.js';
import { ApiError } from '../../../utils/ApiError.js';

export const getTasks = async (workspaceId, query = {}, user) => {
  if (!workspaceId) throw new ApiError(400, 'Workspace ID is required');
  const wsId = new mongoose.Types.ObjectId(workspaceId);

  const filter = { workspace: wsId };

  if (query.status && query.status !== 'all') {
    filter.status = query.status.toLowerCase();
  }
  if (query.priority && query.priority !== 'all') {
    filter.priority = query.priority.toLowerCase();
  }
  if (query.boardId) {
    filter.board = new mongoose.Types.ObjectId(query.boardId);
  }
  if (query.projectId) {
    filter.project = new mongoose.Types.ObjectId(query.projectId);
  }
  if (query.assigneeId) {
    filter.assignee = new mongoose.Types.ObjectId(query.assigneeId);
  }
  if (query.onlyMine === 'true' && user) {
    filter.assignee = new mongoose.Types.ObjectId(user._id);
  }
  if (query.search) {
    filter.$or = [
      { title: { $regex: query.search, $options: 'i' } },
      { description: { $regex: query.search, $options: 'i' } }
    ];
  }

  const tasks = await Task.find(filter)
    .populate('assignee', 'name email avatar')
    .populate('project', 'name key status')
    .populate('board', 'name')
    .populate('list', 'name position')
    .sort({ order: 1, createdAt: -1 });

  return tasks.map(t => ({
    id: t._id.toString(),
    title: t.title,
    description: t.description,
    status: t.status,
    priority: t.priority,
    dueDate: t.dueDate,
    order: t.order,
    assignee: t.assignee
      ? {
          id: t.assignee._id.toString(),
          name: t.assignee.name,
          email: t.assignee.email,
          avatar: t.assignee.avatar
        }
      : null,
    project: t.project
      ? {
          id: t.project._id.toString(),
          name: t.project.name,
          key: t.project.key
        }
      : null,
    board: t.board ? { id: t.board._id.toString(), name: t.board.name } : null,
    list: t.list ? { id: t.list._id.toString(), name: t.list.name } : null,
    createdAt: t.createdAt,
    updatedAt: t.updatedAt
  }));
};

export const createTask = async (workspaceId, data, actorUser) => {
  if (!workspaceId) throw new ApiError(400, 'Workspace ID is required');
  if (!data.title || !data.title.trim()) throw new ApiError(400, 'Task title is required');

  const cleanTitle = data.title.trim();
  let boardId = data.boardId || data.board;
  let listId = data.listId || data.list;
  let projectId = data.projectId || data.project;

  // If no board provided, find first board in workspace or create a default board
  if (!boardId) {
    let defaultBoard = await Board.findOne({ workspace: workspaceId, isArchived: false });
    if (!defaultBoard) {
      defaultBoard = await Board.create({
        workspace: workspaceId,
        name: 'General Board',
        description: 'Auto-created board for workspace tasks',
        createdBy: actorUser._id
      });
    }
    boardId = defaultBoard._id;
  }

  // If no list provided, find first list on the board
  if (!listId) {
    let defaultList = await List.findOne({ board: boardId }).sort({ position: 1 });
    if (!defaultList) {
      defaultList = await List.create({
        workspace: workspaceId,
        board: boardId,
        name: 'To Do',
        position: 0
      });
    }
    listId = defaultList._id;
  }

  // If project not provided but board has project
  if (!projectId && boardId) {
    const boardDoc = await Board.findById(boardId);
    if (boardDoc?.project) {
      projectId = boardDoc.project;
    }
  }

  const task = await Task.create({
    workspace: workspaceId,
    title: cleanTitle,
    description: data.description || '',
    board: boardId,
    list: listId,
    project: projectId || null,
    assignee: data.assigneeId || data.assignee || null,
    status: data.status || 'todo',
    priority: data.priority || 'medium',
    dueDate: data.dueDate || null,
    order: data.order !== undefined ? data.order : 0
  });

  await Board.findByIdAndUpdate(boardId, { $inc: { tasksCount: 1 } });

  await Activity.create({
    user: actorUser._id,
    workspace: workspaceId,
    action: `Created task "${cleanTitle}"`,
    type: 'task',
    entityType: 'task',
    entityId: task._id,
    entityName: cleanTitle,
    details: `Created in board ${boardId}`
  }).catch(() => {});

  const populated = await Task.findById(task._id)
    .populate('assignee', 'name email avatar')
    .populate('project', 'name key')
    .populate('board', 'name')
    .populate('list', 'name');

  return {
    id: populated._id.toString(),
    title: populated.title,
    description: populated.description,
    status: populated.status,
    priority: populated.priority,
    dueDate: populated.dueDate,
    order: populated.order,
    assignee: populated.assignee,
    project: populated.project,
    board: populated.board,
    list: populated.list,
    createdAt: populated.createdAt
  };
};

export const getTaskById = async (workspaceId, taskId) => {
  if (!workspaceId) throw new ApiError(400, 'Workspace ID is required');
  if (!taskId) throw new ApiError(400, 'Task ID is required');

  const task = await Task.findOne({
    _id: taskId,
    workspace: workspaceId
  })
    .populate('assignee', 'name email avatar')
    .populate('project', 'name key status')
    .populate('board', 'name')
    .populate('list', 'name position');

  if (!task) throw new ApiError(404, 'Task not found in this workspace');

  return {
    id: task._id.toString(),
    title: task.title,
    description: task.description,
    status: task.status,
    priority: task.priority,
    dueDate: task.dueDate,
    order: task.order,
    assignee: task.assignee,
    project: task.project,
    board: task.board,
    list: task.list,
    createdAt: task.createdAt,
    updatedAt: task.updatedAt
  };
};

export const updateTask = async (workspaceId, taskId, data, actorUser) => {
  if (!workspaceId) throw new ApiError(400, 'Workspace ID is required');
  if (!taskId) throw new ApiError(400, 'Task ID is required');

  const task = await Task.findOne({
    _id: taskId,
    workspace: workspaceId
  });
  if (!task) throw new ApiError(404, 'Task not found');

  if (data.title !== undefined) task.title = data.title.trim();
  if (data.description !== undefined) task.description = data.description;
  if (data.assignee !== undefined) task.assignee = data.assignee || null;
  if (data.assigneeId !== undefined) task.assignee = data.assigneeId || null;
  if (data.priority !== undefined) task.priority = data.priority;
  if (data.status !== undefined) task.status = data.status;
  if (data.dueDate !== undefined) task.dueDate = data.dueDate;
  if (data.order !== undefined) task.order = data.order;
  if (data.listId !== undefined) task.list = data.listId;
  if (data.list !== undefined) task.list = data.list;
  if (data.projectId !== undefined) task.project = data.projectId || null;
  if (data.project !== undefined) task.project = data.project || null;

  await task.save();

  await Activity.create({
    user: actorUser._id,
    workspace: workspaceId,
    action: `Updated task "${task.title}"`,
    type: 'task',
    entityType: 'task',
    entityId: task._id,
    entityName: task.title
  }).catch(() => {});

  const updated = await Task.findById(task._id)
    .populate('assignee', 'name email avatar')
    .populate('project', 'name key')
    .populate('board', 'name')
    .populate('list', 'name');

  return {
    id: updated._id.toString(),
    title: updated.title,
    description: updated.description,
    status: updated.status,
    priority: updated.priority,
    dueDate: updated.dueDate,
    order: updated.order,
    assignee: updated.assignee,
    project: updated.project,
    board: updated.board,
    list: updated.list,
    updatedAt: updated.updatedAt
  };
};

export const deleteTask = async (workspaceId, taskId, actorUser) => {
  if (!workspaceId) throw new ApiError(400, 'Workspace ID is required');
  if (!taskId) throw new ApiError(400, 'Task ID is required');

  const task = await Task.findOne({
    _id: taskId,
    workspace: workspaceId
  });
  if (!task) throw new ApiError(404, 'Task not found');

  const taskTitle = task.title;
  const boardId = task.board;

  await Task.findByIdAndDelete(task._id);

  if (boardId) {
    await Board.findByIdAndUpdate(boardId, { $inc: { tasksCount: -1 } });
  }

  await Activity.create({
    user: actorUser._id,
    workspace: workspaceId,
    action: `Deleted task "${taskTitle}"`,
    type: 'task',
    entityType: 'task',
    entityId: task._id,
    entityName: taskTitle
  }).catch(() => {});

  return {
    success: true,
    deletedId: taskId,
    message: `Task "${taskTitle}" deleted successfully`
  };
};

export const updateTaskStatus = async (workspaceId, taskId, status, actorUser) => {
  if (!workspaceId) throw new ApiError(400, 'Workspace ID is required');
  if (!taskId) throw new ApiError(400, 'Task ID is required');
  if (!status) throw new ApiError(400, 'Status is required');

  const validStatuses = ['todo', 'in_progress', 'review', 'done'];
  const normalized = status.toLowerCase();
  if (!validStatuses.includes(normalized)) {
    throw new ApiError(400, `Invalid status. Must be one of: [${validStatuses.join(', ')}]`);
  }

  const task = await Task.findOne({
    _id: taskId,
    workspace: workspaceId
  });
  if (!task) throw new ApiError(404, 'Task not found');

  const oldStatus = task.status;
  task.status = normalized;
  await task.save();

  await Activity.create({
    user: actorUser._id,
    workspace: workspaceId,
    action: `Changed status of "${task.title}" to ${normalized}`,
    type: 'task',
    entityType: 'task',
    entityId: task._id,
    entityName: task.title,
    details: `Status transitioned from ${oldStatus} to ${normalized}`
  }).catch(() => {});

  return {
    id: task._id.toString(),
    status: task.status,
    previousStatus: oldStatus
  };
};

export const updateTaskPriority = async (workspaceId, taskId, priority, actorUser) => {
  if (!workspaceId) throw new ApiError(400, 'Workspace ID is required');
  if (!taskId) throw new ApiError(400, 'Task ID is required');
  if (!priority) throw new ApiError(400, 'Priority is required');

  const validPriorities = ['low', 'medium', 'high', 'urgent'];
  const normalized = priority.toLowerCase();
  if (!validPriorities.includes(normalized)) {
    throw new ApiError(400, `Invalid priority. Must be one of: [${validPriorities.join(', ')}]`);
  }

  const task = await Task.findOne({
    _id: taskId,
    workspace: workspaceId
  });
  if (!task) throw new ApiError(404, 'Task not found');

  const oldPriority = task.priority;
  task.priority = normalized;
  await task.save();

  await Activity.create({
    user: actorUser._id,
    workspace: workspaceId,
    action: `Changed priority of "${task.title}" to ${normalized}`,
    type: 'task',
    entityType: 'task',
    entityId: task._id,
    entityName: task.title
  }).catch(() => {});

  return {
    id: task._id.toString(),
    priority: task.priority,
    previousPriority: oldPriority
  };
};

export const updateTaskDueDate = async (workspaceId, taskId, dueDate, actorUser) => {
  if (!workspaceId) throw new ApiError(400, 'Workspace ID is required');
  if (!taskId) throw new ApiError(400, 'Task ID is required');

  const task = await Task.findOne({
    _id: taskId,
    workspace: workspaceId
  });
  if (!task) throw new ApiError(404, 'Task not found');

  task.dueDate = dueDate ? new Date(dueDate) : null;
  await task.save();

  await Activity.create({
    user: actorUser._id,
    workspace: workspaceId,
    action: `Updated due date of "${task.title}"`,
    type: 'task',
    entityType: 'task',
    entityId: task._id,
    entityName: task.title
  }).catch(() => {});

  return {
    id: task._id.toString(),
    dueDate: task.dueDate
  };
};

export const moveTask = async (workspaceId, taskId, data, actorUser) => {
  if (!workspaceId) throw new ApiError(400, 'Workspace ID is required');
  if (!taskId) throw new ApiError(400, 'Task ID is required');

  const task = await Task.findOne({
    _id: taskId,
    workspace: workspaceId
  });
  if (!task) throw new ApiError(404, 'Task not found');

  if (data.listId) {
    const list = await List.findById(data.listId);
    if (list) {
      task.list = list._id;
      // Auto-align status if list name maps to a known status
      const lname = list.name.toLowerCase();
      if (lname.includes('todo') || lname.includes('to do')) task.status = 'todo';
      else if (lname.includes('progress')) task.status = 'in_progress';
      else if (lname.includes('review')) task.status = 'review';
      else if (lname.includes('done') || lname.includes('complete')) task.status = 'done';
    }
  }

  if (data.boardId) {
    task.board = data.boardId;
  }
  if (data.status) {
    task.status = data.status.toLowerCase();
  }
  if (data.order !== undefined) {
    task.order = data.order;
  }

  await task.save();

  await Activity.create({
    user: actorUser._id,
    workspace: workspaceId,
    action: `Moved task "${task.title}" to list/status "${task.status}"`,
    type: 'task',
    entityType: 'task',
    entityId: task._id,
    entityName: task.title
  }).catch(() => {});

  const updated = await Task.findById(task._id)
    .populate('assignee', 'name email avatar')
    .populate('list', 'name')
    .populate('board', 'name');

  return {
    id: updated._id.toString(),
    title: updated.title,
    status: updated.status,
    order: updated.order,
    list: updated.list,
    board: updated.board
  };
};

export const getOverdueTasks = async (workspaceId) => {
  if (!workspaceId) throw new ApiError(400, 'Workspace ID is required');
  const wsId = new mongoose.Types.ObjectId(workspaceId);
  const now = new Date();

  const tasks = await Task.find({
    workspace: wsId,
    dueDate: { $lt: now },
    status: { $ne: 'done' }
  })
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
    assignee: t.assignee,
    project: t.project,
    board: t.board,
    list: t.list
  }));
};

export const getUnassignedTasks = async (workspaceId) => {
  if (!workspaceId) throw new ApiError(400, 'Workspace ID is required');
  const wsId = new mongoose.Types.ObjectId(workspaceId);

  const tasks = await Task.find({
    workspace: wsId,
    $or: [{ assignee: null }, { assignee: { $exists: false } }]
  })
    .populate('project', 'name key')
    .populate('board', 'name')
    .populate('list', 'name')
    .sort({ createdAt: -1 });

  return tasks.map(t => ({
    id: t._id.toString(),
    title: t.title,
    description: t.description,
    status: t.status,
    priority: t.priority,
    dueDate: t.dueDate,
    project: t.project,
    board: t.board,
    list: t.list,
    createdAt: t.createdAt
  }));
};

export const getCompletedTasks = async (workspaceId) => {
  if (!workspaceId) throw new ApiError(400, 'Workspace ID is required');
  const wsId = new mongoose.Types.ObjectId(workspaceId);

  const tasks = await Task.find({
    workspace: wsId,
    status: 'done'
  })
    .populate('assignee', 'name email avatar')
    .populate('project', 'name key')
    .populate('board', 'name')
    .populate('list', 'name')
    .sort({ updatedAt: -1 });

  return tasks.map(t => ({
    id: t._id.toString(),
    title: t.title,
    description: t.description,
    status: t.status,
    priority: t.priority,
    dueDate: t.dueDate,
    assignee: t.assignee,
    project: t.project,
    board: t.board,
    list: t.list,
    updatedAt: t.updatedAt
  }));
};

export const getTaskActivities = async (workspaceId, taskId) => {
  if (!workspaceId) throw new ApiError(400, 'Workspace ID is required');
  if (!taskId) throw new ApiError(400, 'Task ID is required');

  const activities = await Activity.find({
    workspace: workspaceId,
    $or: [{ entityId: taskId }, { 'metadata.taskId': taskId }]
  })
    .populate('user', 'name email avatar role')
    .sort({ createdAt: -1 })
    .limit(30);

  return activities.map(a => ({
    id: a._id.toString(),
    action: a.action,
    type: a.type,
    description: a.description,
    user: a.user
      ? {
          id: a.user._id.toString(),
          name: a.user.name,
          email: a.user.email,
          avatar: a.user.avatar
        }
      : null,
    createdAt: a.createdAt
  }));
};
