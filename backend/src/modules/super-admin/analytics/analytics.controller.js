import { asyncHandler } from '../../../utils/asyncHandler.js';
import { ApiResponse } from '../../../utils/ApiResponse.js';
import * as analyticsService from './analytics.service.js';

export const getAnalyticsOverview = asyncHandler(async (req, res) => {
  const data = await analyticsService.getAnalyticsOverview();
  return res.status(200).json(new ApiResponse(200, data, 'Platform analytics overview fetched successfully'));
});

export const getUserAnalytics = asyncHandler(async (req, res) => {
  const data = await analyticsService.getUserAnalytics();
  return res.status(200).json(new ApiResponse(200, data, 'User analytics fetched successfully'));
});

export const getWorkspaceAnalytics = asyncHandler(async (req, res) => {
  const data = await analyticsService.getWorkspaceAnalytics();
  return res.status(200).json(new ApiResponse(200, data, 'Workspace analytics fetched successfully'));
});

export const getBoardAnalytics = asyncHandler(async (req, res) => {
  const data = await analyticsService.getBoardAnalytics();
  return res.status(200).json(new ApiResponse(200, data, 'Board analytics fetched successfully'));
});

export const getTaskAnalytics = asyncHandler(async (req, res) => {
  const data = await analyticsService.getTaskAnalytics();
  return res.status(200).json(new ApiResponse(200, data, 'Task analytics fetched successfully'));
});

export const getActivityAnalytics = asyncHandler(async (req, res) => {
  const data = await analyticsService.getActivityAnalytics();
  return res.status(200).json(new ApiResponse(200, data, 'Platform activity statistics fetched successfully'));
});

export const getEngagementAnalytics = asyncHandler(async (req, res) => {
  const data = await analyticsService.getEngagementAnalytics();
  return res.status(200).json(new ApiResponse(200, data, 'User engagement statistics fetched successfully'));
});

