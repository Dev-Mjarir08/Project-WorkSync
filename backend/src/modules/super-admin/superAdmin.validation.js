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

export default {
  userIdParamSchema,
  updateUserStatusSchema,
  updateUserRoleSchema,
  createUserSchema,
  getUsersQuerySchema
};
