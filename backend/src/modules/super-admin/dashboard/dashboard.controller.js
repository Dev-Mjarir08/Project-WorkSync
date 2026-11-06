import { asyncHandler } from '../../../utils/asyncHandler.js';
import { ApiResponse } from '../../../utils/ApiResponse.js';
import * as dashboardService from './dashboard.service.js';

export const getDashboard = asyncHandler(async (req, res) => {
  const data = await dashboardService.getDashboardOverview();
  return res.status(200).json(new ApiResponse(200, data, 'Platform dashboard fetched successfully'));
});

export const getDashboardStats = asyncHandler(async (req, res) => {
  const data = await dashboardService.getDashboardStats();
  return res.status(200).json(new ApiResponse(200, data, 'Platform statistics fetched successfully'));
});

export const getUserGrowth = asyncHandler(async (req, res) => {
  const days = req.query.days || 30;
  const data = await dashboardService.getUserGrowth(days);
  return res.status(200).json(new ApiResponse(200, data, 'User growth statistics fetched successfully'));
});

export const getWorkspaceGrowth = asyncHandler(async (req, res) => {
  const days = req.query.days || 30;
  const data = await dashboardService.getWorkspaceGrowth(days);
  return res.status(200).json(new ApiResponse(200, data, 'Workspace growth statistics fetched successfully'));
});

export const getRecentUsers = asyncHandler(async (req, res) => {
  const limit = req.query.limit || 10;
  const data = await dashboardService.getRecentUsers(limit);
  return res.status(200).json(new ApiResponse(200, { users: data }, 'Recent users retrieved successfully'));
});

export const getRecentWorkspaces = asyncHandler(async (req, res) => {
  const limit = req.query.limit || 10;
  const data = await dashboardService.getRecentWorkspaces(limit);
  return res.status(200).json(new ApiResponse(200, { workspaces: data }, 'Recent workspaces retrieved successfully'));
});

export const getRecentActivities = asyncHandler(async (req, res) => {
  const limit = req.query.limit || 15;
  const data = await dashboardService.getRecentActivities(limit);
  return res.status(200).json(new ApiResponse(200, { activities: data }, 'Recent activities retrieved successfully'));
});

