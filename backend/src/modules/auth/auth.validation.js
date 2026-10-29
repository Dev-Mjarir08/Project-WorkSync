import { z } from 'zod';
import { ROLE_VALUES } from '../../constants/roles.js';

export const registerSchema = z.object({
  name: z
    .string({ error: 'Name is required' })
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name cannot exceed 50 characters'),
  email: z
    .string({ error: 'Email is required' })
    .trim()
    .email('Please provide a valid email address')
    .toLowerCase(),
  password: z
    .string({ error: 'Password is required' })
    .min(6, 'Password must be at least 6 characters long'),
  role: z
    .enum(ROLE_VALUES, {
      error: `Role must be one of: ${ROLE_VALUES.join(', ')}`
    })
    .optional()
});

export const loginSchema = z.object({
  email: z
    .string({ error: 'Email is required' })
    .trim()
    .email('Please provide a valid email address')
    .toLowerCase(),
  password: z
    .string({ error: 'Password is required' })
    .min(1, 'Password is required')
});

export const updateProfileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name cannot exceed 50 characters')
    .optional(),
  avatar: z
    .string()
    .url('Avatar must be a valid URL')
    .or(z.literal(''))
    .optional(),
  bio: z
    .string()
    .max(200, 'Bio cannot exceed 200 characters')
    .optional()
});

export const changePasswordSchema = z.object({
  currentPassword: z
    .string({ error: 'Current password is required' })
    .min(6, 'Current password must be at least 6 characters'),
  newPassword: z
    .string({ error: 'New password is required' })
    .min(6, 'New password must be at least 6 characters')
});

export default {
  registerSchema,
  loginSchema,
  updateProfileSchema,
  changePasswordSchema
};
