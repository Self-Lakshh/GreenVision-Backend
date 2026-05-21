import Transaction from '../models/Transaction.js';
import { successResponse } from '../utils/apiResponse.js';
import { AppError } from '../middleware/errorHandler.js';
import { paginate } from '../utils/paginate.js';

export const listTransactions = async (req, res) => {
  const { status, projectId, page = 1, limit = 20 } = req.query;
  const filter = { buyerId: req.user.id };

  if (status) {
    filter.paymentStatus = status;
  }

  if (projectId) {
    filter.projectId = projectId;
  }

  const result = await paginate(Transaction, filter, {
    page: Number(page),
    limit: Number(limit),
    sort: { createdAt: -1 },
    populate: [{ path: 'projectId', select: 'title projectType location pricePerCredit' }],
  });

  return res.status(200).json(successResponse(result.data, 'Transactions retrieved successfully', result.meta));
};

export const getTransactionDetails = async (req, res) => {
  const transaction = await Transaction.findById(req.params.id)
    .populate('projectId', 'title projectType location pricePerCredit coordinates description')
    .populate('buyerId', 'fullName email companyName role');

  if (!transaction) {
    throw new AppError('Transaction not found', 404, 'TRANSACTION_NOT_FOUND');
  }

  // Authorize: Must be buyer or admin
  if (req.user.role !== 'admin' && transaction.buyerId._id.toString() !== req.user.id) {
    throw new AppError('Access denied. You do not own this transaction.', 403, 'FORBIDDEN');
  }

  return res.status(200).json(successResponse(transaction, 'Transaction retrieved successfully'));
};

export const getCertificate = async (req, res) => {
  const transaction = await Transaction.findById(req.params.id);
  if (!transaction) {
    throw new AppError('Transaction not found', 404, 'TRANSACTION_NOT_FOUND');
  }

  // Verify ownership
  if (transaction.buyerId.toString() !== req.user.id) {
    throw new AppError('Access denied. You do not own this transaction.', 403, 'FORBIDDEN');
  }

  if (!transaction.certificateUrl) {
    throw new AppError('Certificate has not been generated for this transaction yet.', 400, 'CERTIFICATE_PENDING');
  }

  return res.status(200).json(
    successResponse(
      { certificateUrl: transaction.certificateUrl },
      'Certificate details retrieved successfully'
    )
  );
};

export default {
  listTransactions,
  getTransactionDetails,
  getCertificate,
};
