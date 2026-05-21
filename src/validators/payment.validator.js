import { z } from 'zod';

export const createOrderSchema = z.object({
  projectId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid Project ID format'),
  credits: z.number().min(0.01, 'Must purchase at least 0.01 credits'),
});

export const verifyPaymentSchema = z.object({
  orderId: z.string().min(1, 'Razorpay Order ID is required'),
  paymentId: z.string().min(1, 'Razorpay Payment ID is required'),
  signature: z.string().min(1, 'Razorpay Signature is required'),
});

export default {
  createOrderSchema,
  verifyPaymentSchema,
};
