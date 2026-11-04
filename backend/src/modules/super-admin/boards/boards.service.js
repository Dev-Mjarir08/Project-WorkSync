import mongoose from 'mongoose';
import { Board } from '../../../models/Board.js';
import { Task } from '../../../models/Task.js';
import { AuditLog } from '../../../models/AuditLog.js';
import { ApiError } from '../../../utils/ApiError.js';

const escapeRegex = (str = '') => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const recordAudit = async ({ action, category = 'workspace', details, actor, target = '', targetId = '', status = 'success' }) => {
  try {
    await AuditLog.create({
      action,
      category,
      details,
      actor: {
        user: actor?._id || actor?.id,
        name: actor?.name || 'Super Admin',
        email: actor?.email || 'admin@worksync.io'
      },
      target,
      targetId: targetId ? targetId.toString() : '',
      status
    });
  } catch (err) {
    console.error('AuditLog error:', err.message);
  }
};

export const getAllBoards = async (query = {}) => {
  const { search = '', workspaceId, isArchived, page = 1, limit = 20 } = query;

  const filter = {};

  if (search.trim()) {
    filter.name = { $regex: escapeRegex(search.trim()), $options: 'i' };
  }

  if (workspaceId && mongoose.Types.ObjectId.isValid(workspaceId)) {
    filter.workspace = workspaceId;
  }

  if (typeof isArchived === 'boolean') {
    filter.isArchived = isArchived;
  }

  const parsedPage = Math.max(1, parseInt(page, 10) || 1);
  const parsedLimit = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
  const skip = (parsedPage - 1) * parsedLimit;

  const [rawBoards, totalCount] = await Promise.all([
    Board.find(filter)
      .populate('workspace', 'name slug plan')
      .populate('createdBy', 'name email avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parsedLimit)
      .lean(),
    Board.countDocuments(filter)
  ]);

  const totalPages = Math.ceil(totalCount / parsedLimit) || 1;

  const boards = rawBoards.map(b => ({
    id: b._id.toString(),
    name: b.name,
    description: b.description || '',
    isArchived: b.isArchived || false,
    workspace: b.workspace ? { id: b.workspace._id.toString(), name: b.workspace.name, slug: b.workspace.slug } : null,
    createdBy: b.createdBy ? { id: b.createdBy._id.toString(), name: b.createdBy.name, email: b.createdBy.email } : null,
    createdAt: b.createdAt
  }));

  return {
    boards,
    totalCount,
    pagination: {
      currentPage: parsedPage,
      totalPages,
      limit: parsedLimit,
      hasNextPage: parsedPage < totalPages,
      hasPrevPage: parsedPage > 1
    }
  };
};

export const getBoardById = async (boardId) => {
  const board = await Board.findById(boardId)
    .populate('workspace', 'name slug plan')
    .populate('createdBy', 'name email avatar');

  if (!board) {
    throw new ApiError(404, `Board not found with ID: ${boardId}`);
  }

  const tasksCount = await Task.countDocuments({ board: board._id });

  return {
    id: board._id.toString(),
    name: board.name,
    description: board.description || '',
    isArchived: board.isArchived || false,
    tasksCount,
    workspace: board.workspace ? { id: board.workspace._id.toString(), name: board.workspace.name, slug: board.workspace.slug } : null,
    createdBy: board.createdBy ? { id: board.createdBy._id.toString(), name: board.createdBy.name, email: board.createdBy.email } : null,
    createdAt: board.createdAt,
    updatedAt: board.updatedAt
  };
};

export const updateBoard = async (boardId, { name, description }, actorAdmin) => {
  const board = await Board.findById(boardId);
  if (!board) {
    throw new ApiError(404, `Board not found with ID: ${boardId}`);
  }

  if (name !== undefined) board.name = name.trim();
  if (description !== undefined) board.description = description.trim();
  await board.save();

  await recordAudit({
    action: 'Board Updated',
    details: `Board "${board.name}" details updated`,
    actor: actorAdmin,
    target: board.name,
    targetId: board._id.toString()
  });

  return {
    id: board._id.toString(),
    name: board.name,
    description: board.description,
    isArchived: board.isArchived,
    updatedAt: board.updatedAt
  };
};

export const updateBoardStatus = async (boardId, isArchived, actorAdmin) => {
  const board = await Board.findById(boardId);
  if (!board) {
    throw new ApiError(404, `Board not found with ID: ${boardId}`);
  }

  board.isArchived = isArchived;
  await board.save();

  await recordAudit({
    action: isArchived ? 'Board Archived' : 'Board Restored',
    details: `Board "${board.name}" was ${isArchived ? 'archived' : 'restored'}`,
    actor: actorAdmin,
    target: board.name,
    targetId: board._id.toString()
  });

  return {
    id: board._id.toString(),
    name: board.name,
    isArchived: board.isArchived
  };
};

export const deleteBoard = async (boardId, actorAdmin) => {
  const board = await Board.findById(boardId);
  if (!board) {
    throw new ApiError(404, `Board not found with ID: ${boardId}`);
  }

  const boardName = board.name;
  await Promise.all([
    Board.findByIdAndDelete(boardId),
    Task.deleteMany({ board: boardId })
  ]);

  await recordAudit({
    action: 'Board Deleted',
    details: `Board "${boardName}" and its tasks were permanently deleted`,
    actor: actorAdmin,
    target: boardName,
    targetId: boardId.toString(),
    status: 'warning'
  });

  return {
    id: boardId,
    name: boardName,
    deleted: true
  };
};

export const getBoardTasks = async (boardId) => {
  const board = await Board.findById(boardId);
  if (!board) {
    throw new ApiError(404, `Board not found with ID: ${boardId}`);
  }

  const tasks = await Task.find({ board: board._id })
    .populate('assignee', 'name email avatar')
    .sort({ createdAt: -1 })
    .lean();

  return {
    boardId: board._id.toString(),
    boardName: board.name,
    totalTasks: tasks.length,
    tasks: tasks.map(t => ({
      id: t._id.toString(),
      title: t.title,
      description: t.description || '',
      status: t.status,
      priority: t.priority,
      dueDate: t.dueDate,
      assignee: t.assignee ? { id: t.assignee._id.toString(), name: t.assignee.name, email: t.assignee.email } : null,
      createdAt: t.createdAt
    }))
  };
};

