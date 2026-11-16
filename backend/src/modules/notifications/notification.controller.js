import mongoose from 'mongoose';
import { Notification } from '../../models/Notification.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import { ApiError } from '../../utils/ApiError.js';

export const getNotifications = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 30));
  const skip = (page - 1) * limit;

  const filter = { recipient: userId };
  if (req.query.unreadOnly === 'true' || req.query.isRead === 'false') {
    filter.isRead = false;
  }
  if (req.query.type && req.query.type !== 'all') {
    filter.type = req.query.type;
  }

  // Count existing notifications; if 0, auto-seed a welcome notification
  const existingCount = await Notification.countDocuments({ recipient: userId });
  if (existingCount === 0) {
    await Notification.create({
      recipient: userId,
      sender: null,
      title: 'Welcome to WorkSync Platform',
      message: 'Your workspace and dashboard are ready. Track assignments, manage tasks, and collaborate seamlessly.',
      type: 'system',
      link: '/dashboard',
      isRead: false
    }).catch(() => {});
  }

  const [rawNotifications, totalCount, unreadCount] = await Promise.all([
    Notification.find(filter)
      .populate('sender', 'name email avatar')
      .populate('workspace', 'name slug')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Notification.countDocuments(filter),
    Notification.countDocuments({ recipient: userId, isRead: false })
  ]);

  const notifications = rawNotifications.map((n) => ({
    id: n._id.toString(),
    _id: n._id.toString(),
    title: n.title,
    message: n.message,
    type: n.type || 'general',
    isRead: n.isRead,
    read: n.isRead,
    link: n.link || '',
    sender: n.sender ? {
      id: n.sender._id?.toString(),
      name: n.sender.name,
      email: n.sender.email,
      avatar: n.sender.avatar
    } : null,
    workspace: n.workspace ? {
      id: n.workspace._id?.toString(),
      name: n.workspace.name
    } : null,
    createdAt: n.createdAt
  }));

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        notifications,
        unreadCount,
        pagination: {
          page,
          limit,
          total: totalCount,
          pages: Math.ceil(totalCount / limit) || 1
        }
      },
      'Notifications fetched successfully'
    )
  );
});

export const getUnreadCount = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const unreadCount = await Notification.countDocuments({ recipient: userId, isRead: false });
  return res.status(200).json(new ApiResponse(200, { unreadCount }, 'Unread count fetched'));
});

export const markAsRead = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;

  if (mongoose.Types.ObjectId.isValid(id)) {
    await Notification.findOneAndUpdate(
      { _id: id, recipient: userId },
      { $set: { isRead: true, readAt: new Date() } }
    );
  }

  const unreadCount = await Notification.countDocuments({ recipient: userId, isRead: false });
  return res.status(200).json(new ApiResponse(200, { unreadCount }, 'Notification marked as read'));
});

export const markAllAsRead = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  await Notification.updateMany(
    { recipient: userId, isRead: false },
    { $set: { isRead: true, readAt: new Date() } }
  );
  return res.status(200).json(new ApiResponse(200, { unreadCount: 0 }, 'All notifications marked as read'));
});

export const deleteNotification = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;

  if (mongoose.Types.ObjectId.isValid(id)) {
    await Notification.findOneAndDelete({ _id: id, recipient: userId });
  }

  const unreadCount = await Notification.countDocuments({ recipient: userId, isRead: false });
  return res.status(200).json(new ApiResponse(200, { unreadCount }, 'Notification removed'));
});

export const clearAllNotifications = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  await Notification.deleteMany({ recipient: userId });
  return res.status(200).json(new ApiResponse(200, { unreadCount: 0 }, 'All notifications cleared'));
});
