import mongoose from 'mongoose';
import { Comment } from '../../../models/Comment.js';
import { Task } from '../../../models/Task.js';
import { Activity } from '../../../models/Activity.js';
import { Notification } from '../../../models/Notification.js';
import { ApiError } from '../../../utils/ApiError.js';

export const getTaskComments = async (workspaceId, taskId, query = {}) => {
  if (!taskId || !mongoose.Types.ObjectId.isValid(taskId)) {
    throw new ApiError(400, 'Invalid task ID');
  }

  const topLevelComments = await Comment.find({
    task: taskId,
    parentComment: null
  })
    .populate('author', 'name email avatar')
    .sort({ createdAt: 1 })
    .lean();

  const commentIds = topLevelComments.map((c) => c._id);

  // Fetch replies for these comments
  const replies = await Comment.find({
    parentComment: { $in: commentIds }
  })
    .populate('author', 'name email avatar')
    .sort({ createdAt: 1 })
    .lean();

  const replyMap = new Map();
  replies.forEach((r) => {
    const pId = r.parentComment.toString();
    if (!replyMap.has(pId)) replyMap.set(pId, []);
    replyMap.get(pId).push({
      ...r,
      id: r._id.toString()
    });
  });

  const formattedComments = topLevelComments.map((c) => ({
    ...c,
    id: c._id.toString(),
    replies: replyMap.get(c._id.toString()) || [],
    replyCount: (replyMap.get(c._id.toString()) || []).length
  }));

  return {
    comments: formattedComments,
    total: formattedComments.length
  };
};

export const addTaskComment = async (workspaceId, taskId, user, body = {}) => {
  if (!taskId || !mongoose.Types.ObjectId.isValid(taskId)) {
    throw new ApiError(400, 'Invalid task ID');
  }

  if (!body.content || !body.content.trim()) {
    throw new ApiError(400, 'Comment content is required');
  }

  const task = await Task.findById(taskId);
  if (!task) {
    throw new ApiError(404, 'Task not found');
  }

  const comment = await Comment.create({
    task: taskId,
    workspace: workspaceId || task.workspace,
    author: user._id,
    content: body.content.trim(),
    parentComment: null
  });

  await comment.populate('author', 'name email avatar');

  // Log activity
  await Activity.create({
    workspace: workspaceId || task.workspace,
    user: user._id,
    action: 'COMMENT_CREATED',
    type: 'task',
    description: `${user.name} commented on task "${task.title}"`,
    details: body.content.trim().substring(0, 100),
    entityType: 'task',
    entityId: task._id,
    entityName: task.title
  }).catch(() => {});

  // Notify assignee if not the author
  if (task.assignee && task.assignee.toString() !== user._id.toString()) {
    await Notification.create({
      recipient: task.assignee,
      workspace: workspaceId || task.workspace,
      sender: user._id,
      title: 'New Comment on Your Task',
      message: `${user.name} commented: "${body.content.trim().substring(0, 80)}"`,
      type: 'task',
      link: `/tasks/${task._id}`
    }).catch(() => {});
  }

  return comment;
};

export const getCommentById = async (workspaceId, commentId) => {
  if (!commentId || !mongoose.Types.ObjectId.isValid(commentId)) {
    throw new ApiError(400, 'Invalid comment ID');
  }

  const comment = await Comment.findById(commentId)
    .populate('author', 'name email avatar')
    .populate('task', 'title project');

  if (!comment) {
    throw new ApiError(404, 'Comment not found');
  }

  const replies = await Comment.find({ parentComment: commentId })
    .populate('author', 'name email avatar')
    .sort({ createdAt: 1 });

  return {
    ...comment.toJSON(),
    replies
  };
};

export const updateComment = async (workspaceId, commentId, user, body = {}) => {
  if (!commentId || !mongoose.Types.ObjectId.isValid(commentId)) {
    throw new ApiError(400, 'Invalid comment ID');
  }

  if (!body.content || !body.content.trim()) {
    throw new ApiError(400, 'Comment content cannot be empty');
  }

  const comment = await Comment.findById(commentId);
  if (!comment) {
    throw new ApiError(404, 'Comment not found');
  }

  // Only author can edit their comment
  if (comment.author.toString() !== user._id.toString()) {
    throw new ApiError(403, 'Forbidden: You can only edit your own comments');
  }

  comment.content = body.content.trim();
  comment.isEdited = true;
  comment.editedAt = new Date();
  await comment.save();

  await comment.populate('author', 'name email avatar');

  return comment;
};

export const deleteComment = async (workspaceId, commentId, user) => {
  if (!commentId || !mongoose.Types.ObjectId.isValid(commentId)) {
    throw new ApiError(400, 'Invalid comment ID');
  }

  const comment = await Comment.findById(commentId);
  if (!comment) {
    throw new ApiError(404, 'Comment not found');
  }

  // Author or Manager can delete comment
  const isAuthor = comment.author.toString() === user._id.toString();
  const isManager = ['manager', 'admin', 'super_admin'].includes(user.role?.toLowerCase());

  if (!isAuthor && !isManager) {
    throw new ApiError(403, 'Forbidden: You do not have permission to delete this comment');
  }

  // Delete comment and any replies
  await Comment.deleteMany({
    $or: [{ _id: commentId }, { parentComment: commentId }]
  });

  return {
    id: commentId,
    deleted: true
  };
};

export const addCommentReply = async (workspaceId, taskId, commentId, user, body = {}) => {
  if (!commentId || !mongoose.Types.ObjectId.isValid(commentId)) {
    throw new ApiError(400, 'Invalid parent comment ID');
  }

  if (!body.content || !body.content.trim()) {
    throw new ApiError(400, 'Reply content is required');
  }

  const parentComment = await Comment.findById(commentId);
  if (!parentComment) {
    throw new ApiError(404, 'Parent comment not found');
  }

  const resolvedTaskId = taskId || parentComment.task;
  const reply = await Comment.create({
    task: resolvedTaskId,
    workspace: workspaceId || parentComment.workspace,
    author: user._id,
    content: body.content.trim(),
    parentComment: commentId
  });

  await reply.populate('author', 'name email avatar');

  // Notify original comment author if different
  if (parentComment.author.toString() !== user._id.toString()) {
    await Notification.create({
      recipient: parentComment.author,
      workspace: workspaceId || parentComment.workspace,
      sender: user._id,
      title: 'Reply to Your Comment',
      message: `${user.name} replied to your comment: "${body.content.trim().substring(0, 80)}"`,
      type: 'task',
      link: `/tasks/${resolvedTaskId}`
    }).catch(() => {});
  }

  return reply;
};

export const getCommentReplies = async (workspaceId, taskId, commentId) => {
  if (!commentId || !mongoose.Types.ObjectId.isValid(commentId)) {
    throw new ApiError(400, 'Invalid parent comment ID');
  }

  const replies = await Comment.find({ parentComment: commentId })
    .populate('author', 'name email avatar')
    .sort({ createdAt: 1 });

  return {
    replies,
    total: replies.length
  };
};
