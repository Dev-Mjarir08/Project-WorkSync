import mongoose from 'mongoose';
import { Notification } from '../models/Notification.js';

/**
 * Creates an in-app notification safely
 */
export const createNotification = async ({
  recipient,
  workspace = null,
  sender = null,
  title,
  message,
  type = 'task',
  link = '',
  metadata = {}
}) => {
  try {
    if (!recipient || !title || !message) return null;
    if (!mongoose.Types.ObjectId.isValid(recipient)) return null;

    const notif = await Notification.create({
      recipient: new mongoose.Types.ObjectId(recipient),
      workspace: workspace && mongoose.Types.ObjectId.isValid(workspace) ? new mongoose.Types.ObjectId(workspace) : null,
      sender: sender && mongoose.Types.ObjectId.isValid(sender) ? new mongoose.Types.ObjectId(sender) : null,
      title: title.trim(),
      message: message.trim(),
      type: ['task', 'project', 'board', 'member', 'workspace', 'system', 'announcement', 'general'].includes(type)
        ? type
        : 'general',
      link: link || '',
      metadata: metadata || {},
      isRead: false
    });

    return notif;
  } catch (err) {
    console.error('Failed to create notification:', err.message);
    return null;
  }
};

export default createNotification;
