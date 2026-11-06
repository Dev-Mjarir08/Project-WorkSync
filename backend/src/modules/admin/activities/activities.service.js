import mongoose from 'mongoose';
import { Activity } from '../../../models/Activity.js';
import { WorkspaceMember } from '../../../models/WorkspaceMember.js';
import { ApiError } from '../../../utils/ApiError.js';

export const getActivities = async (workspaceId, query = {}) => {
  if (!workspaceId) throw new ApiError(400, 'Workspace ID is required');
  const wsId = new mongoose.Types.ObjectId(workspaceId);

  const page = parseInt(query.page, 10) || 1;
  const limit = parseInt(query.limit, 10) || 20;
  const skip = (page - 1) * limit;

  const filter = { workspace: wsId };

  if (query.type) {
    filter.type = query.type.toLowerCase();
  }
  if (query.action) {
    filter.action = { $regex: query.action, $options: 'i' };
  }
  if (query.search) {
    filter.$or = [
      { action: { $regex: query.search, $options: 'i' } },
      { description: { $regex: query.search, $options: 'i' } },
      { details: { $regex: query.search, $options: 'i' } },
      { entityName: { $regex: query.search, $options: 'i' } }
    ];
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
  if (!workspaceId) throw new ApiError(400, 'Workspace ID is required');
  if (!activityId) throw new ApiError(400, 'Activity ID is required');

  const activity = await Activity.findOne({
    _id: activityId,
    workspace: workspaceId
  }).populate('user', 'name email avatar role');

  if (!activity) {
    throw new ApiError(404, 'Activity not found');
  }

  return activity;
};

export const getMemberActivities = async (workspaceId, memberId, query = {}) => {
  if (!workspaceId) throw new ApiError(400, 'Workspace ID is required');
  if (!memberId) throw new ApiError(400, 'Member ID is required');

  const wsId = new mongoose.Types.ObjectId(workspaceId);

  // Check if memberId is a WorkspaceMember or User ID
  let targetUserId = memberId;
  if (mongoose.Types.ObjectId.isValid(memberId)) {
    const wsMember = await WorkspaceMember.findOne({
      _id: memberId,
      workspace: wsId
    });
    if (wsMember && wsMember.user) {
      targetUserId = wsMember.user;
    }
  }

  const page = parseInt(query.page, 10) || 1;
  const limit = parseInt(query.limit, 10) || 20;
  const skip = (page - 1) * limit;

  const filter = {
    workspace: wsId,
    $or: [
      { user: targetUserId },
      { entityId: targetUserId },
      { 'metadata.userId': targetUserId.toString() },
      { 'metadata.memberId': memberId.toString() }
    ]
  };

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

export const getBoardActivities = async (workspaceId, boardId, query = {}) => {
  if (!workspaceId) throw new ApiError(400, 'Workspace ID is required');
  if (!boardId) throw new ApiError(400, 'Board ID is required');

  const wsId = new mongoose.Types.ObjectId(workspaceId);

  const page = parseInt(query.page, 10) || 1;
  const limit = parseInt(query.limit, 10) || 20;
  const skip = (page - 1) * limit;

  const filter = {
    workspace: wsId,
    $or: [
      { entityId: boardId },
      { 'metadata.boardId': boardId.toString() },
      { entityType: 'board' }
    ]
  };

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

export const getTaskActivities = async (workspaceId, taskId, query = {}) => {
  if (!workspaceId) throw new ApiError(400, 'Workspace ID is required');
  if (!taskId) throw new ApiError(400, 'Task ID is required');

  const wsId = new mongoose.Types.ObjectId(workspaceId);

  const page = parseInt(query.page, 10) || 1;
  const limit = parseInt(query.limit, 10) || 20;
  const skip = (page - 1) * limit;

  const filter = {
    workspace: wsId,
    $or: [
      { entityId: taskId },
      { 'metadata.taskId': taskId.toString() },
      { entityType: 'task' }
    ]
  };

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
