import { asyncHandler } from '../../../utils/asyncHandler.js';
import { ApiResponse } from '../../../utils/ApiResponse.js';
import * as profileService from './profile.service.js';

export const getProfile = asyncHandler(async (req, res) => {
  const profile = await profileService.getAdminProfile(req.user._id);
  return res.status(200).json(new ApiResponse(200, { profile }, 'Profile details retrieved successfully'));
});

export const updateProfile = asyncHandler(async (req, res) => {
  const profile = await profileService.updateAdminProfile(req.user._id, req.body);
  return res.status(200).json(new ApiResponse(200, { profile }, 'Profile details updated successfully'));
});

export const updateAvatar = asyncHandler(async (req, res) => {
  const result = await profileService.updateAdminAvatar(req.user._id, req.body.avatar);
  return res.status(200).json(new ApiResponse(200, result, 'Profile avatar updated successfully'));
});

export const changePassword = asyncHandler(async (req, res) => {
  const result = await profileService.changeAdminPassword(req.user._id, req.body);
  return res.status(200).json(new ApiResponse(200, result, 'Password changed successfully'));
});

export const getProfileSessions = asyncHandler(async (req, res) => {
  const data = await profileService.getAdminSessions(req.user._id);
  return res.status(200).json(new ApiResponse(200, data, 'Active sessions retrieved successfully'));
});

export const revokeProfileSession = asyncHandler(async (req, res) => {
  const result = await profileService.revokeAdminSession(req.user._id, req.params.sessionId);
  return res.status(200).json(new ApiResponse(200, result, 'Session revoked successfully'));
});

