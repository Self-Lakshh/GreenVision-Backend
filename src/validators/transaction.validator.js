import { z } from 'zod';

export const transactionQuerySchema = z.object({
  status: z.enum(['pending', 'completed', 'failed', 'refunded']).optional(),
  projectId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid Project ID format').optional(),
  page: z.string().optional().transform(val => val ? Number(val) : 1),
  limit: z.string().optional().transform(val => val ? Number(val) : 20),
});

export default {
  transactionQuerySchema,
};
