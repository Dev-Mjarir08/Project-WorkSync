import mongoose from 'mongoose';
import { Board } from '../../../models/Board.js';
import { Task } from '../../../models/Task.js';
import { User } from '../../../models/User.js';
import { Activity } from '../../../models/Activity.js';
import { ApiError } from '../../../utils/ApiError.js';

export const getBoards = async (workspaceId, query = {}) => {
  if (!workspaceId) throw new ApiError(400, 'Workspace ID is required');
  const wsId = new mongoose.Types.ObjectId(workspaceId);

  const filter = { workspace: wsId };
  if (query.isArchived !== undefined) {
    filter.isArchived = query.isArchived === 'true' || query.isArchived === true;
  }
  if (query.search) {
    filter.name = { $regex: query.search, $options: 'i' };
  }

  const boards = await Board.find(filter)
    .populate('createdBy', 'name email avatar')
    .sort({ createdAt: -1 });

  return boards.map(b => ({
    id: b._id.toString(),
    name: b.name,
    description: b.description,
    isArchived: b.isArchived,
    tasksCount: b.tasksCount || 0,
    membersCount: b.members?.length || 0,
    createdBy: b.createdBy?.name || 'Admin',
    createdAt: b.createdAt
  }));
};

export const createBoard = async (workspaceId, data, actorUser) => {
  if (!workspaceId) throw new ApiError(400, 'Workspace ID is required');
  if (!data.name || !data.name.trim()) throw new ApiError(400, 'Board name is required');

  const board = await Board.create({
    workspace: workspaceId,
    name: data.name.trim(),
    description: data.description || '',
    createdBy: actorUser._id,
    isArchived: false,
    tasksCount: 0,
    members: [
      {
        user: actorUser._id,
        role: 'admin',
        addedAt: new Date()
      }
    ]
  });

  await Activity.create({
    workspace: workspaceId,
    user: actorUser._id,
    action: 'BOARD_CREATED',
    entityType: 'board',
    entityName: board.name,
    details: `Created board: ${board.name}`
  }).catch(() => {});

  return {
    id: board._id.toString(),
    name: board.name,
    description: board.description,
    isArchived: board.isArchived,
    createdAt: board.createdAt
  };
};

export const getBoardById = async (workspaceId, boardId) => {
  const board = await Board.findOne({ _id: boardId, workspace: workspaceId })
    .populate('createdBy', 'name email avatar')
    .populate('members.user', 'name email avatar');

  if (!board) throw new ApiError(404, 'Board not found');

  const tasksCount = await Task.countDocuments({ board: board._id });

  return {
    id: board._id.toString(),
    name: board.name,
    description: board.description,
    isArchived: board.isArchived,
    tasksCount,
    createdBy: board.createdBy,
    members: (board.members || []).map(m => ({
      id: m._id?.toString(),
      userId: m.user?._id?.toString(),
      name: m.user?.name,
      email: m.user?.email,
      avatar: m.user?.avatar,
      role: m.role,
      addedAt: m.addedAt
    })),
    createdAt: board.createdAt
  };
};

export const updateBoard = async (workspaceId, boardId, data, actorUser) => {
  const board = await Board.findOne({ _id: boardId, workspace: workspaceId });
  if (!board) throw new ApiError(404, 'Board not found');

  if (data.name !== undefined) board.name = data.name.trim();
  if (data.description !== undefined) board.description = data.description.trim();

  await board.save();

  await Activity.create({
    workspace: workspaceId,
    user: actorUser._id,
    action: 'BOARD_UPDATED',
    entityType: 'board',
    entityName: board.name,
    details: `Updated board: ${board.name}`
  }).catch(() => {});

  return board;
};

export const deleteBoard = async (workspaceId, boardId, actorUser) => {
  const board = await Board.findOneAndDelete({ _id: boardId, workspace: workspaceId });
  if (!board) throw new ApiError(404, 'Board not found');

  // Cascade delete tasks in this board
  await Task.deleteMany({ board: board._id });

  await Activity.create({
    workspace: workspaceId,
    user: actorUser._id,
    action: 'BOARD_DELETED',
    entityType: 'board',
    entityName: board.name,
    details: `Deleted board: ${board.name}`
  }).catch(() => {});

  return {
    id: boardId,
    name: board.name,
    deleted: true
  };
};

export const updateBoardStatus = async (workspaceId, boardId, isArchived, actorUser) => {
  const board = await Board.findOne({ _id: boardId, workspace: workspaceId });
  if (!board) throw new ApiError(404, 'Board not found');

  board.isArchived = isArchived;
  await board.save();

  await Activity.create({
    workspace: workspaceId,
    user: actorUser._id,
    action: isArchived ? 'BOARD_ARCHIVED' : 'BOARD_RESTORED',
    entityType: 'board',
    entityName: board.name,
    details: `${isArchived ? 'Archived' : 'Restored'} board: ${board.name}`
  }).catch(() => {});

  return {
    id: board._id.toString(),
    isArchived: board.isArchived
  };
};

export const getBoardMembers = async (workspaceId, boardId) => {
  const board = await Board.findOne({ _id: boardId, workspace: workspaceId })
    .populate('members.user', 'name email avatar role');

  if (!board) throw new ApiError(404, 'Board not found');

  return (board.members || []).map(m => ({
    id: m._id?.toString(),
    userId: m.user?._id?.toString(),
    name: m.user?.name,
    email: m.user?.email,
    avatar: m.user?.avatar,
    role: m.role,
    addedAt: m.addedAt
  }));
};

export const addBoardMember = async (workspaceId, boardId, { userId, role = 'editor' }, actorUser) => {
  const board = await Board.findOne({ _id: boardId, workspace: workspaceId });
  if (!board) throw new ApiError(404, 'Board not found');

  const user = await User.findById(userId);
  if (!user) throw new ApiError(404, 'User not found');

  const alreadyMember = board.members.some(m => m.user?.toString() === userId.toString());
  if (alreadyMember) throw new ApiError(409, 'User is already a member of this board');

  board.members.push({
    user: user._id,
    role: role.toLowerCase(),
    addedAt: new Date()
  });

  await board.save();

  return {
    userId: user._id.toString(),
    name: user.name,
    role,
    added: true
  };
};

export const removeBoardMember = async (workspaceId, boardId, memberIdentifier, actorUser) => {
  const board = await Board.findOne({ _id: boardId, workspace: workspaceId });
  if (!board) throw new ApiError(404, 'Board not found');

  board.members = board.members.filter(m => {
    return (
      m._id?.toString() !== memberIdentifier.toString() &&
      m.user?.toString() !== memberIdentifier.toString()
    );
  });

  await board.save();

  return {
    removed: true,
    boardId
  };
};

export const getBoardActivities = async (workspaceId, boardId, query = {}) => {
  const board = await Board.findOne({ _id: boardId, workspace: workspaceId });
  if (!board) throw new ApiError(404, 'Board not found');

  const activities = await Activity.find({
    workspace: workspaceId,
    $or: [
      { entityType: 'board', entityName: board.name },
      { 'metadata.boardId': board._id }
    ]
  })
    .populate('user', 'name email avatar')
    .sort({ createdAt: -1 })
    .limit(query.limit ? parseInt(query.limit, 10) : 20);

  return activities;
};
