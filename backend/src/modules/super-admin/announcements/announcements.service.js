import { Announcement } from '../../../models/Announcement.js';
import { AuditLog } from '../../../models/AuditLog.js';
import { ApiError } from '../../../utils/ApiError.js';

const escapeRegex = (str = '') => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const recordAudit = async ({ action, category = 'system', details, actor, target = '', targetId = '', status = 'success' }) => {
  try {
    await AuditLog.create({
      action,
      category,
      details,
      actor: {
        user: actor?._id || actor?.id,
        name: actor?.name || 'Super Admin',
        email: actor?.email || 'admin@worksync.io'
      },
      target,
      targetId: targetId ? targetId.toString() : '',
      status
    });
  } catch (err) {
    console.error('AuditLog error:', err.message);
  }
};

export const getAllAnnouncements = async (query = {}) => {
  const { search = '', status = 'all', priority = 'all', page = 1, limit = 20 } = query;

  const filter = {};
  if (search.trim()) {
    filter.title = { $regex: escapeRegex(search.trim()), $options: 'i' };
  }
  if (status && status !== 'all') {
    filter.status = status.toLowerCase();
  }
  if (priority && priority !== 'all') {
    filter.priority = priority.toLowerCase();
  }

  const parsedPage = Math.max(1, parseInt(page, 10) || 1);
  const parsedLimit = Math.min(50, Math.max(1, parseInt(limit, 10) || 20));
  const skip = (parsedPage - 1) * parsedLimit;

  const [announcements, totalCount] = await Promise.all([
    Announcement.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parsedLimit)
      .lean(),
    Announcement.countDocuments(filter)
  ]);

  const totalPages = Math.ceil(totalCount / parsedLimit) || 1;

  return {
    announcements: announcements.map(a => ({
      id: a._id.toString(),
      title: a.title,
      content: a.content,
      priority: a.priority,
      targetAudience: a.targetAudience,
      status: a.status,
      authorName: a.authorName || 'Super Admin',
      tags: a.tags || [],
      publishedAt: a.publishedAt,
      createdAt: a.createdAt
    })),
    totalCount,
    pagination: {
      currentPage: parsedPage,
      totalPages,
      limit: parsedLimit,
      hasNextPage: parsedPage < totalPages,
      hasPrevPage: parsedPage > 1
    }
  };
};

export const createAnnouncement = async ({ title, content, priority = 'normal', targetAudience = 'all', tags = [], publishImmediately = false }, actorAdmin) => {
  const status = publishImmediately ? 'published' : 'draft';
  const publishedAt = publishImmediately ? new Date() : null;

  const announcement = await Announcement.create({
    title: title.trim(),
    content: content.trim(),
    priority,
    targetAudience,
    tags,
    status,
    publishedAt,
    createdBy: actorAdmin?._id,
    authorName: actorAdmin?.name || 'Super Admin'
  });

  await recordAudit({
    action: publishImmediately ? 'Announcement Published' : 'Announcement Created',
    details: `Announcement "${announcement.title}" was ${publishImmediately ? 'published' : 'drafted'}`,
    actor: actorAdmin,
    target: announcement.title,
    targetId: announcement._id.toString()
  });

  return {
    id: announcement._id.toString(),
    title: announcement.title,
    content: announcement.content,
    priority: announcement.priority,
    status: announcement.status,
    publishedAt: announcement.publishedAt,
    createdAt: announcement.createdAt
  };
};

export const getAnnouncementById = async (announcementId) => {
  const announcement = await Announcement.findById(announcementId);
  if (!announcement) {
    throw new ApiError(404, `Announcement not found with ID: ${announcementId}`);
  }

  return {
    id: announcement._id.toString(),
    title: announcement.title,
    content: announcement.content,
    priority: announcement.priority,
    targetAudience: announcement.targetAudience,
    status: announcement.status,
    authorName: announcement.authorName,
    tags: announcement.tags || [],
    publishedAt: announcement.publishedAt,
    createdAt: announcement.createdAt,
    updatedAt: announcement.updatedAt
  };
};

export const updateAnnouncement = async (announcementId, updateData, actorAdmin) => {
  const announcement = await Announcement.findById(announcementId);
  if (!announcement) {
    throw new ApiError(404, `Announcement not found with ID: ${announcementId}`);
  }

  if (updateData.title !== undefined) announcement.title = updateData.title.trim();
  if (updateData.content !== undefined) announcement.content = updateData.content.trim();
  if (updateData.priority !== undefined) announcement.priority = updateData.priority;
  if (updateData.targetAudience !== undefined) announcement.targetAudience = updateData.targetAudience;
  if (updateData.tags !== undefined) announcement.tags = updateData.tags;
  if (updateData.status !== undefined) announcement.status = updateData.status;

  await announcement.save();

  await recordAudit({
    action: 'Announcement Updated',
    details: `Announcement "${announcement.title}" updated`,
    actor: actorAdmin,
    target: announcement.title,
    targetId: announcement._id.toString()
  });

  return {
    id: announcement._id.toString(),
    title: announcement.title,
    status: announcement.status,
    updatedAt: announcement.updatedAt
  };
};

export const deleteAnnouncement = async (announcementId, actorAdmin) => {
  const announcement = await Announcement.findById(announcementId);
  if (!announcement) {
    throw new ApiError(404, `Announcement not found with ID: ${announcementId}`);
  }

  const title = announcement.title;
  await Announcement.findByIdAndDelete(announcementId);

  await recordAudit({
    action: 'Announcement Deleted',
    details: `Announcement "${title}" removed`,
    actor: actorAdmin,
    target: title,
    targetId: announcementId.toString(),
    status: 'warning'
  });

  return {
    id: announcementId,
    title,
    deleted: true
  };
};

export const publishAnnouncement = async (announcementId, actorAdmin) => {
  const announcement = await Announcement.findById(announcementId);
  if (!announcement) {
    throw new ApiError(404, `Announcement not found with ID: ${announcementId}`);
  }

  announcement.status = 'published';
  announcement.publishedAt = new Date();
  await announcement.save();

  await recordAudit({
    action: 'Announcement Published',
    details: `Announcement "${announcement.title}" published to audience "${announcement.targetAudience}"`,
    actor: actorAdmin,
    target: announcement.title,
    targetId: announcement._id.toString()
  });

  return {
    id: announcement._id.toString(),
    title: announcement.title,
    status: announcement.status,
    publishedAt: announcement.publishedAt
  };
};

export const archiveAnnouncement = async (announcementId, actorAdmin) => {
  const announcement = await Announcement.findById(announcementId);
  if (!announcement) {
    throw new ApiError(404, `Announcement not found with ID: ${announcementId}`);
  }

  announcement.status = 'archived';
  announcement.archivedAt = new Date();
  await announcement.save();

  await recordAudit({
    action: 'Announcement Archived',
    details: `Announcement "${announcement.title}" was archived`,
    actor: actorAdmin,
    target: announcement.title,
    targetId: announcement._id.toString()
  });

  return {
    id: announcement._id.toString(),
    title: announcement.title,
    status: announcement.status,
    archivedAt: announcement.archivedAt
  };
};

