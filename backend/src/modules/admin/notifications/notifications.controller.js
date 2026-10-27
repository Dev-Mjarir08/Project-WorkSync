import { asyncHandler } from '../../../utils/asyncHandler.js';
import { ApiResponse } from '../../../utils/ApiResponse.js';
import * as notificationsService from './notifications.service.js';

const getWorkspaceId = (req) => {
  return (
    req.workspace?._id?.toString() ||
    req.params.workspaceId ||
    req.headers['x-workspace-id'] ||
    req.query.workspaceId
  );
};

export const getNotifications = asyncHandler(async (req, res) => {
  const wsId = getWorkspaceId(req);
  const data = await notificationsService.getNotifications(wsId, req.user, req.query);
  return res.status(200).json(new ApiResponse(200, data, 'Admin notifications fetched successfully'));
});

export const getUnreadNotifications = asyncHandler(async (req, res) => {
  const wsId = getWorkspaceId(req);
  const data = await notificationsService.getUnreadNotifications(wsId, req.user, req.query);
  return res.status(200).json(new ApiResponse(200, data, 'Unread notifications fetched successfully'));
});

export const markNotificationAsRead = asyncHandler(async (req, res) => {
  const wsId = getWorkspaceId(req);
  const data = await notificationsService.markNotificationAsRead(wsId, req.user, req.params.notificationId);
  return res.status(200).json(new ApiResponse(200, { notification: data }, 'Notification marked as read'));
});

export const markAllAsRead = asyncHandler(async (req, res) => {
  const wsId = getWorkspaceId(req);
  const data = await notificationsService.markAllAsRead(wsId, req.user);
  return res.status(200).json(new ApiResponse(200, data, 'All notifications marked as read'));
});

export const deleteNotification = asyncHandler(async (req, res) => {
  const wsId = getWorkspaceId(req);
  const data = await notificationsService.deleteNotification(wsId, req.user, req.params.notificationId);
  return res.status(200).json(new ApiResponse(200, data, 'Notification deleted successfully'));
});

export const getNotificationSettings = asyncHandler(async (req, res) => {
  const wsId = getWorkspaceId(req);
  const data = await notificationsService.getNotificationSettings(wsId, req.user);
  return res.status(200).json(new ApiResponse(200, { settings: data }, 'Notification settings fetched successfully'));
});

export const updateNotificationSettings = asyncHandler(async (req, res) => {
  const wsId = getWorkspaceId(req);
  const data = await notificationsService.updateNotificationSettings(wsId, req.user, req.body);
  return res.status(200).json(new ApiResponse(200, { settings: data }, 'Notification settings updated successfully'));
});
