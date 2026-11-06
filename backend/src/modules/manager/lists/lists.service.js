import mongoose from 'mongoose';
import { List } from '../../../models/List.js';
import { Board } from '../../../models/Board.js';
import { Task } from '../../../models/Task.js';
import { Activity } from '../../../models/Activity.js';
import { ApiError } from '../../../utils/ApiError.js';

export const getListById = async (workspaceId, listId) => {
  if (!workspaceId) throw new ApiError(400, 'Workspace ID is required');
  if (!listId) throw new ApiError(400, 'List ID is required');

  const list = await List.findOne({
    _id: listId,
    workspace: workspaceId
  }).populate('board', 'name project');

  if (!list) throw new ApiError(404, 'List not found in this workspace');

  const tasksCount = await Task.countDocuments({ list: list._id });

  return {
    id: list._id.toString(),
    name: list.name,
    board: list.board,
    position: list.position,
    tasksCount,
    createdAt: list.createdAt,
    updatedAt: list.updatedAt
  };
};

export const updateList = async (workspaceId, listId, data, actorUser) => {
  if (!workspaceId) throw new ApiError(400, 'Workspace ID is required');
  if (!listId) throw new ApiError(400, 'List ID is required');

  const list = await List.findOne({
    _id: listId,
    workspace: workspaceId
  });
  if (!list) throw new ApiError(404, 'List not found');

  if (data.name !== undefined) list.name = data.name.trim();
  if (data.position !== undefined) list.position = data.position;

  await list.save();

  await Activity.create({
    user: actorUser._id,
    workspace: workspaceId,
    action: `Updated list "${list.name}"`,
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
    updatedAt: list.updatedAt
  };
};

export const deleteList = async (workspaceId, listId, actorUser) => {
  if (!workspaceId) throw new ApiError(400, 'Workspace ID is required');
  if (!listId) throw new ApiError(400, 'List ID is required');

  const list = await List.findOne({
    _id: listId,
    workspace: workspaceId
  });
  if (!list) throw new ApiError(404, 'List not found');

  const listName = list.name;
  await List.findByIdAndDelete(list._id);

  // Unlink tasks from this list
  await Task.updateMany({ list: list._id }, { $unset: { list: 1 } });

  await Activity.create({
    user: actorUser._id,
    workspace: workspaceId,
    action: `Deleted list "${listName}"`,
    type: 'board',
    entityType: 'list',
    entityId: list._id,
    entityName: listName
  }).catch(() => {});

  return {
    success: true,
    deletedId: listId,
    message: `List "${listName}" deleted successfully`
  };
};

export const updateListPosition = async (workspaceId, listId, newPosition, actorUser) => {
  if (!workspaceId) throw new ApiError(400, 'Workspace ID is required');
  if (!listId) throw new ApiError(400, 'List ID is required');
  if (newPosition === undefined || isNaN(newPosition)) {
    throw new ApiError(400, 'Valid numeric position is required');
  }

  const list = await List.findOne({
    _id: listId,
    workspace: workspaceId
  });
  if (!list) throw new ApiError(404, 'List not found');

  const targetPosition = parseInt(newPosition, 10);
  const currentPosition = list.position;

  if (targetPosition !== currentPosition) {
    if (targetPosition > currentPosition) {
      // Moving down: shift lists between current+1 and target down by -1
      await List.updateMany(
        {
          board: list.board,
          workspace: workspaceId,
          position: { $gt: currentPosition, $lte: targetPosition }
        },
        { $inc: { position: -1 } }
      );
    } else {
      // Moving up: shift lists between target and current-1 up by +1
      await List.updateMany(
        {
          board: list.board,
          workspace: workspaceId,
          position: { $gte: targetPosition, $lt: currentPosition }
        },
        { $inc: { position: 1 } }
      );
    }

    list.position = targetPosition;
    await list.save();
  }

  return {
    id: list._id.toString(),
    name: list.name,
    boardId: list.board.toString(),
    position: list.position
  };
};

export const getListTasks = async (workspaceId, listId) => {
  if (!workspaceId) throw new ApiError(400, 'Workspace ID is required');
  if (!listId) throw new ApiError(400, 'List ID is required');

  const tasks = await Task.find({
    list: listId,
    workspace: workspaceId
  })
    .populate('assignee', 'name email avatar')
    .populate('project', 'name key')
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
    createdAt: t.createdAt
  }));
};
