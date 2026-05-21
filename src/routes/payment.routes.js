import { Router } from 'express';
import {
  createRazorpayOrder,
  verifyRazorpayPayment,
  handleRazorpayWebhook,
} from '../controllers/payment.controller.js';
import { verifyToken } from '../middleware/auth.js';
import validate from '../middleware/validate.js';
import { createOrderSchema, verifyPaymentSchema } from '../validators/payment.validator.js';
import asyncHandler from '../utils/asyncHandler.js';

const router = Router();

/**
 * @swagger
 * /api/payments/create-order:
 *   post:
 *     operationId: createPaymentOrder
 *     summary: Create a Razorpay Order
 *     description: Initialize a credit purchase transaction. Validates project availability and credit stock. Returns Razorpay Order details.
 *     tags: [Payments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [projectId, credits]
 *             properties:
 *               projectId: { type: string, example: "660c1d6833fe60113c2ea689" }
 *               credits: { type: number, example: 5 }
 *     responses:
 *       200:
 *         description: Razorpay order generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string }
 *                 data:
 *                   type: object
 *                   properties:
 *                     orderId: { type: string }
 *                     amount: { type: integer }
 *                     currency: { type: string }
 *                     keyId: { type: string }
 *                     transactionId: { type: string }
 */
router.post('/create-order', verifyToken, validate(createOrderSchema), asyncHandler(createRazorpayOrder));

/**
 * @swagger
 * /api/payments/verify:
 *   post:
 *     operationId: verifyPaymentDetails
 *     summary: Verify payment signature & complete order
 *     description: Verify Razorpay payment signature using HMAC SHA-256. Decodes order data, executes transactions inside atomic sessions, decrements credit limits, sets holdings, awards points, and starts certificate creation.
 *     tags: [Payments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [orderId, paymentId, signature]
 *             properties:
 *               orderId: { type: string, example: "order_Nt0M8a7X8qB24h" }
 *               paymentId: { type: string, example: "pay_Nt0MIDnS01rN6l" }
 *               signature: { type: string, example: "9f939e6a987efc8f7d983cf4a..." }
 *     responses:
 *       200:
 *         description: Payment verified successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string }
 *                 data:
 *                   type: object
 */
router.post('/verify', verifyToken, validate(verifyPaymentSchema), asyncHandler(verifyRazorpayPayment));

/**
 * @swagger
 * /api/payments/webhook:
 *   post:
 *     operationId: receiveRazorpayWebhook
 *     summary: Razorpay webhook callback
 *     description: Direct public callback endpoint for Razorpay event integration. Processes payments captured and failed asynchronously.
 *     tags: [Payments]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Webhook processed
 */
router.post('/webhook', asyncHandler(handleRazorpayWebhook));

export default router;
