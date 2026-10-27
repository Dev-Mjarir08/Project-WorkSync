import mongoose from 'mongoose';
import { Notification } from '../../../models/Notification.js';
import { Workspace } from '../../../models/Workspace.js';
import { ApiError } from '../../../utils/ApiError.js';

export const getNotifications = async (workspaceId, user, query = {}) => {
  const recipient = user._id;
  const page = parseInt(query.page, 10) || 1;
  const limit = parseInt(query.limit, 10) || 20;
  const skip = (page - 1) * limit;

  const filter = { recipient };

  if (workspaceId) {
    const wsId = new mongoose.Types.ObjectId(workspaceId);
    filter.$or = [
      { workspace: wsId },
      { workspace: { $exists: false } },
      { workspace: null }
    ];
  }

  if (query.type) {
    filter.type = query.type.toLowerCase();
  }

  if (query.isRead !== undefined) {
    filter.isRead = query.isRead === 'true' || query.isRead === true;
  }

  const [notifications, total, unreadCount] = await Promise.all([
    Notification.find(filter)
      .populate('sender', 'name email avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Notification.countDocuments(filter),
    Notification.countDocuments({
      recipient,
      isRead: false,
      ...(workspaceId ? {
        $or: [
          { workspace: new mongoose.Types.ObjectId(workspaceId) },
          { workspace: { $exists: false } },
          { workspace: null }
        ]
      } : {})
    })
  ]);

  return {
    notifications,
    unreadCount,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit) || 1
    }
  };
};

export const getUnreadNotifications = async (workspaceId, user, query = {}) => {
  const recipient = user._id;
  const limit = parseInt(query.limit, 10) || 50;

  const filter = {
    recipient,
    isRead: false
  };

  if (workspaceId) {
    const wsId = new mongoose.Types.ObjectId(workspaceId);
    filter.$or = [
      { workspace: wsId },
      { workspace: { $exists: false } },
      { workspace: null }
    ];
  }

  const notifications = await Notification.find(filter)
    .populate('sender', 'name email avatar')
    .sort({ createdAt: -1 })
    .limit(limit);

  return {
    notifications,
    unreadCount: notifications.length
  };
};

export const markNotificationAsRead = async (workspaceId, user, notificationId) => {
  if (!notificationId) throw new ApiError(400, 'Notification ID is required');

  const notification = await Notification.findOne({
    _id: notificationId,
    recipient: user._id
  });

  if (!notification) {
    throw new ApiError(404, 'Notification not found');
  }

  notification.isRead = true;
  notification.readAt = new Date();
  await notification.save();

  return notification;
};

export const markAllAsRead = async (workspaceId, user) => {
  const filter = {
    recipient: user._id,
    isRead: false
  };

  if (workspaceId) {
    const wsId = new mongoose.Types.ObjectId(workspaceId);
    filter.$or = [
      { workspace: wsId },
      { workspace: { $exists: false } },
      { workspace: null }
    ];
  }

  const result = await Notification.updateMany(filter, {
    $set: { isRead: true, readAt: new Date() }
  });

  return {
    success: true,
    modifiedCount: result.modifiedCount || 0,
    message: 'All notifications marked as read'
  };
};

export const deleteNotification = async (workspaceId, user, notificationId) => {
  if (!notificationId) throw new ApiError(400, 'Notification ID is required');

  const notification = await Notification.findOneAndDelete({
    _id: notificationId,
    recipient: user._id
  });

  if (!notification) {
    throw new ApiError(404, 'Notification not found');
  }

  return {
    id: notificationId,
    deleted: true
  };
};

export const getNotificationSettings = async (workspaceId, user) => {
  const defaultSettings = {
    emailNotifications: true,
    taskAlerts: true,
    weeklyDigest: true,
    inAppNotifications: true,
    announcementsAlerts: true,
    mentionAlerts: true
  };

  if (!workspaceId) return defaultSettings;

  const workspace = await Workspace.findById(workspaceId);
  if (!workspace) return defaultSettings;

  return {
    ...defaultSettings,
    ...(workspace.settings?.notifications ? workspace.settings.notifications.toObject ? workspace.settings.notifications.toObject() : workspace.settings.notifications : {})
  };
};

export const updateNotificationSettings = async (workspaceId, user, newSettings = {}) => {
  if (!workspaceId) throw new ApiError(400, 'Workspace ID is required');

  const workspace = await Workspace.findById(workspaceId);
  if (!workspace) throw new ApiError(404, 'Workspace not found');

  if (!workspace.settings) {
    workspace.settings = {};
  }
  if (!workspace.settings.notifications) {
    workspace.settings.notifications = {};
  }

  const allowedFields = [
    'emailNotifications',
    'taskAlerts',
    'weeklyDigest',
    'inAppNotifications',
    'announcementsAlerts',
    'mentionAlerts'
  ];

  allowedFields.forEach(field => {
    if (newSettings[field] !== undefined) {
      workspace.settings.notifications[field] = Boolean(newSettings[field]);
    }
  });

  await workspace.save();

  return workspace.settings.notifications;
};
