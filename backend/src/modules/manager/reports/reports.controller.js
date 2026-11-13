import { asyncHandler } from '../../../utils/asyncHandler.js';
import { ApiResponse } from '../../../utils/ApiResponse.js';
import * as reportsService from './reports.service.js';

const getWorkspaceId = (req) => {
  return (
    req.workspace?._id?.toString() ||
    req.params.workspaceId ||
    req.headers['x-workspace-id'] ||
    req.query.workspaceId
  );
};

export const getReportsOverview = asyncHandler(async (req, res) => {
  const wsId = getWorkspaceId(req);
  const data = await reportsService.getReportsOverview(wsId);
  return res.status(200).json(new ApiResponse(200, data, 'Overall reports overview fetched successfully'));
});

export const getProjectReports = asyncHandler(async (req, res) => {
  const wsId = getWorkspaceId(req);
  const data = await reportsService.getProjectReports(wsId, req.query);
  return res.status(200).json(new ApiResponse(200, data, 'Project reports fetched successfully'));
});

export const getTaskReports = asyncHandler(async (req, res) => {
  const wsId = getWorkspaceId(req);
  const data = await reportsService.getTaskReports(wsId, req.query);
  return res.status(200).json(new ApiResponse(200, data, 'Task reports fetched successfully'));
});

export const getCompletedTaskReports = asyncHandler(async (req, res) => {
  const wsId = getWorkspaceId(req);
  const data = await reportsService.getCompletedTaskReports(wsId, req.query);
  return res.status(200).json(new ApiResponse(200, data, 'Completed task reports fetched successfully'));
});

export const getOverdueTaskReports = asyncHandler(async (req, res) => {
  const wsId = getWorkspaceId(req);
  const data = await reportsService.getOverdueTaskReports(wsId, req.query);
  return res.status(200).json(new ApiResponse(200, data, 'Overdue task reports fetched successfully'));
});

export const getTeamPerformanceReports = asyncHandler(async (req, res) => {
  const wsId = getWorkspaceId(req);
  const data = await reportsService.getTeamPerformanceReports(wsId);
  return res.status(200).json(new ApiResponse(200, data, 'Team performance reports fetched successfully'));
});

export const getWorkloadReports = asyncHandler(async (req, res) => {
  const wsId = getWorkspaceId(req);
  const data = await reportsService.getWorkloadReports(wsId);
  return res.status(200).json(new ApiResponse(200, data, 'Workload reports fetched successfully'));
});

export const getProductivityReports = asyncHandler(async (req, res) => {
  const wsId = getWorkspaceId(req);
  const data = await reportsService.getProductivityReports(wsId, req.query);
  return res.status(200).json(new ApiResponse(200, data, 'Productivity reports fetched successfully'));
});

export const getActivityReports = asyncHandler(async (req, res) => {
  const wsId = getWorkspaceId(req);
  const data = await reportsService.getActivityReports(wsId, req.query);
  return res.status(200).json(new ApiResponse(200, data, 'Activity reports fetched successfully'));
});

export const getBurndownReports = asyncHandler(async (req, res) => {
  const wsId = getWorkspaceId(req);
  const data = await reportsService.getBurndownReports(wsId, req.query);
  return res.status(200).json(new ApiResponse(200, data, 'Burndown reports fetched successfully'));
});

export const exportReports = asyncHandler(async (req, res) => {
  const wsId = getWorkspaceId(req);
  const data = await reportsService.exportReports(wsId, req.query);

  if (req.query.format === 'csv' || req.headers.accept?.includes('text/csv')) {
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${data.filename}"`);
    return res.status(200).send(data.content);
  }

  return res.status(200).json(new ApiResponse(200, data, 'Reports exported successfully'));
});
