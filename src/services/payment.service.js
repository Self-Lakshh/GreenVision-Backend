import crypto from 'crypto';
import mongoose from 'mongoose';
import razorpay from '../config/razorpay.js';
import Project from '../models/Project.js';
import Transaction from '../models/Transaction.js';
import CreditHolding from '../models/CreditHolding.js';
import Notification from '../models/Notification.js';
import pointsService from './points.service.js';
import certificateService from './certificate.service.js';
import { AppError } from '../middleware/errorHandler.js';
import logger from '../utils/logger.js';

export const createOrder = async (userId, projectId, credits) => {
  const project = await Project.findById(projectId);
  if (!project || project.status !== 'verified') {
    throw new AppError('Project not available for purchase', 400, 'PROJECT_UNAVAILABLE');
  }
  if (project.availableCredits < credits) {
    throw new AppError('Insufficient credits available', 400, 'INSUFFICIENT_CREDITS');
  }

  const totalAmount = credits * project.pricePerCredit;
  const gstAmount = Math.round(totalAmount * 0.18 * 100) / 100;
  const grandTotal = totalAmount + gstAmount;

  // Create Razorpay Order
  const razorpayOrder = await razorpay.orders.create({
    amount: Math.round(grandTotal * 100), // convert to paise
    currency: 'INR',
    receipt: `rcpt_${Date.now()}`,
    notes: {
      projectId: projectId.toString(),
      credits: credits.toString(),
      userId: userId.toString(),
    },
  });

  // Save Transaction as Pending
  const transaction = await Transaction.create({
    buyerId: userId,
    projectId,
    creditsPurchased: credits,
    pricePerCreditSnapshot: project.pricePerCredit,
    totalAmount,
    gstAmount,
    razorpayOrderId: razorpayOrder.id,
    paymentStatus: 'pending',
  });

  return {
    orderId: razorpayOrder.id,
    amount: razorpayOrder.amount,
    currency: 'INR',
    keyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_nirmalcarbonkeyid',
    transactionId: transaction._id,
  };
};

export const verifyPayment = async (userId, { orderId, paymentId, signature }) => {
  const secret = process.env.RAZORPAY_KEY_SECRET || 'razorpay_key_secret_nirmalcarbonsecret';
  
  // Build expected HMAC signature
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');

  if (expectedSignature !== signature) {
    throw new AppError('Payment signature verification failed', 400, 'SIGNATURE_INVALID');
  }

  const transaction = await Transaction.findOne({ razorpayOrderId: orderId, buyerId: userId });
  if (!transaction) {
    throw new AppError('Transaction not found', 404, 'TRANSACTION_NOT_FOUND');
  }

  // Idempotency: Return transaction immediately if already completed
  if (transaction.paymentStatus === 'completed') {
    return transaction;
  }

  return await executePaymentCompletion(userId, orderId, paymentId, signature);
};

// Internal payment completion flow wrapped in MongoDB transaction
const executePaymentCompletion = async (userId, orderId, paymentId, signature) => {
  let session = null;
  let useTransaction = true;

  try {
    session = await mongoose.startSession();
    session.startTransaction();
  } catch (err) {
    logger.warn('MongoDB Transactions/Sessions not supported in this environment. Falling back to non-transactional execution.');
    useTransaction = false;
    session = null;
  }

  try {
    const opts = useTransaction ? { session } : {};

    // 1. Retrieve transaction and project
    const transaction = await Transaction.findOne({ razorpayOrderId: orderId }).session(session);
    if (!transaction) {
      throw new AppError('Transaction not found', 404, 'TRANSACTION_NOT_FOUND');
    }

    const project = await Project.findById(transaction.projectId).session(session);
    if (!project) {
      throw new AppError('Associated project not found', 404, 'PROJECT_NOT_FOUND');
    }

    // 2. Update transaction status
    transaction.paymentStatus = 'completed';
    transaction.razorpayPaymentId = paymentId;
    transaction.razorpaySignature = signature;
    await transaction.save(opts);

    // 3. Decrement available credits, increment totalSold and totalRevenue
    project.availableCredits = Math.max(0, project.availableCredits - transaction.creditsPurchased);
    project.totalSold += transaction.creditsPurchased;
    project.totalRevenue += transaction.totalAmount;
    if (project.availableCredits === 0) {
      project.status = 'sold_out';
    }
    await project.save(opts);

    // 4. Upsert CreditHolding
    let holding = await CreditHolding.findOne({ userId, projectId: project._id }).session(session);
    if (holding) {
      // Recalculate average price paid
      const existingCredits = holding.creditsOwned;
      const existingAvgPrice = holding.avgPricePaid;
      const newCredits = transaction.creditsPurchased;
      const newPrice = transaction.pricePerCreditSnapshot;

      const totalCredits = existingCredits + newCredits;
      const newAvgPricePaid = totalCredits > 0 
        ? ((existingCredits * existingAvgPrice) + (newCredits * newPrice)) / totalCredits 
        : newPrice;

      holding.creditsOwned += newCredits;
      holding.avgPricePaid = Math.round(newAvgPricePaid * 100) / 100;
      holding.lastTransactionId = transaction._id;
      await holding.save(opts);
    } else {
      holding = await CreditHolding.create([{
        userId,
        projectId: project._id,
        creditsOwned: transaction.creditsPurchased,
        avgPricePaid: transaction.pricePerCreditSnapshot,
        lastTransactionId: transaction._id,
      }], opts);
    }

    // 5. Award Loyalty Points
    await pointsService.awardPoints(userId, transaction.creditsPurchased, session);

    // Commit Transaction
    if (useTransaction && session) {
      await session.commitTransaction();
    }

    // Create in-app Notification (Non-blocking or outside transaction)
    await Notification.create({
      userId,
      type: 'transaction',
      title: 'Purchase Successful',
      message: `You successfully purchased ${transaction.creditsPurchased} tCO₂e credits from the "${project.title}" project.`,
      entityType: 'Transaction',
      entityId: transaction._id,
    });

    // Fire certificate generation (async, non-blocking)
    certificateService.generateCertificate(transaction._id)
      .catch((err) => logger.error(`Error in background certificate generation: ${err.message}`));

    // Fetch refreshed transaction details
    const updatedTransaction = await Transaction.findById(transaction._id);
    return updatedTransaction;
  } catch (error) {
    if (useTransaction && session) {
      await session.abortTransaction();
    }
    logger.error(`Failed to execute payment completion atomically: ${error.message}`);
    throw error;
  } finally {
    if (session) {
      session.endSession();
    }
  }
};

export const handleWebhook = async (rawBody, razorpaySignature) => {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET || 'razorpay_webhook_secret_nirmalcarbonwebhook';
  
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(rawBody)
    .digest('hex');

  if (expectedSignature !== razorpaySignature) {
    throw new AppError('Webhook signature invalid', 400, 'WEBHOOK_SIGNATURE_INVALID');
  }

  const event = JSON.parse(rawBody.toString());
  logger.info(`Received Razorpay webhook event: ${event.event}`);

  if (event.event === 'payment.captured') {
    const paymentEntity = event.payload.payment.entity;
    const orderId = paymentEntity.order_id;
    const paymentId = paymentEntity.id;

    const transaction = await Transaction.findOne({ razorpayOrderId: orderId });
    if (!transaction) {
      logger.warn(`Transaction for Razorpay Order ${orderId} not found during webhook processing`);
      return { status: 'ignored', reason: 'transaction_not_found' };
    }

    if (transaction.paymentStatus === 'completed') {
      return { status: 'ignored', reason: 'already_completed' };
    }

    // Capture payment atomically
    await executePaymentCompletion(transaction.buyerId, orderId, paymentId, 'webhook_verified');
    return { status: 'success' };
  }

  if (event.event === 'payment.failed') {
    const paymentEntity = event.payload.payment.entity;
    const orderId = paymentEntity.order_id;

    await Transaction.findOneAndUpdate(
      { razorpayOrderId: orderId },
      { $set: { paymentStatus: 'failed' } }
    );
    return { status: 'failed_marked' };
  }

  return { status: 'ignored', reason: 'event_unhandled' };
};

export default {
  createOrder,
  verifyPayment,
  handleWebhook,
};
