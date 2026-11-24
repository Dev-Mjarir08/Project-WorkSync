import mongoose from 'mongoose';
import { Task } from '../../../models/Task.js';
import { User } from '../../../models/User.js';
import { Workspace } from '../../../models/Workspace.js';
import { WorkspaceMember } from '../../../models/WorkspaceMember.js';
import { Activity } from '../../../models/Activity.js';
import { Notification } from '../../../models/Notification.js';
import { ApiError } from '../../../utils/ApiError.js';

const resolveWs = async (workspaceId, taskId = null) => {
  if (workspaceId && mongoose.Types.ObjectId.isValid(workspaceId)) {
    const exists = await Workspace.findOne({ _id: workspaceId, isActive: true }).select('_id');
    if (exists) return exists._id;
  }
  if (taskId && mongoose.Types.ObjectId.isValid(taskId)) {
    const existing = await Task.findById(taskId).select('workspace');
    if (existing?.workspace) return existing.workspace;
  }
  const defaultWs = await Workspace.findOne({ isActive: true }).select('_id');
  return defaultWs?._id || null;
};

const formatAssignment = (t) => ({
  id: t._id.toString(),
  assignmentId: t._id.toString(),
  taskId: t._id.toString(),
  taskTitle: t.title,
  title: t.title,
  description: t.description || '',
  status: t.status,
  priority: t.priority,
  dueDate: t.dueDate,
  order: t.order,
  assignee: t.assignee
    ? {
        id: t.assignee._id.toString(),
        name: t.assignee.name,
        email: t.assignee.email,
        avatar: t.assignee.avatar || ''
      }
    : null,
  project: t.project
    ? {
        id: t.project._id.toString(),
        name: t.project.name,
        key: t.project.key || ''
      }
    : null,
  board: t.board
    ? {
        id: t.board._id.toString(),
        name: t.board.name
      }
    : null,
  list: t.list
    ? {
        id: t.list._id.toString(),
        name: t.list.name
      }
    : null,
  assignedAt: t.updatedAt || t.createdAt,
  createdAt: t.createdAt,
  updatedAt: t.updatedAt
});

export const getAssignments = async (workspaceId, query = {}, user) => {
  const wsId = await resolveWs(workspaceId);
  const filter = wsId ? { workspace: wsId } : {};

  if (query.status && query.status !== 'all') {
    filter.status = query.status.toLowerCase();
  }
  if (query.priority && query.priority !== 'all') {
    filter.priority = query.priority.toLowerCase();
  }
  if (query.memberId || query.assigneeId) {
    filter.assignee = new mongoose.Types.ObjectId(query.memberId || query.assigneeId);
  }
  if (query.assigned === 'true') {
    filter.assignee = { $ne: null };
  } else if (query.assigned === 'false') {
    filter.assignee = null;
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
    .sort({ updatedAt: -1, createdAt: -1 });

  return tasks.map(formatAssignment);
};

export const assignTaskToMember = async (workspaceId, data, actorUser) => {
  const taskId = data.taskId || data.id;
  const targetId = data.memberId || data.assigneeId || data.userId || data.assignee || data.name;

  if (!taskId) throw new ApiError(400, 'Task ID is required for assignment');
  if (!targetId) throw new ApiError(400, 'Member/Assignee ID is required');

  const wsId = await resolveWs(workspaceId, taskId);

  let task = null;
  if (wsId) {
    task = await Task.findOne({ _id: taskId, workspace: wsId });
  }
  if (!task && mongoose.Types.ObjectId.isValid(taskId)) {
    task = await Task.findById(taskId);
  }
  if (!task) throw new ApiError(404, 'Task not found in this workspace');

  let targetUser = null;
  if (mongoose.Types.ObjectId.isValid(targetId)) {
    targetUser = await User.findById(targetId);
    if (!targetUser) {
      const memberDoc = await WorkspaceMember.findById(targetId).populate('user');
      if (memberDoc?.user) targetUser = memberDoc.user;
    }
  }
  if (!targetUser) {
    targetUser = await User.findOne({
      $or: [
        { email: targetId },
        { name: targetId },
        { name: { $regex: new RegExp(`^${targetId}$`, 'i') } }
      ]
    });
  }
  if (!targetUser) throw new ApiError(404, 'Target member not found');

  const prevAssignee = task.assignee;
  task.assignee = targetUser._id;
  const targetWsId = task.workspace || wsId;
  if (targetWsId) {
    task.workspace = targetWsId;
  }
  if (data.priority) task.priority = data.priority.toLowerCase();
  if (data.dueDate) task.dueDate = data.dueDate;
  if (data.status) task.status = data.status.toLowerCase();

  await task.save();

  if (targetWsId) {
    const isMember = await WorkspaceMember.findOne({ workspace: targetWsId, user: targetUser._id });
    if (!isMember) {
      await WorkspaceMember.create({
        workspace: targetWsId,
        user: targetUser._id,
        role: targetUser.role || 'member',
        status: 'active'
      }).catch(() => {});
    }
  }

  Activity.create({
    user: actorUser?._id,
    workspace: targetWsId || wsId,
    action: 'task_assigned',
    type: 'task',
    entityType: 'Task',
    entityId: task._id,
    entityName: task.title,
    description: `${actorUser?.name || 'Manager'} assigned task "${task.title}" to ${targetUser.name}`,
    metadata: {
      taskId: task._id.toString(),
      assigneeId: targetUser._id.toString(),
      prevAssigneeId: prevAssignee ? prevAssignee.toString() : null
    }
  }).catch(() => {});

  if (actorUser && targetUser._id.toString() !== actorUser._id.toString()) {
    Notification.create({
      recipient: targetUser._id,
      sender: actorUser._id,
      workspace: targetWsId || wsId,
      title: 'Task Assigned',
      message: `You were assigned to task "${task.title}" by ${actorUser.name}`,
      type: 'task',
      metadata: { taskId: task._id.toString() }
    }).catch(() => {});
  }

  const populatedTask = await Task.findById(task._id)
    .populate('assignee', 'name email avatar')
    .populate('project', 'name key status')
    .populate('board', 'name')
    .populate('list', 'name position');

  return formatAssignment(populatedTask);
};

export const getAssignmentById = async (workspaceId, assignmentId) => {
  const wsId = await resolveWs(workspaceId, assignmentId);
  const task = await Task.findOne({
    _id: assignmentId,
    ...(wsId ? { workspace: wsId } : {})
  })
    .populate('assignee', 'name email avatar')
    .populate('project', 'name key status')
    .populate('board', 'name')
    .populate('list', 'name position');

  if (!task) throw new ApiError(404, 'Assignment not found');
  return formatAssignment(task);
};

export const updateAssignment = async (workspaceId, assignmentId, data, actorUser) => {
  const wsId = await resolveWs(workspaceId, assignmentId);
  const task = await Task.findOne({
    _id: assignmentId,
    ...(wsId ? { workspace: wsId } : {})
  });
  if (!task) throw new ApiError(404, 'Assignment not found');

  if (data.memberId || data.assigneeId || data.userId || data.assignee) {
    const targetId = data.memberId || data.assigneeId || data.userId || data.assignee;
    let targetUser = await User.findById(targetId);
    if (!targetUser) {
      const memberDoc = await WorkspaceMember.findById(targetId).populate('user');
      if (memberDoc?.user) targetUser = memberDoc.user;
    }
    if (targetUser) {
      task.assignee = targetUser._id;
    }
  }

  if (data.status) task.status = data.status.toLowerCase();
  if (data.priority) task.priority = data.priority.toLowerCase();
  if (data.dueDate !== undefined) task.dueDate = data.dueDate;
  if (data.title) task.title = data.title.trim();
  if (data.description !== undefined) task.description = data.description;

  await task.save();

  await Activity.create({
    user: actorUser?._id,
    workspace: wsId || task.workspace,
    action: 'assignment_updated',
    type: 'task',
    entityType: 'Task',
    entityId: task._id,
    entityName: task.title,
    description: `${actorUser?.name || 'Manager'} updated assignment for task "${task.title}"`
  }).catch(() => {});

  const populatedTask = await Task.findById(task._id)
    .populate('assignee', 'name email avatar')
    .populate('project', 'name key status')
    .populate('board', 'name')
    .populate('list', 'name position');

  return formatAssignment(populatedTask);
};

export const removeAssignment = async (workspaceId, assignmentId, actorUser) => {
  const wsId = await resolveWs(workspaceId, assignmentId);
  const task = await Task.findOne({
    _id: assignmentId,
    ...(wsId ? { workspace: wsId } : {})
  });
  if (!task) throw new ApiError(404, 'Assignment not found');

  task.assignee = null;
  await task.save();

  await Activity.create({
    user: actorUser?._id,
    workspace: wsId || task.workspace,
    action: 'assignment_removed',
    type: 'task',
    entityType: 'Task',
    entityId: task._id,
    entityName: task.title,
    description: `${actorUser?.name || 'Manager'} removed assignment for task "${task.title}"`
  }).catch(() => {});

  return { success: true, message: 'Assignment removed successfully' };
};

export const assignTask = async (workspaceId, taskId, data, actorUser) => {
  return assignTaskToMember(workspaceId, { taskId, ...data }, actorUser);
};

export const unassignTask = async (workspaceId, taskId, actorUser) => {
  return removeAssignment(workspaceId, taskId, actorUser);
};

export const getMemberAssignments = async (workspaceId, memberId) => {
  const wsId = await resolveWs(workspaceId);
  let targetUserId = memberId;

  if (mongoose.Types.ObjectId.isValid(memberId)) {
    const memberDoc = await WorkspaceMember.findById(memberId).populate('user');
    if (memberDoc?.user) {
      targetUserId = memberDoc.user._id;
    }
  }

  const query = { assignee: new mongoose.Types.ObjectId(targetUserId) };
  if (wsId) query.workspace = new mongoose.Types.ObjectId(wsId);

  const tasks = await Task.find(query)
    .populate('assignee', 'name email avatar')
    .populate('project', 'name key status')
    .populate('board', 'name')
    .populate('list', 'name position')
    .sort({ dueDate: 1, createdAt: -1 });

  return tasks.map(formatAssignment);
};
