import mongoose from 'mongoose';
import { Notification } from '../../../models/Notification.js';
import { User } from '../../../models/User.js';
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
  if (!notificationId || !mongoose.Types.ObjectId.isValid(notificationId)) {
    throw new ApiError(400, 'Invalid notification ID');
  }

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
  if (!notificationId || !mongoose.Types.ObjectId.isValid(notificationId)) {
    throw new ApiError(400, 'Invalid notification ID');
  }

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

  const userDoc = await User.findById(user._id);
  if (!userDoc) return defaultSettings;

  return {
    ...defaultSettings,
    ...(userDoc.notificationSettings?.toObject ? userDoc.notificationSettings.toObject() : userDoc.notificationSettings || {})
  };
};

export const updateNotificationSettings = async (workspaceId, user, newSettings = {}) => {
  const userDoc = await User.findById(user._id);
  if (!userDoc) {
    throw new ApiError(404, 'User not found');
  }

  if (!userDoc.notificationSettings) {
    userDoc.notificationSettings = {};
  }

  const fields = [
    'emailNotifications',
    'taskAlerts',
    'weeklyDigest',
    'inAppNotifications',
    'announcementsAlerts',
    'mentionAlerts'
  ];

  fields.forEach((f) => {
    if (newSettings[f] !== undefined) {
      userDoc.notificationSettings[f] = Boolean(newSettings[f]);
    }
  });

  await userDoc.save();

  return userDoc.notificationSettings;
};
