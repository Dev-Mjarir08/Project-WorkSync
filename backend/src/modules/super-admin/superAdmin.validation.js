import { z } from 'zod';
import mongoose from 'mongoose';
import { ROLE_VALUES } from '../../constants/roles.js';

// Helper for validating MongoDB ObjectId strings
const objectIdSchema = z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), {
  message: 'Invalid ID format. Must be a 24-character hexadecimal ObjectId'
});

// Generic ID param schemas
export const userIdParamSchema = z.object({
  userId: objectIdSchema
});

export const workspaceIdParamSchema = z.object({
  workspaceId: z.string().trim().min(1, 'Workspace identifier is required')
});

export const roleIdParamSchema = z.object({
  roleId: z.string().trim().min(1, 'Role identifier is required')
});

export const boardIdParamSchema = z.object({
  boardId: objectIdSchema
});

export const logIdParamSchema = z.object({
  logId: objectIdSchema
});

export const announcementIdParamSchema = z.object({
  announcementId: objectIdSchema
});

export const adminParamSchema = z.object({
  workspaceId: z.string().trim().min(1, 'Workspace identifier is required'),
  adminId: z.string().trim().min(1, 'Admin identifier is required')
});

export const sessionIdParamSchema = z.object({
  sessionId: z.string().trim().min(1, 'Session ID is required')
});

// ==========================================
// 1. DASHBOARD SCHEMAS
// ==========================================
export const dashboardQuerySchema = z.object({
  days: z.coerce.number().int().positive().optional().default(30),
  limit: z.coerce.number().int().positive().max(50).optional().default(5)
});

// ==========================================
// 2. USER MANAGEMENT SCHEMAS
// ==========================================
export const getUsersQuerySchema = z.object({
  search: z.string().optional().default(''),
  role: z.string().optional().default('all'),
  status: z.string().optional().default('all'),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
  sortBy: z.string().optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc')
});

export const createUserSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(50),
  email: z.string().trim().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(ROLE_VALUES).optional().default('member'),
  bio: z.string().max(200).optional().default('')
});

export const updateUserSchema = z.object({
  name: z.string().trim().min(2).max(50).optional(),
  email: z.string().trim().email().optional(),
  bio: z.string().max(200).optional(),
  avatar: z.string().trim().optional()
});

export const updateUserStatusSchema = z.object({
  isActive: z.boolean().optional(),
  status: z.string().optional()
});

export const updateUserRoleSchema = z.object({
  role: z.enum(ROLE_VALUES, {
    errorMap: () => ({ message: 'Invalid platform role specified' })
  })
});

// ==========================================
// 3. WORKSPACE MANAGEMENT SCHEMAS
// ==========================================
export const getWorkspacesQuerySchema = z.object({
  search: z.string().optional().default(''),
  status: z.string().optional().default('all'),
  plan: z.string().optional().default('all'),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
  sortBy: z.string().optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc')
});

export const createWorkspaceSchema = z.object({
  name: z.string().trim().min(2, 'Workspace name must be at least 2 characters').max(100),
  slug: z.string().trim().optional(),
  description: z.string().max(500).optional().default(''),
  ownerName: z.string().trim().optional(),
  ownerEmail: z.string().trim().email('Invalid owner email address').optional(),
  plan: z.enum(['Starter', 'Pro', 'Enterprise']).optional().default('Pro')
});

export const updateWorkspaceSchema = z.object({
  name: z.string().trim().min(2).max(100).optional(),
  slug: z.string().trim().optional(),
  description: z.string().max(500).optional(),
  plan: z.enum(['Starter', 'Pro', 'Enterprise']).optional(),
  storageUsed: z.string().optional()
});

export const updateWorkspaceStatusSchema = z.object({
  status: z.enum(['Active', 'Archived', 'Suspended']).optional(),
  isActive: z.boolean().optional()
});

// ==========================================
// 4. WORKSPACE ADMIN MANAGEMENT SCHEMAS
// ==========================================
export const assignWorkspaceAdminSchema = z.object({
  userId: objectIdSchema.optional(),
  email: z.string().trim().email().optional(),
  role: z.enum(['admin', 'owner']).optional().default('admin')
}).refine(data => data.userId || data.email, {
  message: 'Either userId or email must be provided to assign workspace admin'
});

export const updateWorkspaceAdminSchema = z.object({
  role: z.enum(['admin', 'owner', 'member', 'viewer']).optional().default('admin'),
  status: z.enum(['active', 'suspended']).optional()
});

// ==========================================
// 5. PLATFORM ROLE & PERMISSION SCHEMAS
// ==========================================
export const createRoleSchema = z.object({
  name: z.string().trim().min(2, 'Role name must be at least 2 characters').max(50),
  slug: z.string().trim().optional(),
  description: z.string().max(200).optional().default(''),
  permissions: z.array(z.string().trim()).optional().default([])
});

export const updateRoleSchema = z.object({
  name: z.string().trim().min(2).max(50).optional(),
  description: z.string().max(200).optional(),
  permissions: z.array(z.string().trim()).optional()
});

export const updateRolePermissionsSchema = z.object({
  permissions: z.array(z.string().trim()).min(1, 'At least one permission must be specified')
});

// ==========================================
// 6. BOARD MANAGEMENT SCHEMAS
// ==========================================
export const getBoardsQuerySchema = z.object({
  search: z.string().optional().default(''),
  workspaceId: z.string().optional(),
  isArchived: z.preprocess((val) => {
    if (val === 'true') return true;
    if (val === 'false') return false;
    return val;
  }, z.boolean().optional()),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20)
});

export const updateBoardSchema = z.object({
  name: z.string().trim().min(1, 'Board name cannot be empty').max(100).optional(),
  description: z.string().max(500).optional()
});

export const updateBoardStatusSchema = z.object({
  isArchived: z.boolean()
});

// ==========================================
// 7. PLATFORM ANALYTICS SCHEMAS
// ==========================================
export const analyticsQuerySchema = z.object({
  range: z.enum(['7d', '30d', '90d', '1y']).optional().default('30d')
});

// ==========================================
// 8. AUDIT LOGS SCHEMAS
// ==========================================
export const getAuditLogsQuerySchema = z.object({
  search: z.string().optional().default(''),
  category: z.string().optional().default('all'),
  status: z.string().optional().default('all'),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
  sortBy: z.string().optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc')
});

// ==========================================
// 9. ANNOUNCEMENTS SCHEMAS
// ==========================================
export const getAnnouncementsQuerySchema = z.object({
  search: z.string().optional().default(''),
  status: z.string().optional().default('all'),
  priority: z.string().optional().default('all'),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(50).optional().default(20)
});

export const createAnnouncementSchema = z.object({
  title: z.string().trim().min(3, 'Title must be at least 3 characters').max(200),
  content: z.string().trim().min(5, 'Content must be at least 5 characters'),
  priority: z.enum(['low', 'normal', 'high', 'urgent']).optional().default('normal'),
  targetAudience: z.enum(['all', 'admins', 'members']).optional().default('all'),
  tags: z.array(z.string().trim()).optional().default([]),
  publishImmediately: z.boolean().optional().default(false)
});

export const updateAnnouncementSchema = z.object({
  title: z.string().trim().min(3).max(200).optional(),
  content: z.string().trim().min(5).optional(),
  priority: z.enum(['low', 'normal', 'high', 'urgent']).optional(),
  targetAudience: z.enum(['all', 'admins', 'members']).optional(),
  tags: z.array(z.string().trim()).optional(),
  status: z.enum(['draft', 'published', 'archived']).optional()
});

// ==========================================
// 10. PLATFORM SETTINGS SCHEMAS
// ==========================================
export const updateGeneralSettingsSchema = z.object({
  platformName: z.string().trim().min(1).optional(),
  supportEmail: z.string().trim().email().optional(),
  maintenanceMode: z.boolean().optional(),
  allowNewRegistrations: z.boolean().optional(),
  defaultUserRole: z.string().optional(),
  sessionTimeoutMinutes: z.coerce.number().int().positive().optional()
});

export const updateSecuritySettingsSchema = z.object({
  enforceMfa: z.boolean().optional(),
  requireStrongPasswords: z.boolean().optional(),
  maxLoginAttempts: z.coerce.number().int().positive().optional(),
  ipWhitelistEnabled: z.boolean().optional(),
  tokenExpiryDays: z.coerce.number().int().positive().optional()
});

export const updateRegistrationSettingsSchema = z.object({
  allowNewRegistrations: z.boolean().optional(),
  defaultUserRole: z.string().optional(),
  requireEmailVerification: z.boolean().optional(),
  allowedEmailDomains: z.array(z.string().trim()).optional()
});

export const updateNotificationSettingsSchema = z.object({
  emailAlerts: z.boolean().optional(),
  securityAlerts: z.boolean().optional(),
  digestFrequency: z.string().optional(),
  slackWebhookUrl: z.string().trim().optional()
});

// ==========================================
// 12. SUPER ADMIN PROFILE SCHEMAS
// ==========================================
export const updateProfileSchema = z.object({
  name: z.string().trim().min(2).max(50).optional(),
  bio: z.string().max(200).optional(),
  email: z.string().trim().email().optional()
});

export const updateAvatarSchema = z.object({
  avatar: z.string().trim().min(1, 'Avatar URL or string is required')
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters')
});
