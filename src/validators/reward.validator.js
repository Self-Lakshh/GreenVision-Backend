import { z } from 'zod';

export const createRewardSchema = z.object({
  name: z.string().trim().min(3, 'Reward name must be at least 3 characters'),
  description: z.string().trim().optional(),
  category: z.enum(['merchandise', 'experience', 'digital', 'donation', 'offset_bundle']),
  pointsRequired: z.number().min(1, 'Points required must be at least 1'),
  imageUrl: z.string().url().optional().nullable(),
  stock: z.number().int().optional().default(-1), // -1 = unlimited
  isActive: z.boolean().optional().default(true),
  partnerName: z.string().trim().optional().nullable(),
  metadata: z.record(z.any()).optional().default({}),
});

export const updateRewardSchema = createRewardSchema.partial();

export default {
  createRewardSchema,
  updateRewardSchema,
};
