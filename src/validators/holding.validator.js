import { z } from 'zod';

export const retireHoldingSchema = z.object({
  projectId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid Project ID format'),
  credits: z.number().min(0.01, 'Must retire at least 0.01 credits'),
});

export default {
  retireHoldingSchema,
};
