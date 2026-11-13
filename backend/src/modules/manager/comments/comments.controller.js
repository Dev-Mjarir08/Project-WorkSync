import { asyncHandler } from '../../../utils/asyncHandler.js';
import { ApiResponse } from '../../../utils/ApiResponse.js';
import * as commentsService from './comments.service.js';

const getWorkspaceId = (req) => {
  return (
    req.workspace?._id?.toString() ||
    req.params.workspaceId ||
    req.headers['x-workspace-id'] ||
    req.query.workspaceId
  );
};

export const getTaskComments = asyncHandler(async (req, res) => {
  const wsId = getWorkspaceId(req);
  const data = await commentsService.getTaskComments(wsId, req.params.taskId, req.query);
  return res.status(200).json(new ApiResponse(200, data, 'Task comments fetched successfully'));
});

export const addTaskComment = asyncHandler(async (req, res) => {
  const wsId = getWorkspaceId(req);
  const data = await commentsService.addTaskComment(wsId, req.params.taskId, req.user, req.body);
  return res.status(201).json(new ApiResponse(201, { comment: data }, 'Comment added successfully'));
});

export const getCommentById = asyncHandler(async (req, res) => {
  const wsId = getWorkspaceId(req);
  const data = await commentsService.getCommentById(wsId, req.params.commentId);
  return res.status(200).json(new ApiResponse(200, { comment: data }, 'Comment details fetched successfully'));
});

export const updateComment = asyncHandler(async (req, res) => {
  const wsId = getWorkspaceId(req);
  const data = await commentsService.updateComment(wsId, req.params.commentId, req.user, req.body);
  return res.status(200).json(new ApiResponse(200, { comment: data }, 'Comment updated successfully'));
});

export const deleteComment = asyncHandler(async (req, res) => {
  const wsId = getWorkspaceId(req);
  const data = await commentsService.deleteComment(wsId, req.params.commentId, req.user);
  return res.status(200).json(new ApiResponse(200, data, 'Comment deleted successfully'));
});

export const addCommentReply = asyncHandler(async (req, res) => {
  const wsId = getWorkspaceId(req);
  const data = await commentsService.addCommentReply(
    wsId,
    req.params.taskId,
    req.params.commentId,
    req.user,
    req.body
  );
  return res.status(201).json(new ApiResponse(201, { reply: data }, 'Reply posted successfully'));
});

export const getCommentReplies = asyncHandler(async (req, res) => {
  const wsId = getWorkspaceId(req);
  const data = await commentsService.getCommentReplies(wsId, req.params.taskId, req.params.commentId);
  return res.status(200).json(new ApiResponse(200, data, 'Comment replies fetched successfully'));
});
