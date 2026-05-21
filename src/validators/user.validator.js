import { z } from 'zod';

export const updateProfileSchema = z.object({
  fullName: z.string().trim().min(2).optional(),
  bio: z.string().trim().max(500).optional().nullable(),
  phone: z.string().trim().optional().nullable(),
  avatarUrl: z.string().url().optional().nullable(),
  location: z.string().trim().optional().nullable(),
  panNumber: z.string().trim().optional().nullable(),
  gstNumber: z.string().trim().optional().nullable(),
});

export const updatePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters long'),
});

export default {
  updateProfileSchema,
  updatePasswordSchema,
};
