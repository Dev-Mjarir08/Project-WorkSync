import { asyncHandler } from '../../../utils/asyncHandler.js';
import { ApiResponse } from '../../../utils/ApiResponse.js';
import * as settingsService from './settings.service.js';

export const getSettings = asyncHandler(async (req, res) => {
  const settings = await settingsService.getAllSettings();
  return res.status(200).json(new ApiResponse(200, { settings }, 'Platform settings retrieved successfully'));
});

export const updateGeneralSettings = asyncHandler(async (req, res) => {
  const general = await settingsService.updateGeneralSettings(req.body, req.user);
  return res.status(200).json(new ApiResponse(200, { general }, 'General settings updated successfully'));
});

export const updateSecuritySettings = asyncHandler(async (req, res) => {
  const security = await settingsService.updateSecuritySettings(req.body, req.user);
  return res.status(200).json(new ApiResponse(200, { security }, 'Security policies updated successfully'));
});

export const updateRegistrationSettings = asyncHandler(async (req, res) => {
  const registration = await settingsService.updateRegistrationSettings(req.body, req.user);
  return res.status(200).json(new ApiResponse(200, { registration }, 'Registration settings updated successfully'));
});

export const updateNotificationSettings = asyncHandler(async (req, res) => {
  const notifications = await settingsService.updateNotificationSettings(req.body, req.user);
  return res.status(200).json(new ApiResponse(200, { notifications }, 'Notification settings updated successfully'));
});

export const getSecurityConfiguration = asyncHandler(async (req, res) => {
  const data = await settingsService.getSecurityConfiguration();
  return res.status(200).json(new ApiResponse(200, data, 'Security configuration retrieved successfully'));
});

