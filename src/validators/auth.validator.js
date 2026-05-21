import { z } from 'zod';

export const registerSchema = z.object({
  fullName: z.string().trim().min(2, { message: 'Full name must be at least 2 characters long' }),
  email: z.string().trim().email({ message: 'Invalid email address' }),
  password: z.string().min(8, { message: 'Password must be at least 8 characters long' }),
  role: z.enum(['individual', 'firm', 'corporate', 'admin']).optional().default('individual'),
  phone: z.string().trim().optional().nullable(),
  companyName: z.string().trim().optional().nullable(),
});

export const loginSchema = z.object({
  email: z.string().trim().email({ message: 'Invalid email address' }),
  password: z.string().min(1, { message: 'Password is required' }),
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(1, { message: 'Refresh token is required' }),
});

export default {
  registerSchema,
  loginSchema,
  refreshSchema,
};
