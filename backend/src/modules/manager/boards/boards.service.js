import mongoose from 'mongoose';
import { Board } from '../../../models/Board.js';
import { List } from '../../../models/List.js';
import { Task } from '../../../models/Task.js';
import { Project } from '../../../models/Project.js';
import { Activity } from '../../../models/Activity.js';
import { ApiError } from '../../../utils/ApiError.js';

export const getBoards = async (workspaceId, query = {}) => {
  if (!workspaceId) throw new ApiError(400, 'Workspace ID is required');
  const wsId = new mongoose.Types.ObjectId(workspaceId);

  const filter = { workspace: wsId };

  if (query.isArchived !== undefined) {
    filter.isArchived = query.isArchived === 'true';
  } else {
    filter.isArchived = false;
  }

  if (query.projectId) {
    filter.project = new mongoose.Types.ObjectId(query.projectId);
  }

  if (query.search) {
    filter.name = { $regex: query.search, $options: 'i' };
  }

  const boards = await Board.find(filter)
    .populate('project', 'name key status')
    .populate('createdBy', 'name email avatar')
    .sort({ createdAt: -1 });

  const boardIds = boards.map(b => b._id);
  const [taskCounts, listCounts] = await Promise.all([
    Task.aggregate([
      { $match: { board: { $in: boardIds } } },
      { $group: { _id: '$board', count: { $sum: 1 } } }
    ]),
    List.aggregate([
      { $match: { board: { $in: boardIds } } },
      { $group: { _id: '$board', count: { $sum: 1 } } }
    ])
  ]);

  const taskMap = {};
  taskCounts.forEach(t => {
    taskMap[t._id.toString()] = t.count;
  });

  const listMap = {};
  listCounts.forEach(l => {
    listMap[l._id.toString()] = l.count;
  });

  return boards.map(b => {
    const bId = b._id.toString();
    return {
      id: bId,
      name: b.name,
      description: b.description,
      isArchived: b.isArchived,
      project: b.project
        ? {
            id: b.project._id.toString(),
            name: b.project.name,
            key: b.project.key,
            status: b.project.status
          }
        : null,
      createdBy: b.createdBy
        ? {
            id: b.createdBy._id.toString(),
            name: b.createdBy.name,
            email: b.createdBy.email,
            avatar: b.createdBy.avatar
          }
        : null,
      membersCount: b.members?.length || 0,
      tasksCount: taskMap[bId] || 0,
      listsCount: listMap[bId] || 0,
      createdAt: b.createdAt,
      updatedAt: b.updatedAt
    };
  });
};

export const createBoard = async (workspaceId, data, actorUser) => {
  if (!workspaceId) throw new ApiError(400, 'Workspace ID is required');
  if (!data.name || !data.name.trim()) throw new ApiError(400, 'Board name is required');

  const cleanName = data.name.trim();

  const board = await Board.create({
    workspace: workspaceId,
    name: cleanName,
    description: data.description || '',
    project: data.projectId || data.project || null,
    createdBy: actorUser._id,
    members: [
      {
        user: actorUser._id,
        role: 'admin',
        addedAt: new Date()
      }
    ]
  });

  // Create standard Kanban columns automatically
  const defaultLists = ['To Do', 'In Progress', 'In Review', 'Done'];
  const listPromises = defaultLists.map((title, idx) =>
    List.create({
      workspace: workspaceId,
      board: board._id,
      name: title,
      position: idx
    })
  );
  const createdLists = await Promise.all(listPromises);

  await Activity.create({
    user: actorUser._id,
    workspace: workspaceId,
    action: `Created board "${cleanName}"`,
    type: 'board',
    entityType: 'board',
    entityId: board._id,
    entityName: cleanName,
    details: `Manager created Kanban board with default lists`
  }).catch(() => {});

  const populated = await Board.findById(board._id)
    .populate('project', 'name key status')
    .populate('createdBy', 'name email avatar');

  return {
    id: populated._id.toString(),
    name: populated.name,
    description: populated.description,
    isArchived: populated.isArchived,
    project: populated.project,
    createdBy: populated.createdBy,
    lists: createdLists.map(l => ({
      id: l._id.toString(),
      name: l.name,
      position: l.position
    })),
    createdAt: populated.createdAt
  };
};

export const getBoardById = async (workspaceId, boardId) => {
  if (!workspaceId) throw new ApiError(400, 'Workspace ID is required');
  if (!boardId) throw new ApiError(400, 'Board ID is required');

  const board = await Board.findOne({
    _id: boardId,
    workspace: workspaceId
  })
    .populate('project', 'name key status')
    .populate('createdBy', 'name email avatar')
    .populate('members.user', 'name email avatar role');

  if (!board) throw new ApiError(404, 'Board not found in this workspace');

  const [lists, tasks] = await Promise.all([
    List.find({ board: board._id, workspace: workspaceId }).sort({ position: 1 }),
    Task.find({ board: board._id, workspace: workspaceId })
      .populate('assignee', 'name email avatar')
      .populate('list', 'name position')
      .sort({ order: 1, createdAt: -1 })
  ]);

  return {
    id: board._id.toString(),
    name: board.name,
    description: board.description,
    isArchived: board.isArchived,
    project: board.project,
    createdBy: board.createdBy,
    members: (board.members || []).map(m => ({
      user: m.user
        ? {
            id: m.user._id.toString(),
            name: m.user.name,
            email: m.user.email,
            avatar: m.user.avatar
          }
        : null,
      role: m.role,
      addedAt: m.addedAt
    })),
    lists: lists.map(l => ({
      id: l._id.toString(),
      name: l.name,
      position: l.position,
      tasksCount: tasks.filter(t => t.list?._id?.toString() === l._id.toString()).length
    })),
    tasks: tasks.map(t => ({
      id: t._id.toString(),
      title: t.title,
      description: t.description,
      status: t.status,
      priority: t.priority,
      dueDate: t.dueDate,
      assignee: t.assignee,
      listId: t.list?._id?.toString() || null,
      order: t.order
    })),
    totalTasks: tasks.length,
    createdAt: board.createdAt,
    updatedAt: board.updatedAt
  };
};

export const updateBoard = async (workspaceId, boardId, data, actorUser) => {
  if (!workspaceId) throw new ApiError(400, 'Workspace ID is required');
  if (!boardId) throw new ApiError(400, 'Board ID is required');

  const board = await Board.findOne({
    _id: boardId,
    workspace: workspaceId
  });
  if (!board) throw new ApiError(404, 'Board not found');

  if (data.name !== undefined) board.name = data.name.trim();
  if (data.description !== undefined) board.description = data.description;
  if (data.projectId !== undefined) board.project = data.projectId || null;
  if (data.project !== undefined) board.project = data.project || null;

  await board.save();

  await Activity.create({
    user: actorUser._id,
    workspace: workspaceId,
    action: `Updated board "${board.name}"`,
    type: 'board',
    entityType: 'board',
    entityId: board._id,
    entityName: board.name
  }).catch(() => {});

  const updated = await Board.findById(board._id)
    .populate('project', 'name key status')
    .populate('createdBy', 'name email avatar');

  return {
    id: updated._id.toString(),
    name: updated.name,
    description: updated.description,
    isArchived: updated.isArchived,
    project: updated.project,
    updatedAt: updated.updatedAt
  };
};

export const deleteBoard = async (workspaceId, boardId, actorUser) => {
  if (!workspaceId) throw new ApiError(400, 'Workspace ID is required');
  if (!boardId) throw new ApiError(400, 'Board ID is required');

  const board = await Board.findOne({
    _id: boardId,
    workspace: workspaceId
  });
  if (!board) throw new ApiError(404, 'Board not found');

  const boardName = board.name;
  await Board.findByIdAndDelete(board._id);

  // Clean up associated lists and unbind tasks
  await Promise.all([
    List.deleteMany({ board: board._id }),
    Task.updateMany({ board: board._id }, { $unset: { board: 1, list: 1 } })
  ]);

  await Activity.create({
    user: actorUser._id,
    workspace: workspaceId,
    action: `Deleted board "${boardName}"`,
    type: 'board',
    entityType: 'board',
    entityId: board._id,
    entityName: boardName
  }).catch(() => {});

  return {
    success: true,
    deletedId: boardId,
    message: `Board "${boardName}" deleted successfully`
  };
};

export const updateBoardStatus = async (workspaceId, boardId, isArchived, actorUser) => {
  if (!workspaceId) throw new ApiError(400, 'Workspace ID is required');
  if (!boardId) throw new ApiError(400, 'Board ID is required');

  const board = await Board.findOne({
    _id: boardId,
    workspace: workspaceId
  });
  if (!board) throw new ApiError(404, 'Board not found');

  board.isArchived = isArchived === true || isArchived === 'true';
  await board.save();

  const actionText = board.isArchived ? 'Archived' : 'Restored';
  await Activity.create({
    user: actorUser._id,
    workspace: workspaceId,
    action: `${actionText} board "${board.name}"`,
    type: 'board',
    entityType: 'board',
    entityId: board._id,
    entityName: board.name
  }).catch(() => {});

  return {
    id: board._id.toString(),
    name: board.name,
    isArchived: board.isArchived,
    message: `Board ${actionText.toLowerCase()} successfully`
  };
};

export const getBoardMembers = async (workspaceId, boardId) => {
  if (!workspaceId) throw new ApiError(400, 'Workspace ID is required');
  if (!boardId) throw new ApiError(400, 'Board ID is required');

  const board = await Board.findOne({
    _id: boardId,
    workspace: workspaceId
  }).populate('members.user', 'name email avatar role');

  if (!board) throw new ApiError(404, 'Board not found');

  return (board.members || []).map(m => ({
    id: m._id?.toString(),
    user: m.user
      ? {
          id: m.user._id.toString(),
          name: m.user.name,
          email: m.user.email,
          avatar: m.user.avatar,
          role: m.user.role
        }
      : null,
    role: m.role,
    addedAt: m.addedAt
  }));
};

export const addBoardMember = async (workspaceId, boardId, data, actorUser) => {
  if (!workspaceId) throw new ApiError(400, 'Workspace ID is required');
  if (!boardId) throw new ApiError(400, 'Board ID is required');
  const userId = data.userId || data.user || data.memberId;
  if (!userId) throw new ApiError(400, 'User ID is required');

  const board = await Board.findOne({
    _id: boardId,
    workspace: workspaceId
  });
  if (!board) throw new ApiError(404, 'Board not found');

  const exists = (board.members || []).some(
    m => m.user?.toString() === userId.toString()
  );
  if (exists) {
    throw new ApiError(400, 'User is already a member of this board');
  }

  board.members.push({
    user: new mongoose.Types.ObjectId(userId),
    role: data.role || 'editor',
    addedAt: new Date()
  });

  await board.save();

  await Activity.create({
    user: actorUser._id,
    workspace: workspaceId,
    action: `Added member to board "${board.name}"`,
    type: 'board',
    entityType: 'board',
    entityId: board._id,
    entityName: board.name
  }).catch(() => {});

  const updated = await Board.findById(board._id).populate(
    'members.user',
    'name email avatar role'
  );

  return (updated.members || []).map(m => ({
    id: m._id?.toString(),
    user: m.user,
    role: m.role,
    addedAt: m.addedAt
  }));
};

export const removeBoardMember = async (workspaceId, boardId, memberId, actorUser) => {
  if (!workspaceId) throw new ApiError(400, 'Workspace ID is required');
  if (!boardId) throw new ApiError(400, 'Board ID is required');
  if (!memberId) throw new ApiError(400, 'Member ID is required');

  const board = await Board.findOne({
    _id: boardId,
    workspace: workspaceId
  });
  if (!board) throw new ApiError(404, 'Board not found');

  board.members = (board.members || []).filter(
    m =>
      m.user?.toString() !== memberId.toString() &&
      m._id?.toString() !== memberId.toString()
  );

  await board.save();

  await Activity.create({
    user: actorUser._id,
    workspace: workspaceId,
    action: `Removed member from board "${board.name}"`,
    type: 'board',
    entityType: 'board',
    entityId: board._id,
    entityName: board.name
  }).catch(() => {});

  return {
    success: true,
    removedMemberId: memberId,
    message: 'Member removed from board'
  };
};

export const getBoardActivities = async (workspaceId, boardId) => {
  if (!workspaceId) throw new ApiError(400, 'Workspace ID is required');
  if (!boardId) throw new ApiError(400, 'Board ID is required');

  const activities = await Activity.find({
    workspace: workspaceId,
    $or: [{ entityId: boardId }, { 'metadata.boardId': boardId }]
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

export const getBoardLists = async (workspaceId, boardId) => {
  if (!workspaceId) throw new ApiError(400, 'Workspace ID is required');
  if (!boardId) throw new ApiError(400, 'Board ID is required');

  const lists = await List.find({
    board: boardId,
    workspace: workspaceId
  }).sort({ position: 1 });

  const listIds = lists.map(l => l._id);
  const taskCounts = await Task.aggregate([
    { $match: { list: { $in: listIds } } },
    { $group: { _id: '$list', count: { $sum: 1 } } }
  ]);

  const countMap = {};
  taskCounts.forEach(t => {
    countMap[t._id.toString()] = t.count;
  });

  return lists.map(l => ({
    id: l._id.toString(),
    name: l.name,
    boardId: l.board.toString(),
    position: l.position,
    tasksCount: countMap[l._id.toString()] || 0,
    createdAt: l.createdAt
  }));
};

export const createBoardList = async (workspaceId, boardId, data, actorUser) => {
  if (!workspaceId) throw new ApiError(400, 'Workspace ID is required');
  if (!boardId) throw new ApiError(400, 'Board ID is required');
  if (!data.name || !data.name.trim()) throw new ApiError(400, 'List name is required');

  const board = await Board.findOne({ _id: boardId, workspace: workspaceId });
  if (!board) throw new ApiError(404, 'Board not found in this workspace');

  let position = data.position;
  if (position === undefined) {
    const lastList = await List.findOne({ board: boardId }).sort({ position: -1 });
    position = lastList ? lastList.position + 1 : 0;
  }

  const list = await List.create({
    workspace: workspaceId,
    board: boardId,
    name: data.name.trim(),
    position
  });

  await Activity.create({
    user: actorUser._id,
    workspace: workspaceId,
    action: `Created list "${list.name}" on board "${board.name}"`,
    type: 'board',
    entityType: 'list',
    entityId: list._id,
    entityName: list.name
  }).catch(() => {});

  return {
    id: list._id.toString(),
    name: list.name,
    boardId: list.board.toString(),
    position: list.position,
    tasksCount: 0,
    createdAt: list.createdAt
  };
};
