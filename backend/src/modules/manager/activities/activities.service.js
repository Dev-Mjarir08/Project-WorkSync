import mongoose from 'mongoose';
import { Activity } from '../../../models/Activity.js';
import { WorkspaceMember } from '../../../models/WorkspaceMember.js';
import { Task } from '../../../models/Task.js';
import { ApiError } from '../../../utils/ApiError.js';

export const getActivities = async (workspaceId, query = {}) => {
  if (!workspaceId) throw new ApiError(400, 'Workspace ID is required');

  const page = parseInt(query.page, 10) || 1;
  const limit = parseInt(query.limit, 10) || 20;
  const skip = (page - 1) * limit;

  const filter = {
    workspace: new mongoose.Types.ObjectId(workspaceId)
  };

  if (query.type) {
    filter.type = query.type.toLowerCase();
  }

  if (query.action) {
    filter.action = query.action.toUpperCase();
  }

  if (query.userId && mongoose.Types.ObjectId.isValid(query.userId)) {
    filter.user = new mongoose.Types.ObjectId(query.userId);
  }

  const [activities, total] = await Promise.all([
    Activity.find(filter)
      .populate('user', 'name email avatar role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Activity.countDocuments(filter)
  ]);

  return {
    activities,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit) || 1
    }
  };
};

export const getActivityById = async (workspaceId, activityId) => {
  if (!activityId || !mongoose.Types.ObjectId.isValid(activityId)) {
    throw new ApiError(400, 'Invalid activity ID');
  }

  const activity = await Activity.findOne({
    _id: activityId,
    ...(workspaceId ? { workspace: workspaceId } : {})
  }).populate('user', 'name email avatar role');

  if (!activity) {
    throw new ApiError(404, 'Activity not found');
  }

  return activity;
};

export const getProjectActivities = async (workspaceId, projectId, query = {}) => {
  if (!projectId || !mongoose.Types.ObjectId.isValid(projectId)) {
    throw new ApiError(400, 'Invalid project ID');
  }

  const page = parseInt(query.page, 10) || 1;
  const limit = parseInt(query.limit, 10) || 20;
  const skip = (page - 1) * limit;

  // Find all task IDs belonging to this project to capture task-level activity as well
  const projectTasks = await Task.find({ project: projectId }).select('_id');
  const taskIds = projectTasks.map((t) => t._id);

  const filter = {
    $or: [
      { entityId: new mongoose.Types.ObjectId(projectId) },
      { 'metadata.project': new mongoose.Types.ObjectId(projectId) },
      { 'metadata.projectId': projectId.toString() },
      { entityId: { $in: taskIds } },
      { 'metadata.task': { $in: taskIds } }
    ]
  };

  if (workspaceId) {
    filter.workspace = new mongoose.Types.ObjectId(workspaceId);
  }

  const [activities, total] = await Promise.all([
    Activity.find(filter)
      .populate('user', 'name email avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Activity.countDocuments(filter)
  ]);

  return {
    activities,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit) || 1
    }
  };
};

export const getBoardActivities = async (workspaceId, boardId, query = {}) => {
  if (!boardId || !mongoose.Types.ObjectId.isValid(boardId)) {
    throw new ApiError(400, 'Invalid board ID');
  }

  const page = parseInt(query.page, 10) || 1;
  const limit = parseInt(query.limit, 10) || 20;
  const skip = (page - 1) * limit;

  // Also include tasks belonging to this board
  const boardTasks = await Task.find({ board: boardId }).select('_id');
  const taskIds = boardTasks.map((t) => t._id);

  const filter = {
    $or: [
      { entityId: new mongoose.Types.ObjectId(boardId) },
      { 'metadata.board': new mongoose.Types.ObjectId(boardId) },
      { 'metadata.boardId': boardId.toString() },
      { entityId: { $in: taskIds } },
      { 'metadata.task': { $in: taskIds } }
    ]
  };

  if (workspaceId) {
    filter.workspace = new mongoose.Types.ObjectId(workspaceId);
  }

  const [activities, total] = await Promise.all([
    Activity.find(filter)
      .populate('user', 'name email avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Activity.countDocuments(filter)
  ]);

  return {
    activities,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit) || 1
    }
  };
};

export const getTaskActivities = async (workspaceId, taskId, query = {}) => {
  if (!taskId || !mongoose.Types.ObjectId.isValid(taskId)) {
    throw new ApiError(400, 'Invalid task ID');
  }

  const page = parseInt(query.page, 10) || 1;
  const limit = parseInt(query.limit, 10) || 20;
  const skip = (page - 1) * limit;

  const filter = {
    $or: [
      { entityId: new mongoose.Types.ObjectId(taskId) },
      { 'metadata.task': new mongoose.Types.ObjectId(taskId) },
      { 'metadata.taskId': taskId.toString() }
    ]
  };

  if (workspaceId) {
    filter.workspace = new mongoose.Types.ObjectId(workspaceId);
  }

  const [activities, total] = await Promise.all([
    Activity.find(filter)
      .populate('user', 'name email avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Activity.countDocuments(filter)
  ]);

  return {
    activities,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit) || 1
    }
  };
};

export const getMemberActivities = async (workspaceId, memberId, query = {}) => {
  if (!memberId || !mongoose.Types.ObjectId.isValid(memberId)) {
    throw new ApiError(400, 'Invalid member ID');
  }

  let targetUserId = memberId;

  // Check if memberId is a WorkspaceMember ID
  const membership = await WorkspaceMember.findOne({
    _id: memberId,
    ...(workspaceId ? { workspace: workspaceId } : {})
  });

  if (membership) {
    targetUserId = membership.user;
  }

  const page = parseInt(query.page, 10) || 1;
  const limit = parseInt(query.limit, 10) || 20;
  const skip = (page - 1) * limit;

  const filter = {
    user: new mongoose.Types.ObjectId(targetUserId)
  };

  if (workspaceId) {
    filter.workspace = new mongoose.Types.ObjectId(workspaceId);
  }

  const [activities, total] = await Promise.all([
    Activity.find(filter)
      .populate('user', 'name email avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Activity.countDocuments(filter)
  ]);

  return {
    activities,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit) || 1
    }
  };
};
