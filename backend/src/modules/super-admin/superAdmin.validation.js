import { z } from 'zod';
import { ROLE_VALUES } from '../../constants/roles.js';

// MongoDB ObjectId validation regex (24-character hexadecimal)
const OBJECT_ID_REGEX = /^[0-9a-fA-F]{24}$/;

/**
 * Validation schema for routes containing :userId in URL params
 */
export const userIdParamSchema = z.object({
  userId: z
    .string({ error: 'User ID is required' })
    .trim()
    .regex(OBJECT_ID_REGEX, 'Invalid user ID format. Must be a 24-character hexadecimal ObjectId.')
});

/**
 * Validation schema for updating user active/inactive status
 */
export const updateUserStatusSchema = z.object({
  isActive: z
    .boolean({ error: 'isActive must be a boolean (true or false)' })
    .optional()
});

/**
 * Validation schema for updating user platform role
 */
export const updateUserRoleSchema = z.object({
  role: z.enum(ROLE_VALUES, {
    error: `Role must be one of: ${ROLE_VALUES.join(', ')}`
  })
});

/**
 * Validation schema for creating a new user by super admin
 */
export const createUserSchema = z.object({
  name: z
    .string({ error: 'Name is required' })
    .trim()
    .min(2, 'Name must be at least 2 characters long')
    .max(50, 'Name cannot exceed 50 characters'),
  email: z
    .string({ error: 'Email is required' })
    .trim()
    .email('Please provide a valid email address')
    .toLowerCase(),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters long')
    .optional(),
  role: z
    .enum(ROLE_VALUES, {
      error: `Role must be one of: ${ROLE_VALUES.join(', ')}`
    })
    .optional()
    .default('member'),
  bio: z
    .string()
    .max(200, 'Bio cannot exceed 200 characters')
    .optional(),
  avatar: z
    .string()
    .url('Avatar must be a valid URL')
    .or(z.literal(''))
    .optional()
});

/**
 * Validation schema for fetching users list with query filters & pagination
 */
export const getUsersQuerySchema = z.object({
  search: z.string().optional().default(''),
  role: z.string().optional().default('all'),
  status: z.string().optional().default('all'),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
  sortBy: z.string().optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc')
});

/**
 * Validation schema for routes containing :workspaceId in URL params
 */
export const workspaceIdParamSchema = z.object({
  workspaceId: z
    .string({ error: 'Workspace ID is required' })
    .trim()
    .min(1, 'Workspace ID cannot be empty')
});

/**
 * Validation schema for updating workspace status
 */
export const updateWorkspaceStatusSchema = z.object({
  status: z.enum(['Active', 'Archived', 'Suspended']).optional(),
  isActive: z.boolean().optional()
});

/**
 * Validation schema for provisioning workspace by super admin
 */
export const createWorkspaceSchema = z.object({
  name: z
    .string({ error: 'Workspace name is required' })
    .trim()
    .min(2, 'Workspace name must be at least 2 characters long')
    .max(100, 'Workspace name cannot exceed 100 characters'),
  slug: z.string().trim().optional(),
  description: z.string().max(500).optional(),
  ownerName: z.string().trim().optional(),
  ownerEmail: z.string().trim().email('Invalid owner email address').optional(),
  plan: z.enum(['Starter', 'Pro', 'Enterprise']).optional().default('Pro')
});

/**
 * Validation schema for fetching workspaces list with query filters & pagination
 */
export const getWorkspacesQuerySchema = z.object({
  search: z.string().optional().default(''),
  status: z.string().optional().default('all'),
  plan: z.string().optional().default('all'),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
  sortBy: z.string().optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc')
});

/**
 * Validation schema for audit logs query filters & pagination
 */
export const getAuditLogsQuerySchema = z.object({
  search: z.string().optional().default(''),
  category: z.string().optional().default('all'),
  status: z.string().optional().default('all'),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
  sortBy: z.string().optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc')
});

/**
 * Validation schema for updating platform settings
 */
export const updatePlatformSettingsSchema = z.object({
  general: z
    .object({
      platformName: z.string().trim().min(1).optional(),
      supportEmail: z.string().trim().email().optional(),
      maintenanceMode: z.boolean().optional(),
      allowNewRegistrations: z.boolean().optional(),
      defaultUserRole: z.string().optional(),
      sessionTimeoutMinutes: z.coerce.number().int().positive().optional()
    })
    .optional(),
  security: z
    .object({
      enforceMfa: z.boolean().optional(),
      requireStrongPasswords: z.boolean().optional(),
      maxLoginAttempts: z.coerce.number().int().positive().optional(),
      ipWhitelistEnabled: z.boolean().optional(),
      tokenExpiryDays: z.coerce.number().int().positive().optional()
    })
    .optional(),
  storage: z
    .object({
      maxAttachmentSizeMb: z.coerce.number().int().positive().optional(),
      workspaceQuotaGb: z.coerce.number().int().positive().optional(),
      retentionDays: z.coerce.number().int().positive().optional()
    })
    .optional()
});

export default {
  userIdParamSchema,
  updateUserStatusSchema,
  updateUserRoleSchema,
  createUserSchema,
  getUsersQuerySchema,
  workspaceIdParamSchema,
  updateWorkspaceStatusSchema,
  createWorkspaceSchema,
  getWorkspacesQuerySchema,
  getAuditLogsQuerySchema,
  updatePlatformSettingsSchema
};
