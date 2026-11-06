import { asyncHandler } from '../../../utils/asyncHandler.js';
import { ApiResponse } from '../../../utils/ApiResponse.js';
import * as announcementsService from './announcements.service.js';

export const getAnnouncements = asyncHandler(async (req, res) => {
  const result = await announcementsService.getAllAnnouncements(req.query);
  return res.status(200).json(new ApiResponse(200, result, 'Announcements retrieved successfully'));
});

export const createAnnouncement = asyncHandler(async (req, res) => {
  const announcement = await announcementsService.createAnnouncement(req.body, req.user);
  return res.status(201).json(new ApiResponse(201, { announcement }, 'Announcement created successfully'));
});

export const getAnnouncementById = asyncHandler(async (req, res) => {
  const announcement = await announcementsService.getAnnouncementById(req.params.announcementId);
  return res.status(200).json(new ApiResponse(200, { announcement }, 'Announcement details retrieved successfully'));
});

export const updateAnnouncement = asyncHandler(async (req, res) => {
  const announcement = await announcementsService.updateAnnouncement(req.params.announcementId, req.body, req.user);
  return res.status(200).json(new ApiResponse(200, { announcement }, 'Announcement updated successfully'));
});

export const deleteAnnouncement = asyncHandler(async (req, res) => {
  const result = await announcementsService.deleteAnnouncement(req.params.announcementId, req.user);
  return res.status(200).json(new ApiResponse(200, result, 'Announcement deleted successfully'));
});

export const publishAnnouncement = asyncHandler(async (req, res) => {
  const announcement = await announcementsService.publishAnnouncement(req.params.announcementId, req.user);
  return res.status(200).json(new ApiResponse(200, { announcement }, 'Announcement published successfully'));
});

export const archiveAnnouncement = asyncHandler(async (req, res) => {
  const announcement = await announcementsService.archiveAnnouncement(req.params.announcementId, req.user);
  return res.status(200).json(new ApiResponse(200, { announcement }, 'Announcement archived successfully'));
});

