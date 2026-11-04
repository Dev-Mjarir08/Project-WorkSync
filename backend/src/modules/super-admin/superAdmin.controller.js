import { asyncHandler } from '../../utils/asyncHandler.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import * as superAdminService from './superAdmin.service.js';
import * as memberService from '../members/member.service.js';

// ==========================================
// 1. DASHBOARD OVERVIEW & METRICS
// ==========================================

export const getDashboard = asyncHandler(async (req, res) => {
  const data = await superAdminService.getDashboardOverview();
  return res.status(200).json(new ApiResponse(200, data, 'Platform dashboard fetched successfully'));
});

export const getDashboardStats = asyncHandler(async (req, res) => {
  const data = await superAdminService.getDashboardStats();
  return res.status(200).json(new ApiResponse(200, data, 'Platform statistics fetched successfully'));
});

export const getUserGrowth = asyncHandler(async (req, res) => {
  const days = req.query.days || 30;
  const data = await superAdminService.getUserGrowth(days);
  return res.status(200).json(new ApiResponse(200, data, 'User growth statistics fetched successfully'));
});

export const getWorkspaceGrowth = asyncHandler(async (req, res) => {
  const days = req.query.days || 30;
  const data = await superAdminService.getWorkspaceGrowth(days);
  return res.status(200).json(new ApiResponse(200, data, 'Workspace growth statistics fetched successfully'));
});

export const getRecentUsers = asyncHandler(async (req, res) => {
  const limit = req.query.limit || 10;
  const data = await superAdminService.getRecentUsers(limit);
  return res.status(200).json(new ApiResponse(200, { users: data }, 'Recent users retrieved successfully'));
});

export const getRecentWorkspaces = asyncHandler(async (req, res) => {
  const limit = req.query.limit || 10;
  const data = await superAdminService.getRecentWorkspaces(limit);
  return res.status(200).json(new ApiResponse(200, { workspaces: data }, 'Recent workspaces retrieved successfully'));
});

export const getRecentActivities = asyncHandler(async (req, res) => {
  const limit = req.query.limit || 15;
  const data = await superAdminService.getRecentActivities(limit);
  return res.status(200).json(new ApiResponse(200, { activities: data }, 'Recent activities retrieved successfully'));
});

// ==========================================
// 2. USER MANAGEMENT
// ==========================================

export const getUsers = asyncHandler(async (req, res) => {
  const result = await superAdminService.getAllUsers(req.query);
  return res.status(200).json(new ApiResponse(200, result, 'Users list retrieved successfully'));
});

export const getUserById = asyncHandler(async (req, res) => {
  const user = await superAdminService.getUserById(req.params.userId);
  return res.status(200).json(new ApiResponse(200, { user }, 'User details retrieved successfully'));
});

export const createUser = asyncHandler(async (req, res) => {
  const user = await superAdminService.createUser(req.body, req.user);
  return res.status(201).json(new ApiResponse(201, { user }, 'User account created successfully'));
});

export const updateUser = asyncHandler(async (req, res) => {
  const user = await superAdminService.updateUser(req.params.userId, req.body, req.user);
  return res.status(200).json(new ApiResponse(200, { user }, 'User details updated successfully'));
});

export const updateUserStatus = asyncHandler(async (req, res) => {
  const user = await superAdminService.updateUserStatus(req.params.userId, req.body, req.user);
  return res.status(200).json(new ApiResponse(200, { user }, 'User status updated successfully'));
});

export const updateUserRole = asyncHandler(async (req, res) => {
  const user = await superAdminService.updateUserRole(req.params.userId, req.body.role, req.user);
  return res.status(200).json(new ApiResponse(200, { user }, 'User role updated successfully'));
});

export const deleteUser = asyncHandler(async (req, res) => {
  const result = await superAdminService.deleteUser(req.params.userId, req.user);
  return res.status(200).json(new ApiResponse(200, result, 'User deleted successfully'));
});

export const getUserWorkspaces = asyncHandler(async (req, res) => {
  const data = await superAdminService.getUserWorkspaces(req.params.userId);
  return res.status(200).json(new ApiResponse(200, data, 'User workspaces retrieved successfully'));
});

export const getUserActivities = asyncHandler(async (req, res) => {
  const limit = req.query.limit || 20;
  const data = await superAdminService.getUserActivities(req.params.userId, limit);
  return res.status(200).json(new ApiResponse(200, data, 'User activities history retrieved successfully'));
});

export const getUserSessions = asyncHandler(async (req, res) => {
  const data = await superAdminService.getUserSessions(req.params.userId);
  return res.status(200).json(new ApiResponse(200, data, 'User active sessions retrieved successfully'));
});

export const revokeUserSessions = asyncHandler(async (req, res) => {
  const data = await superAdminService.revokeUserSessions(req.params.userId, req.user);
  return res.status(200).json(new ApiResponse(200, data, 'User sessions revoked successfully'));
});

// ==========================================
// 3. WORKSPACE MANAGEMENT
// ==========================================

export const getWorkspaces = asyncHandler(async (req, res) => {
  const result = await superAdminService.getAllWorkspaces(req.query);
  return res.status(200).json(new ApiResponse(200, result, 'Workspaces retrieved successfully'));
});

export const createWorkspace = asyncHandler(async (req, res) => {
  const workspace = await superAdminService.createWorkspace(req.body, req.user);
  return res.status(201).json(new ApiResponse(201, { workspace }, 'Workspace provisioned successfully'));
});

export const getWorkspaceById = asyncHandler(async (req, res) => {
  const workspace = await superAdminService.getWorkspaceById(req.params.workspaceId);
  return res.status(200).json(new ApiResponse(200, { workspace }, 'Workspace details retrieved successfully'));
});

export const updateWorkspace = asyncHandler(async (req, res) => {
  const workspace = await superAdminService.updateWorkspace(req.params.workspaceId, req.body, req.user);
  return res.status(200).json(new ApiResponse(200, { workspace }, 'Workspace updated successfully'));
});

export const updateWorkspaceStatus = asyncHandler(async (req, res) => {
  const workspace = await superAdminService.updateWorkspaceStatus(req.params.workspaceId, req.body, req.user);
  return res.status(200).json(new ApiResponse(200, { workspace }, 'Workspace status updated successfully'));
});

export const deleteWorkspace = asyncHandler(async (req, res) => {
  const result = await superAdminService.deleteWorkspace(req.params.workspaceId, req.user);
  return res.status(200).json(new ApiResponse(200, result, 'Workspace deleted successfully'));
});

export const getWorkspaceMembers = asyncHandler(async (req, res) => {
  const result = await memberService.getWorkspaceMembers(req.params.workspaceId, req.query);
  return res.status(200).json(new ApiResponse(200, result, 'Workspace members retrieved successfully'));
});

export const getWorkspaceBoards = asyncHandler(async (req, res) => {
  const result = await superAdminService.getWorkspaceBoards(req.params.workspaceId);
  return res.status(200).json(new ApiResponse(200, result, 'Workspace boards retrieved successfully'));
});

export const getWorkspaceActivities = asyncHandler(async (req, res) => {
  const limit = req.query.limit || 20;
  const result = await superAdminService.getWorkspaceActivities(req.params.workspaceId, limit);
  return res.status(200).json(new ApiResponse(200, result, 'Workspace activities retrieved successfully'));
});

export const getWorkspaceAnalytics = asyncHandler(async (req, res) => {
  const result = await superAdminService.getWorkspaceAnalytics(req.params.workspaceId);
  return res.status(200).json(new ApiResponse(200, result, 'Workspace analytics retrieved successfully'));
});

// ==========================================
// 4. WORKSPACE ADMIN MANAGEMENT
// ==========================================

export const getAllAdmins = asyncHandler(async (req, res) => {
  const result = await superAdminService.getAllWorkspaceAdmins(req.query);
  return res.status(200).json(new ApiResponse(200, result, 'All workspace admins retrieved successfully'));
});

export const assignWorkspaceAdmin = asyncHandler(async (req, res) => {
  const result = await superAdminService.assignWorkspaceAdmin(req.params.workspaceId, req.body, req.user);
  return res.status(201).json(new ApiResponse(201, result, 'Workspace admin assigned successfully'));
});

export const getWorkspaceAdmins = asyncHandler(async (req, res) => {
  const result = await superAdminService.getWorkspaceAdminsList(req.params.workspaceId);
  return res.status(200).json(new ApiResponse(200, result, 'Workspace admins retrieved successfully'));
});

export const updateWorkspaceAdmin = asyncHandler(async (req, res) => {
  const result = await superAdminService.updateWorkspaceAdminAssignment(
    req.params.workspaceId,
    req.params.adminId,
    req.body,
    req.user
  );
  return res.status(200).json(new ApiResponse(200, result, 'Workspace admin assignment updated successfully'));
});

export const removeWorkspaceAdmin = asyncHandler(async (req, res) => {
  const result = await superAdminService.removeWorkspaceAdminAssignment(
    req.params.workspaceId,
    req.params.adminId,
    req.user
  );
  return res.status(200).json(new ApiResponse(200, result, 'Workspace admin removed successfully'));
});

// ==========================================
// 5. PLATFORM ROLE & PERMISSION MANAGEMENT
// ==========================================

export const getRoles = asyncHandler(async (req, res) => {
  const roles = await superAdminService.getAllRoles();
  return res.status(200).json(new ApiResponse(200, { roles }, 'Platform roles retrieved successfully'));
});

export const getRoleById = asyncHandler(async (req, res) => {
  const role = await superAdminService.getRoleById(req.params.roleId);
  return res.status(200).json(new ApiResponse(200, { role }, 'Role details retrieved successfully'));
});

export const createRole = asyncHandler(async (req, res) => {
  const role = await superAdminService.createCustomRole(req.body, req.user);
  return res.status(201).json(new ApiResponse(201, { role }, 'Custom role created successfully'));
});

export const updateRole = asyncHandler(async (req, res) => {
  const role = await superAdminService.updateRole(req.params.roleId, req.body, req.user);
  return res.status(200).json(new ApiResponse(200, { role }, 'Role updated successfully'));
});

export const deleteRole = asyncHandler(async (req, res) => {
  const result = await superAdminService.deleteCustomRole(req.params.roleId, req.user);
  return res.status(200).json(new ApiResponse(200, result, 'Role deleted successfully'));
});

export const getPermissions = asyncHandler(async (req, res) => {
  const data = superAdminService.getAllPermissions();
  return res.status(200).json(new ApiResponse(200, data, 'Platform permissions retrieved successfully'));
});

export const updateRolePermissions = asyncHandler(async (req, res) => {
  const role = await superAdminService.updateRolePermissions(req.params.roleId, req.body.permissions, req.user);
  return res.status(200).json(new ApiResponse(200, { role }, 'Role permissions updated successfully'));
});

// ==========================================
// 6. BOARD MANAGEMENT
// ==========================================

export const getBoards = asyncHandler(async (req, res) => {
  const result = await superAdminService.getAllBoards(req.query);
  return res.status(200).json(new ApiResponse(200, result, 'Platform boards retrieved successfully'));
});

export const getBoardById = asyncHandler(async (req, res) => {
  const board = await superAdminService.getBoardById(req.params.boardId);
  return res.status(200).json(new ApiResponse(200, { board }, 'Board details retrieved successfully'));
});

export const updateBoard = asyncHandler(async (req, res) => {
  const board = await superAdminService.updateBoard(req.params.boardId, req.body, req.user);
  return res.status(200).json(new ApiResponse(200, { board }, 'Board updated successfully'));
});

export const updateBoardStatus = asyncHandler(async (req, res) => {
  const board = await superAdminService.updateBoardStatus(req.params.boardId, req.body.isArchived, req.user);
  return res.status(200).json(new ApiResponse(200, { board }, 'Board status updated successfully'));
});

export const deleteBoard = asyncHandler(async (req, res) => {
  const result = await superAdminService.deleteBoard(req.params.boardId, req.user);
  return res.status(200).json(new ApiResponse(200, result, 'Board deleted successfully'));
});

export const getBoardTasks = asyncHandler(async (req, res) => {
  const result = await superAdminService.getBoardTasks(req.params.boardId);
  return res.status(200).json(new ApiResponse(200, result, 'Board tasks retrieved successfully'));
});

// ==========================================
// 7. PLATFORM ANALYTICS
// ==========================================

export const getAnalyticsOverview = asyncHandler(async (req, res) => {
  const data = await superAdminService.getAnalyticsOverview();
  return res.status(200).json(new ApiResponse(200, data, 'Platform analytics overview fetched successfully'));
});

export const getUserAnalytics = asyncHandler(async (req, res) => {
  const data = await superAdminService.getUserAnalytics();
  return res.status(200).json(new ApiResponse(200, data, 'User analytics fetched successfully'));
});

export const getWorkspaceAnalyticsData = asyncHandler(async (req, res) => {
  const data = await superAdminService.getPlatformWorkspaceAnalytics();
  return res.status(200).json(new ApiResponse(200, data, 'Workspace analytics fetched successfully'));
});

export const getBoardAnalytics = asyncHandler(async (req, res) => {
  const data = await superAdminService.getBoardAnalytics();
  return res.status(200).json(new ApiResponse(200, data, 'Board analytics fetched successfully'));
});

export const getTaskAnalytics = asyncHandler(async (req, res) => {
  const data = await superAdminService.getTaskAnalytics();
  return res.status(200).json(new ApiResponse(200, data, 'Task analytics fetched successfully'));
});

export const getActivityAnalytics = asyncHandler(async (req, res) => {
  const data = await superAdminService.getActivityAnalytics();
  return res.status(200).json(new ApiResponse(200, data, 'Platform activity statistics fetched successfully'));
});

export const getEngagementAnalytics = asyncHandler(async (req, res) => {
  const data = await superAdminService.getEngagementAnalytics();
  return res.status(200).json(new ApiResponse(200, data, 'User engagement statistics fetched successfully'));
});

// ==========================================
// 8. AUDIT LOGS
// ==========================================

export const getAuditLogs = asyncHandler(async (req, res) => {
  const result = await superAdminService.getAllAuditLogs(req.query);
  return res.status(200).json(new ApiResponse(200, result, 'Audit logs retrieved successfully'));
});

export const getAuditLogById = asyncHandler(async (req, res) => {
  const log = await superAdminService.getAuditLogById(req.params.logId);
  return res.status(200).json(new ApiResponse(200, { log }, 'Audit log details retrieved successfully'));
});

export const getUserAuditLogs = asyncHandler(async (req, res) => {
  const result = await superAdminService.getUserAuditLogs(req.params.userId, req.query);
  return res.status(200).json(new ApiResponse(200, result, 'User audit logs retrieved successfully'));
});

export const getWorkspaceAuditLogs = asyncHandler(async (req, res) => {
  const result = await superAdminService.getWorkspaceAuditLogs(req.params.workspaceId, req.query);
  return res.status(200).json(new ApiResponse(200, result, 'Workspace audit logs retrieved successfully'));
});

// ==========================================
// 9. ANNOUNCEMENTS
// ==========================================

export const getAnnouncements = asyncHandler(async (req, res) => {
  const result = await superAdminService.getAllAnnouncements(req.query);
  return res.status(200).json(new ApiResponse(200, result, 'Announcements retrieved successfully'));
});

export const createAnnouncement = asyncHandler(async (req, res) => {
  const announcement = await superAdminService.createAnnouncement(req.body, req.user);
  return res.status(201).json(new ApiResponse(201, { announcement }, 'Announcement created successfully'));
});

export const getAnnouncementById = asyncHandler(async (req, res) => {
  const announcement = await superAdminService.getAnnouncementById(req.params.announcementId);
  return res.status(200).json(new ApiResponse(200, { announcement }, 'Announcement details retrieved successfully'));
});

export const updateAnnouncement = asyncHandler(async (req, res) => {
  const announcement = await superAdminService.updateAnnouncement(req.params.announcementId, req.body, req.user);
  return res.status(200).json(new ApiResponse(200, { announcement }, 'Announcement updated successfully'));
});

export const deleteAnnouncement = asyncHandler(async (req, res) => {
  const result = await superAdminService.deleteAnnouncement(req.params.announcementId, req.user);
  return res.status(200).json(new ApiResponse(200, result, 'Announcement deleted successfully'));
});

export const publishAnnouncement = asyncHandler(async (req, res) => {
  const announcement = await superAdminService.publishAnnouncement(req.params.announcementId, req.user);
  return res.status(200).json(new ApiResponse(200, { announcement }, 'Announcement published successfully'));
});

export const archiveAnnouncement = asyncHandler(async (req, res) => {
  const announcement = await superAdminService.archiveAnnouncement(req.params.announcementId, req.user);
  return res.status(200).json(new ApiResponse(200, { announcement }, 'Announcement archived successfully'));
});

// ==========================================
// 10. PLATFORM SETTINGS
// ==========================================

export const getSettings = asyncHandler(async (req, res) => {
  const settings = await superAdminService.getAllSettings();
  return res.status(200).json(new ApiResponse(200, { settings }, 'Platform settings retrieved successfully'));
});

export const updateGeneralSettings = asyncHandler(async (req, res) => {
  const general = await superAdminService.updateGeneralSettings(req.body, req.user);
  return res.status(200).json(new ApiResponse(200, { general }, 'General settings updated successfully'));
});

export const updateSecuritySettings = asyncHandler(async (req, res) => {
  const security = await superAdminService.updateSecuritySettings(req.body, req.user);
  return res.status(200).json(new ApiResponse(200, { security }, 'Security policies updated successfully'));
});

export const updateRegistrationSettings = asyncHandler(async (req, res) => {
  const registration = await superAdminService.updateRegistrationSettings(req.body, req.user);
  return res.status(200).json(new ApiResponse(200, { registration }, 'Registration settings updated successfully'));
});

export const updateNotificationSettings = asyncHandler(async (req, res) => {
  const notifications = await superAdminService.updateNotificationSettings(req.body, req.user);
  return res.status(200).json(new ApiResponse(200, { notifications }, 'Notification settings updated successfully'));
});

export const getSecurityConfiguration = asyncHandler(async (req, res) => {
  const data = await superAdminService.getSecurityConfiguration();
  return res.status(200).json(new ApiResponse(200, data, 'Security configuration retrieved successfully'));
});

// ==========================================
// 11. SYSTEM HEALTH & MONITORING
// ==========================================

export const getSystemHealth = asyncHandler(async (req, res) => {
  const data = await superAdminService.getOverallSystemHealth();
  return res.status(200).json(new ApiResponse(200, data, 'Overall system health fetched successfully'));
});

export const getSystemDatabase = asyncHandler(async (req, res) => {
  const data = await superAdminService.getDatabaseStatus();
  return res.status(200).json(new ApiResponse(200, data, 'MongoDB connection status fetched successfully'));
});

export const getSystemCache = asyncHandler(async (req, res) => {
  const data = await superAdminService.getCacheStatus();
  return res.status(200).json(new ApiResponse(200, data, 'Cache status fetched successfully'));
});

export const getSystemSockets = asyncHandler(async (req, res) => {
  const data = await superAdminService.getSocketConnections();
  return res.status(200).json(new ApiResponse(200, data, 'Active socket connections fetched successfully'));
});

export const getSystemMetrics = asyncHandler(async (req, res) => {
  const data = await superAdminService.getSystemMetrics();
  return res.status(200).json(new ApiResponse(200, data, 'System performance metrics fetched successfully'));
});

// ==========================================
// 12. SUPER ADMIN PROFILE
// ==========================================

export const getProfile = asyncHandler(async (req, res) => {
  const profile = await superAdminService.getAdminProfile(req.user._id);
  return res.status(200).json(new ApiResponse(200, { profile }, 'Profile details retrieved successfully'));
});

export const updateProfile = asyncHandler(async (req, res) => {
  const profile = await superAdminService.updateAdminProfile(req.user._id, req.body);
  return res.status(200).json(new ApiResponse(200, { profile }, 'Profile details updated successfully'));
});

export const updateAvatar = asyncHandler(async (req, res) => {
  const result = await superAdminService.updateAdminAvatar(req.user._id, req.body.avatar);
  return res.status(200).json(new ApiResponse(200, result, 'Profile avatar updated successfully'));
});

export const changePassword = asyncHandler(async (req, res) => {
  const result = await superAdminService.changeAdminPassword(req.user._id, req.body);
  return res.status(200).json(new ApiResponse(200, result, 'Password changed successfully'));
});

export const getProfileSessions = asyncHandler(async (req, res) => {
  const data = await superAdminService.getAdminSessions(req.user._id);
  return res.status(200).json(new ApiResponse(200, data, 'Active sessions retrieved successfully'));
});

export const revokeProfileSession = asyncHandler(async (req, res) => {
  const result = await superAdminService.revokeAdminSession(req.user._id, req.params.sessionId);
  return res.status(200).json(new ApiResponse(200, result, 'Session revoked successfully'));
});
