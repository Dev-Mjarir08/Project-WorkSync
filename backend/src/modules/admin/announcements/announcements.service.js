import mongoose from 'mongoose';
import { Announcement } from '../../../models/Announcement.js';
import { Activity } from '../../../models/Activity.js';
import { ApiError } from '../../../utils/ApiError.js';

export const getAnnouncements = async (workspaceId, query = {}) => {
  if (!workspaceId) throw new ApiError(400, 'Workspace ID is required');
  const wsId = new mongoose.Types.ObjectId(workspaceId);

  const page = parseInt(query.page, 10) || 1;
  const limit = parseInt(query.limit, 10) || 20;
  const skip = (page - 1) * limit;

  const filter = { workspace: wsId };

  if (query.status && query.status !== 'all') {
    filter.status = query.status.toLowerCase();
  }
  if (query.priority && query.priority !== 'all') {
    filter.priority = query.priority.toLowerCase();
  }
  if (query.targetAudience && query.targetAudience !== 'all') {
    filter.targetAudience = query.targetAudience.toLowerCase();
  }
  if (query.search) {
    filter.$or = [
      { title: { $regex: query.search, $options: 'i' } },
      { content: { $regex: query.search, $options: 'i' } }
    ];
  }

  const [announcements, total] = await Promise.all([
    Announcement.find(filter)
      .populate('createdBy', 'name email avatar role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Announcement.countDocuments(filter)
  ]);

  return {
    announcements,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit) || 1
    }
  };
};

export const createAnnouncement = async (workspaceId, data, actorUser) => {
  if (!workspaceId) throw new ApiError(400, 'Workspace ID is required');
  if (!data.title || !data.title.trim()) throw new ApiError(400, 'Announcement title is required');
  if (!data.content || !data.content.trim()) throw new ApiError(400, 'Announcement content is required');

  const status = (data.status || 'draft').toLowerCase();
  const publishedAt = status === 'published' ? new Date() : null;

  const announcement = await Announcement.create({
    workspace: workspaceId,
    title: data.title.trim(),
    content: data.content.trim(),
    priority: data.priority ? data.priority.toLowerCase() : 'normal',
    targetAudience: data.targetAudience ? data.targetAudience.toLowerCase() : 'all',
    status,
    publishedAt,
    createdBy: actorUser._id,
    authorName: actorUser.name || 'Admin',
    tags: Array.isArray(data.tags) ? data.tags : []
  });

  await Activity.create({
    workspace: workspaceId,
    user: actorUser._id,
    action: 'ANNOUNCEMENT_CREATED',
    type: 'admin',
    description: `Created announcement: ${announcement.title}`,
    details: `Created announcement: ${announcement.title} with status ${status}`,
    entityType: 'announcement',
    entityId: announcement._id,
    entityName: announcement.title
  }).catch(() => {});

  const populated = await Announcement.findById(announcement._id)
    .populate('createdBy', 'name email avatar role');

  return populated;
};

export const getAnnouncementById = async (workspaceId, announcementId) => {
  if (!workspaceId) throw new ApiError(400, 'Workspace ID is required');
  if (!announcementId) throw new ApiError(400, 'Announcement ID is required');

  const announcement = await Announcement.findOne({
    _id: announcementId,
    workspace: workspaceId
  }).populate('createdBy', 'name email avatar role');

  if (!announcement) {
    throw new ApiError(404, 'Announcement not found');
  }

  return announcement;
};

export const updateAnnouncement = async (workspaceId, announcementId, data, actorUser) => {
  if (!workspaceId) throw new ApiError(400, 'Workspace ID is required');
  if (!announcementId) throw new ApiError(400, 'Announcement ID is required');

  const announcement = await Announcement.findOne({
    _id: announcementId,
    workspace: workspaceId
  });

  if (!announcement) {
    throw new ApiError(404, 'Announcement not found');
  }

  if (data.title !== undefined) announcement.title = data.title.trim();
  if (data.content !== undefined) announcement.content = data.content.trim();
  if (data.priority !== undefined) announcement.priority = data.priority.toLowerCase();
  if (data.targetAudience !== undefined) announcement.targetAudience = data.targetAudience.toLowerCase();
  if (data.tags !== undefined) announcement.tags = Array.isArray(data.tags) ? data.tags : [];

  if (data.status !== undefined) {
    const nextStatus = data.status.toLowerCase();
    if (nextStatus === 'published' && announcement.status !== 'published') {
      announcement.publishedAt = new Date();
    } else if (nextStatus === 'archived' && announcement.status !== 'archived') {
      announcement.archivedAt = new Date();
    }
    announcement.status = nextStatus;
  }

  await announcement.save();

  await Activity.create({
    workspace: workspaceId,
    user: actorUser._id,
    action: 'ANNOUNCEMENT_UPDATED',
    type: 'admin',
    description: `Updated announcement: ${announcement.title}`,
    details: `Updated announcement: ${announcement.title}`,
    entityType: 'announcement',
    entityId: announcement._id,
    entityName: announcement.title
  }).catch(() => {});

  const populated = await Announcement.findById(announcement._id)
    .populate('createdBy', 'name email avatar role');

  return populated;
};

export const deleteAnnouncement = async (workspaceId, announcementId, actorUser) => {
  if (!workspaceId) throw new ApiError(400, 'Workspace ID is required');
  if (!announcementId) throw new ApiError(400, 'Announcement ID is required');

  const announcement = await Announcement.findOneAndDelete({
    _id: announcementId,
    workspace: workspaceId
  });

  if (!announcement) {
    throw new ApiError(404, 'Announcement not found');
  }

  await Activity.create({
    workspace: workspaceId,
    user: actorUser._id,
    action: 'ANNOUNCEMENT_DELETED',
    type: 'admin',
    description: `Deleted announcement: ${announcement.title}`,
    details: `Deleted announcement: ${announcement.title}`,
    entityType: 'announcement',
    entityName: announcement.title
  }).catch(() => {});

  return {
    id: announcementId,
    title: announcement.title,
    deleted: true
  };
};

export const publishAnnouncement = async (workspaceId, announcementId, actorUser) => {
  if (!workspaceId) throw new ApiError(400, 'Workspace ID is required');
  if (!announcementId) throw new ApiError(400, 'Announcement ID is required');

  const announcement = await Announcement.findOne({
    _id: announcementId,
    workspace: workspaceId
  });

  if (!announcement) {
    throw new ApiError(404, 'Announcement not found');
  }

  announcement.status = 'published';
  announcement.publishedAt = new Date();
  await announcement.save();

  await Activity.create({
    workspace: workspaceId,
    user: actorUser._id,
    action: 'ANNOUNCEMENT_PUBLISHED',
    type: 'admin',
    description: `Published announcement: ${announcement.title}`,
    details: `Published announcement: ${announcement.title}`,
    entityType: 'announcement',
    entityId: announcement._id,
    entityName: announcement.title
  }).catch(() => {});

  const populated = await Announcement.findById(announcement._id)
    .populate('createdBy', 'name email avatar role');

  return populated;
};

export const archiveAnnouncement = async (workspaceId, announcementId, actorUser) => {
  if (!workspaceId) throw new ApiError(400, 'Workspace ID is required');
  if (!announcementId) throw new ApiError(400, 'Announcement ID is required');

  const announcement = await Announcement.findOne({
    _id: announcementId,
    workspace: workspaceId
  });

  if (!announcement) {
    throw new ApiError(404, 'Announcement not found');
  }

  announcement.status = 'archived';
  announcement.archivedAt = new Date();
  await announcement.save();

  await Activity.create({
    workspace: workspaceId,
    user: actorUser._id,
    action: 'ANNOUNCEMENT_ARCHIVED',
    type: 'admin',
    description: `Archived announcement: ${announcement.title}`,
    details: `Archived announcement: ${announcement.title}`,
    entityType: 'announcement',
    entityId: announcement._id,
    entityName: announcement.title
  }).catch(() => {});

  const populated = await Announcement.findById(announcement._id)
    .populate('createdBy', 'name email avatar role');

  return populated;
};
