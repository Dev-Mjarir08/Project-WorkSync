import { asyncHandler } from '../../../utils/asyncHandler.js';
import { ApiResponse } from '../../../utils/ApiResponse.js';
import * as profileService from './profile.service.js';

const getWorkspaceId = (req) => {
  return (
    req.workspace?._id?.toString() ||
    req.params.workspaceId ||
    req.headers['x-workspace-id'] ||
    req.query.workspaceId
  );
};

export const getProfile = asyncHandler(async (req, res) => {
  const wsId = getWorkspaceId(req);
  const data = await profileService.getProfile(req.user._id, wsId);
  return res.status(200).json(new ApiResponse(200, { profile: data }, 'Profile fetched successfully'));
});

export const updateProfile = asyncHandler(async (req, res) => {
  const wsId = getWorkspaceId(req);
  const data = await profileService.updateProfile(req.user._id, req.body, wsId);
  return res.status(200).json(new ApiResponse(200, { profile: data }, 'Profile updated successfully'));
});

export const updateAvatar = asyncHandler(async (req, res) => {
  const wsId = getWorkspaceId(req);
  const avatarUrl = req.body.avatar || req.body.avatarUrl;
  const data = await profileService.updateAvatar(req.user._id, avatarUrl, wsId);
  return res.status(200).json(new ApiResponse(200, data, 'Avatar updated successfully'));
});

export const changePassword = asyncHandler(async (req, res) => {
  const wsId = getWorkspaceId(req);
  const data = await profileService.changePassword(req.user._id, req.body, wsId);
  return res.status(200).json(new ApiResponse(200, data, 'Password changed successfully'));
});

export const getSessions = asyncHandler(async (req, res) => {
  const data = await profileService.getSessions(req.user._id);
  return res.status(200).json(new ApiResponse(200, data, 'Active sessions fetched successfully'));
});

export const revokeSession = asyncHandler(async (req, res) => {
  const data = await profileService.revokeSession(req.user._id, req.params.sessionId);
  return res.status(200).json(new ApiResponse(200, data, 'Session revoked successfully'));
});
