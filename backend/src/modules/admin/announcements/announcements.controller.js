import { asyncHandler } from '../../../utils/asyncHandler.js';
import { ApiResponse } from '../../../utils/ApiResponse.js';
import * as announcementsService from './announcements.service.js';

const getWorkspaceId = (req) => {
  return (
    req.workspace?._id?.toString() ||
    req.params.workspaceId ||
    req.headers['x-workspace-id'] ||
    req.query.workspaceId
  );
};

export const getAnnouncements = asyncHandler(async (req, res) => {
  const wsId = getWorkspaceId(req);
  const data = await announcementsService.getAnnouncements(wsId, req.query);
  return res.status(200).json(new ApiResponse(200, data, 'Announcements fetched successfully'));
});

export const createAnnouncement = asyncHandler(async (req, res) => {
  const wsId = getWorkspaceId(req);
  const data = await announcementsService.createAnnouncement(wsId, req.body, req.user);
  return res.status(201).json(new ApiResponse(201, { announcement: data }, 'Announcement created successfully'));
});

export const getAnnouncementById = asyncHandler(async (req, res) => {
  const wsId = getWorkspaceId(req);
  const data = await announcementsService.getAnnouncementById(wsId, req.params.announcementId);
  return res.status(200).json(new ApiResponse(200, { announcement: data }, 'Announcement details fetched successfully'));
});

export const updateAnnouncement = asyncHandler(async (req, res) => {
  const wsId = getWorkspaceId(req);
  const data = await announcementsService.updateAnnouncement(wsId, req.params.announcementId, req.body, req.user);
  return res.status(200).json(new ApiResponse(200, { announcement: data }, 'Announcement updated successfully'));
});

export const deleteAnnouncement = asyncHandler(async (req, res) => {
  const wsId = getWorkspaceId(req);
  const data = await announcementsService.deleteAnnouncement(wsId, req.params.announcementId, req.user);
  return res.status(200).json(new ApiResponse(200, data, 'Announcement deleted successfully'));
});

export const publishAnnouncement = asyncHandler(async (req, res) => {
  const wsId = getWorkspaceId(req);
  const data = await announcementsService.publishAnnouncement(wsId, req.params.announcementId, req.user);
  return res.status(200).json(new ApiResponse(200, { announcement: data }, 'Announcement published successfully'));
});

export const archiveAnnouncement = asyncHandler(async (req, res) => {
  const wsId = getWorkspaceId(req);
  const data = await announcementsService.archiveAnnouncement(wsId, req.params.announcementId, req.user);
  return res.status(200).json(new ApiResponse(200, { announcement: data }, 'Announcement archived successfully'));
});
