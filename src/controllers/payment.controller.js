import paymentService from '../services/payment.service.js';
import { successResponse } from '../utils/apiResponse.js';

export const createRazorpayOrder = async (req, res) => {
  const { projectId, credits } = req.body;
  const result = await paymentService.createOrder(req.user.id, projectId, credits);
  return res.status(200).json(successResponse(result, 'Razorpay order created successfully'));
};

export const verifyRazorpayPayment = async (req, res) => {
  const { orderId, paymentId, signature } = req.body;
  const transaction = await paymentService.verifyPayment(req.user.id, {
    orderId,
    paymentId,
    signature,
  });
  return res.status(200).json(successResponse(transaction, 'Payment verified and transaction completed successfully'));
};

export const handleRazorpayWebhook = async (req, res) => {
  const signature = req.headers['x-razorpay-signature'];
  // req.body is a buffer when mounted with express.raw
  const rawBody = req.body;
  
  const result = await paymentService.handleWebhook(rawBody, signature);
  return res.status(200).json(successResponse(result, 'Webhook processed successfully'));
};

export default {
  createRazorpayOrder,
  verifyRazorpayPayment,
  handleRazorpayWebhook,
};
