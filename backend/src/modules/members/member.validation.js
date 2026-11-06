import { z } from 'zod';

const OBJECT_ID_REGEX = /^[0-9a-fA-F]{24}$/;

export const memberIdParamSchema = z.object({
  memberId: z
    .string({ error: 'Member ID is required' })
    .trim()
    .min(1, 'Member ID is required')
});

export const addMemberSchema = z.object({
  email: z
    .string()
    .trim()
    .email('Please provide a valid email address')
    .toLowerCase()
    .optional(),
  userId: z
    .string()
    .trim()
    .regex(OBJECT_ID_REGEX, 'Invalid user ID format')
    .optional(),
  role: z
    .enum(['admin', 'member', 'viewer', 'owner'], {
      error: 'Role must be one of: admin, member, viewer, owner'
    })
    .default('member'),
  workspaceId: z
    .string()
    .optional()
}).refine(data => data.email || data.userId, {
  message: 'Either email or userId must be provided to add a member'
});

export const updateMemberRoleSchema = z.object({
  role: z.enum(['admin', 'member', 'viewer', 'owner'], {
    error: 'Role must be one of: admin, member, viewer, owner'
  })
});

export const inviteMemberSchema = z.object({
  email: z
    .string({ error: 'Email is required' })
    .trim()
    .email('Please provide a valid email address')
    .toLowerCase(),
  role: z
    .enum(['admin', 'member', 'viewer'], {
      error: 'Role must be one of: admin, member, viewer'
    })
    .default('member'),
  message: z
    .string()
    .max(300, 'Message cannot exceed 300 characters')
    .optional(),
  workspaceId: z
    .string()
    .optional()
});

export const invitationIdParamSchema = z.object({
  invitationId: z
    .string({ error: 'Invitation ID is required' })
    .trim()
    .min(1, 'Invitation ID is required')
});