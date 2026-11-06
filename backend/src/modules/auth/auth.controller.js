import { asyncHandler } from '../../utils/asyncHandler.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import * as authService from './auth.service.js';

export const register = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;
  const result = await authService.registerUser({ name, email, password, role });

  return res
    .status(201)
    .json(new ApiResponse(201, result, 'User registered successfully.'));
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const result = await authService.loginUser({ email, password });

  return res
    .status(200)
    .json(new ApiResponse(200, result, 'Logged in successfully.'));
});

export const getMe = asyncHandler(async (req, res) => {
  const user = await authService.getUserProfile(req.user._id);

  return res
    .status(200)
    .json(new ApiResponse(200, { user }, 'Current user profile fetched successfully.'));
});

export const updateProfile = asyncHandler(async (req, res) => {
  const updatedUser = await authService.updateUserProfile(req.user._id, req.body);

  return res
    .status(200)
    .json(new ApiResponse(200, { user: updatedUser }, 'Profile updated successfully.'));
});

export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const result = await authService.changeUserPassword(req.user._id, {
    currentPassword,
    newPassword
  });

  return res
    .status(200)
    .json(new ApiResponse(200, result, 'Password changed successfully.'));
});

export const refreshToken = asyncHandler(async (req, res) => {
  const result = await authService.refreshUserToken(req.user);

  return res
    .status(200)
    .json(new ApiResponse(200, result, 'Token refreshed successfully.'));
});

export const logout = asyncHandler(async (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax'
  });

  return res
    .status(200)
    .json(new ApiResponse(200, null, 'Logged out successfully.'));
});

export default {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
  refreshToken,
  logout
};
