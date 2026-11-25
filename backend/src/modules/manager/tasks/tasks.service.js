import mongoose from 'mongoose';
import { Task } from '../../../models/Task.js';
import { Board } from '../../../models/Board.js';
import { List } from '../../../models/List.js';
import { Project } from '../../../models/Project.js';
import { User } from '../../../models/User.js';
import { Workspace } from '../../../models/Workspace.js';
import { WorkspaceMember } from '../../../models/WorkspaceMember.js';
import { Activity } from '../../../models/Activity.js';
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
  if (mongoose.Types.ObjectId.isValid(rawAssignee)) {
    const user = await User.findById(rawAssignee).select('_id');
    if (user) return user._id;

    const member = await WorkspaceMember.findById(rawAssignee).select('user');
    if (member?.user) return member.user;
  }
  if (typeof rawAssignee === 'string' && rawAssignee.trim()) {
    const user = await User.findOne({
      $or: [
        { email: rawAssignee.trim() },
        { name: rawAssignee.trim() },
        { name: { $regex: new RegExp(`^${rawAssignee.trim()}$`, 'i') } }
      ]
    }).select('_id');
    if (user) return user._id;
  }
  return null;
};

export const getTasks = async (workspaceId, query = {}, user) => {
  let activeWsId = null;
  if (workspaceId && mongoose.Types.ObjectId.isValid(workspaceId)) {
    const exists = await Workspace.findOne({ _id: workspaceId, isActive: true }).select('_id');
    if (exists) activeWsId = exists._id;
  }
  if (!activeWsId && user?._id) {
    const member = await WorkspaceMember.findOne({ user: user._id, status: 'active' }).select('workspace');
    if (member?.workspace) activeWsId = member.workspace;
    else {
      const defaultWs = await Workspace.findOne({ isActive: true }).select('_id');
      if (defaultWs) activeWsId = defaultWs._id;
    }
  }

  const userObjectId = user?._id && mongoose.Types.ObjectId.isValid(user._id)
    ? new mongoose.Types.ObjectId(user._id)
    : null;

  const filter = {};
  const orConditions = [];

  if (activeWsId) {
    orConditions.push({ workspace: activeWsId });
  }
  if (userObjectId) {
    orConditions.push({ assignee: userObjectId });
  }

  if (orConditions.length > 0) {
    filter.$or = orConditions;
  }

  if (query.status && query.status !== 'all') {
    let s = query.status.toLowerCase().trim().replace(/[\s-]+/g, '_');
    if (s === 'completed') s = 'done';
    if (s === 'pending') s = 'todo';
    if (s === 'inprogress') s = 'in_progress';
    if (s === 'inreview') s = 'review';
    filter.status = s;
  }
  if (query.priority && query.priority !== 'all') {
    filter.priority = query.priority.toLowerCase();
  }
  if (query.boardId && mongoose.Types.ObjectId.isValid(query.boardId)) {
    filter.board = new mongoose.Types.ObjectId(query.boardId);
  }
  if (query.projectId && mongoose.Types.ObjectId.isValid(query.projectId)) {
    filter.project = new mongoose.Types.ObjectId(query.projectId);
  }
  if (query.assigneeId) {
    const resolved = await resolveAssigneeUserId(query.assigneeId);
    if (resolved) {
      filter.assignee = resolved;
    } else if (mongoose.Types.ObjectId.isValid(query.assigneeId)) {
      filter.assignee = new mongoose.Types.ObjectId(query.assigneeId);
    }
  }
  if (query.onlyMine === 'true' && userObjectId) {
    filter.assignee = userObjectId;
    delete filter.$or;
  }
  if (query.search && query.search.trim()) {
    const searchRegex = { $regex: query.search.trim(), $options: 'i' };
    const searchOr = [
      { title: searchRegex },
      { description: searchRegex }
    ];
    if (filter.$or) {
      filter.$and = [{ $or: filter.$or }, { $or: searchOr }];
      delete filter.$or;
    } else {
      filter.$or = searchOr;
    }
  }

  let tasks = await Task.find(filter)
    .populate('assignee', 'name email avatar')
    .populate('project', 'name key status')
    .populate('board', 'name')
    .populate('list', 'name position')
    .sort({ order: 1, createdAt: -1 });

  if (tasks.length === 0 && !query.search && !query.status) {
    if (userObjectId) {
      tasks = await Task.find({ assignee: userObjectId })
        .populate('assignee', 'name email avatar')
        .populate('project', 'name key status')
        .populate('board', 'name')
        .populate('list', 'name position')
        .sort({ order: 1, createdAt: -1 });
    }
    if (tasks.length === 0) {
      tasks = await Task.find({})
        .populate('assignee', 'name email avatar')
        .populate('project', 'name key status')
        .populate('board', 'name')
        .populate('list', 'name position')
        .sort({ order: 1, createdAt: -1 })
        .limit(60);
    }
  }

  return tasks.map(t => ({
    id: t._id.toString(),
    _id: t._id.toString(),
    title: t.title,
    description: t.description,
    status: t.status,
    priority: t.priority,
    dueDate: t.dueDate,
    order: t.order,
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
    createdAt: t.createdAt,
    updatedAt: t.updatedAt
  }));
};

export const createTask = async (workspaceId, data, actorUser) => {
  if (!workspaceId) {
    const { Workspace } = await import('../../../models/Workspace.js');
    const defaultWs = await Workspace.findOne({ isActive: true }).select('_id');
    workspaceId = defaultWs?._id;
  }
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

  const cleanAssignee = await resolveAssigneeUserId(data.assigneeId || data.assignee);

  const task = await Task.create({
    workspace: workspaceId,
    title: cleanTitle,
    description: data.description || '',
    board: boardId,
    list: listId,
    project: projectId || null,
    assignee: cleanAssignee || null,
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

  if (cleanAssignee) {
    await createNotification({
      recipient: cleanAssignee,
      workspace: workspaceId,
      sender: actorUser?._id,
      title: 'New Task Assigned',
      message: `You have been assigned task "${cleanTitle}"`,
      type: 'task',
      metadata: { taskId: task._id.toString() }
    }).catch(() => {});
  }

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
  if (!taskId) throw new ApiError(400, 'Task ID is required');

  let task = null;
  if (mongoose.Types.ObjectId.isValid(taskId)) {
    task = await Task.findOne({
      _id: taskId,
      ...(workspaceId && mongoose.Types.ObjectId.isValid(workspaceId) ? { workspace: workspaceId } : {})
    })
      .populate('assignee', 'name email avatar')
      .populate('project', 'name key status')
      .populate('board', 'name')
      .populate('list', 'name position');

    if (!task) {
      task = await Task.findById(taskId)
        .populate('assignee', 'name email avatar')
        .populate('project', 'name key status')
        .populate('board', 'name')
        .populate('list', 'name position');
    }
  } else {
    task = await Task.findOne({ $or: [{ _id: taskId }, { id: taskId }] })
      .populate('assignee', 'name email avatar')
      .populate('project', 'name key status')
      .populate('board', 'name')
      .populate('list', 'name position')
      .catch(() => null);
  }

  if (!task) throw new ApiError(404, 'Task not found');

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
  if (!taskId) throw new ApiError(400, 'Task ID is required');

  let task = null;
  if (mongoose.Types.ObjectId.isValid(taskId)) {
    task = await Task.findOne({
      _id: taskId,
      ...(workspaceId && mongoose.Types.ObjectId.isValid(workspaceId) ? { workspace: workspaceId } : {})
    });
    if (!task) {
      task = await Task.findById(taskId);
    }
  } else {
    task = await Task.findOne({ $or: [{ _id: taskId }, { id: taskId }] }).catch(() => null);
  }
  if (!task) throw new ApiError(404, 'Task not found');

  const previousAssignee = task.assignee?.toString();
  if (data.title !== undefined) task.title = data.title.trim();
  if (data.description !== undefined) task.description = data.description;
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
  if (data.priority !== undefined) task.priority = data.priority;
  if (data.status !== undefined) task.status = data.status;
  if (data.dueDate !== undefined) task.dueDate = data.dueDate;
  if (data.order !== undefined) task.order = data.order;
  if (data.listId !== undefined) task.list = data.listId;
  if (data.list !== undefined) task.list = data.list;
  if (data.projectId !== undefined) task.project = data.projectId || null;
  if (data.project !== undefined) task.project = data.project || null;

  await task.save();

  if (task.assignee && task.assignee.toString() !== previousAssignee) {
    await createNotification({
      recipient: task.assignee,
      workspace: workspaceId || task.workspace,
      sender: actorUser?._id,
      title: 'Task Assigned',
      message: `You were assigned to task "${task.title}"`,
      type: 'task',
      metadata: { taskId: task._id.toString() }
    }).catch(() => {});
  }

  await Activity.create({
    user: actorUser?._id,
    workspace: workspaceId || task.workspace,
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
  if (!taskId) throw new ApiError(400, 'Task ID is required');

  let task = null;
  if (mongoose.Types.ObjectId.isValid(taskId)) {
    task = await Task.findOneAndDelete({
      _id: taskId,
      ...(workspaceId && mongoose.Types.ObjectId.isValid(workspaceId) ? { workspace: workspaceId } : {})
    });
    if (!task) {
      task = await Task.findByIdAndDelete(taskId);
    }
  } else {
    task = await Task.findOneAndDelete({ $or: [{ _id: taskId }, { id: taskId }] }).catch(() => null);
  }

  if (task) {
    if (task.board) {
      await Board.findByIdAndUpdate(task.board, { $inc: { tasksCount: -1 } }).catch(() => {});
    }

    await Activity.create({
      user: actorUser?._id,
      workspace: workspaceId || task.workspace,
      action: `Deleted task "${task.title}"`,
      type: 'task',
      entityType: 'task',
      entityId: task._id,
      entityName: task.title
    }).catch(() => {});
  }

  return {
    success: true,
    deletedId: taskId,
    id: taskId,
    message: `Task "${task?.title || 'Task'}" deleted successfully`
  };
};

export const updateTaskStatus = async (workspaceId, taskId, status, actorUser) => {
  if (!taskId) throw new ApiError(400, 'Task ID is required');
  if (!status) throw new ApiError(400, 'Status is required');

  let normalized = String(status).toLowerCase().trim().replace(/[\s-]+/g, '_');
  if (normalized === 'completed' || normalized === 'done') normalized = 'done';
  else if (normalized === 'in_progress' || normalized === 'inprogress') normalized = 'in_progress';
  else if (normalized === 'review' || normalized === 'in_review' || normalized === 'inreview') normalized = 'review';
  else if (normalized === 'todo' || normalized === 'pending') normalized = 'todo';
  else normalized = 'todo';

  let task = null;
  if (workspaceId && mongoose.Types.ObjectId.isValid(workspaceId)) {
    task = await Task.findOne({
      _id: taskId,
      workspace: new mongoose.Types.ObjectId(workspaceId)
    });
  }
  if (!task && mongoose.Types.ObjectId.isValid(taskId)) {
    task = await Task.findById(taskId);
  }
  if (!task) {
    task = await Task.findOne({ $or: [{ _id: taskId }, { id: taskId }] }).catch(() => null);
  }
  if (!task) throw new ApiError(404, 'Task not found');

  const oldStatus = task.status;
  task.status = normalized;
  await task.save();

  await Activity.create({
    user: actorUser?._id,
    workspace: workspaceId || task.workspace,
    action: `Changed status of "${task.title}" to ${normalized}`,
    type: 'task',
    entityType: 'task',
    entityId: task._id,
    entityName: task.title,
    details: `Status transitioned from ${oldStatus} to ${normalized}`
  }).catch(() => {});

  return {
    id: task._id.toString(),
    _id: task._id.toString(),
    status: task.status,
    previousStatus: oldStatus
  };
};

export const updateTaskPriority = async (workspaceId, taskId, priority, actorUser) => {
  if (!taskId) throw new ApiError(400, 'Task ID is required');
  if (!priority) throw new ApiError(400, 'Priority is required');

  const validPriorities = ['low', 'medium', 'high', 'urgent'];
  const normalized = priority.toLowerCase();
  if (!validPriorities.includes(normalized)) {
    throw new ApiError(400, `Invalid priority. Must be one of: [${validPriorities.join(', ')}]`);
  }

  let task = null;
  if (workspaceId && mongoose.Types.ObjectId.isValid(workspaceId)) {
    task = await Task.findOne({
      _id: taskId,
      workspace: workspaceId
    });
  }
  if (!task && mongoose.Types.ObjectId.isValid(taskId)) {
    task = await Task.findById(taskId);
  }
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
  if (!taskId) throw new ApiError(400, 'Task ID is required');

  let task = null;
  if (workspaceId && mongoose.Types.ObjectId.isValid(workspaceId)) {
    task = await Task.findOne({
      _id: taskId,
      workspace: workspaceId
    });
  }
  if (!task && mongoose.Types.ObjectId.isValid(taskId)) {
    task = await Task.findById(taskId);
  }
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
  if (!taskId) throw new ApiError(400, 'Task ID is required');

  let task = null;
  if (workspaceId && mongoose.Types.ObjectId.isValid(workspaceId)) {
    task = await Task.findOne({
      _id: taskId,
      workspace: new mongoose.Types.ObjectId(workspaceId)
    });
  }
  if (!task && mongoose.Types.ObjectId.isValid(taskId)) {
    task = await Task.findById(taskId);
  }
  if (!task) {
    task = await Task.findOne({ $or: [{ _id: taskId }, { id: taskId }] }).catch(() => null);
  }
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

  if (data.boardId && mongoose.Types.ObjectId.isValid(data.boardId)) {
    task.board = data.boardId;
  }
  if (data.status) {
    let normalized = String(data.status).toLowerCase().trim().replace(/[\s-]+/g, '_');
    if (normalized === 'completed' || normalized === 'done') normalized = 'done';
    else if (normalized === 'in_progress' || normalized === 'inprogress') normalized = 'in_progress';
    else if (normalized === 'review' || normalized === 'in_review') normalized = 'review';
    else if (normalized === 'todo' || normalized === 'pending') normalized = 'todo';
    task.status = normalized;
  }
  if (data.order !== undefined) {
    task.order = data.order;
  }

  await task.save();

  await Activity.create({
    user: actorUser?._id,
    workspace: workspaceId || task.workspace,
    action: `Moved task "${task.title}" to status ${task.status}`,
    type: 'task',
    entityType: 'task',
    entityId: task._id,
    entityName: task.title
  }).catch(() => {});

  return {
    id: task._id.toString(),
    _id: task._id.toString(),
    status: task.status,
    order: task.order
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

export const assignTask = async (workspaceId, taskId, data, actorUser) => {
  const { assignTask: doAssign } = await import('../assignments/assignments.service.js');
  return doAssign(workspaceId, taskId, data, actorUser);
};

export const unassignTask = async (workspaceId, taskId, actorUser) => {
  const { unassignTask: doUnassign } = await import('../assignments/assignments.service.js');
  return doUnassign(workspaceId, taskId, actorUser);
};
