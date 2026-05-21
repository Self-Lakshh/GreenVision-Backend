import { z } from 'zod';

export const updateRoleSchema = z.object({
  role: z.enum(['individual', 'firm', 'corporate', 'admin']),
});

export const rejectProjectSchema = z.object({
  reason: z.string().trim().min(5, 'Rejection reason must be at least 5 characters long'),
});

export default {
  updateRoleSchema,
  rejectProjectSchema,
};
