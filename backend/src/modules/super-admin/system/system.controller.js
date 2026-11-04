import { asyncHandler } from '../../../utils/asyncHandler.js';
import { ApiResponse } from '../../../utils/ApiResponse.js';
import * as systemService from './system.service.js';

export const getSystemHealth = asyncHandler(async (req, res) => {
  const data = await systemService.getOverallSystemHealth();
  return res.status(200).json(new ApiResponse(200, data, 'Overall system health fetched successfully'));
});

export const getSystemDatabase = asyncHandler(async (req, res) => {
  const data = await systemService.getDatabaseStatus();
  return res.status(200).json(new ApiResponse(200, data, 'MongoDB connection status fetched successfully'));
});

export const getSystemCache = asyncHandler(async (req, res) => {
  const data = await systemService.getCacheStatus();
  return res.status(200).json(new ApiResponse(200, data, 'Cache status fetched successfully'));
});

export const getSystemSockets = asyncHandler(async (req, res) => {
  const data = await systemService.getSocketConnections();
  return res.status(200).json(new ApiResponse(200, data, 'Active socket connections fetched successfully'));
});

export const getSystemMetrics = asyncHandler(async (req, res) => {
  const data = await systemService.getSystemMetrics();
  return res.status(200).json(new ApiResponse(200, data, 'System performance metrics fetched successfully'));
});

