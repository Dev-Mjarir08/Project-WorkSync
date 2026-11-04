import { z } from 'zod';

export const createProjectSchema = z.object({
  name: z.string().trim().min(2, 'Project name must be at least 2 characters'),
  key: z.string().trim().min(2).max(10).optional(),
  workspace: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid workspace ID'),
  description: z.string().optional().default(''),
  status: z.enum(['planning', 'active', 'on_hold', 'completed', 'archived']).optional().default('active'),
  lead: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid lead ID').optional(),
  members: z.array(z.string().regex(/^[0-9a-fA-F]{24}$/)).optional().default([]),
  startDate: z.string().datetime().optional(),
  dueDate: z.string().datetime().optional()
});

export const updateProjectSchema = z.object({
  name: z.string().trim().min(2).optional(),
  key: z.string().trim().min(2).max(10).optional(),
  description: z.string().optional(),
  status: z.enum(['planning', 'active', 'on_hold', 'completed', 'archived']).optional(),
  lead: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
  members: z.array(z.string().regex(/^[0-9a-fA-F]{24}$/)).optional(),
  startDate: z.string().datetime().optional(),
  dueDate: z.string().datetime().optional()
});

