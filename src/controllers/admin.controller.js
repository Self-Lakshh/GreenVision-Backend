import User from '../models/User.js';
import Project from '../models/Project.js';
import Transaction from '../models/Transaction.js';
import { successResponse } from '../utils/apiResponse.js';
import { AppError } from '../middleware/errorHandler.js';
import { paginate } from '../utils/paginate.js';

export const listAllUsers = async (req, res) => {
  const { role, search, page = 1, limit = 20 } = req.query;
  const filter = { deletedAt: null };

  if (role) {
    filter.role = role;
  }

  if (search) {
    filter.$or = [
      { fullName: new RegExp(search, 'i') },
      { email: new RegExp(search, 'i') },
      { companyName: new RegExp(search, 'i') },
    ];
  }

  const result = await paginate(User, filter, {
    page: Number(page),
    limit: Number(limit),
    sort: { createdAt: -1 },
  });

  // Sanitize password hashes and sensitive information
  const sanitizedUsers = result.data.map((u) => {
    const obj = u.toObject();
    delete obj.passwordHash;
    delete obj.__v;
    return obj;
  });

  return res.status(200).json(successResponse(sanitizedUsers, 'Users retrieved successfully', result.meta));
};

export const updateUserRole = async (req, res) => {
  const { role } = req.body;
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { $set: { role } },
    { new: true, runValidators: true }
  );

  if (!user || user.deletedAt) {
    throw new AppError('User not found', 404, 'USER_NOT_FOUND');
  }

  const obj = user.toObject();
  delete obj.passwordHash;

  return res.status(200).json(successResponse(obj, 'User role updated successfully'));
};

export const toggleUserSuspension = async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user || user.deletedAt) {
    throw new AppError('User not found', 404, 'USER_NOT_FOUND');
  }

  // Prevent self suspension
  if (user._id.toString() === req.user.id) {
    throw new AppError('Cannot suspend your own administrator account', 400, 'SELF_SUSPENSION_BLOCKED');
  }

  user.isActive = !user.isActive;
  await user.save();

  const statusText = user.isActive ? 'activated' : 'suspended';
  return res.status(200).json(successResponse(user, `User account ${statusText} successfully`));
};

export const getPendingProjects = async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const filter = { status: 'pending', deletedAt: null };

  const result = await paginate(Project, filter, {
    page: Number(page),
    limit: Number(limit),
    sort: { createdAt: 1 }, // Oldest first
    populate: [{ path: 'firmId', select: 'fullName companyName email location' }],
  });

  return res.status(200).json(successResponse(result.data, 'Pending verification queue retrieved', result.meta));
};

export const listAllTransactions = async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  
  const result = await paginate(Transaction, {}, {
    page: Number(page),
    limit: Number(limit),
    sort: { createdAt: -1 },
    populate: [
      { path: 'buyerId', select: 'fullName email role companyName' },
      { path: 'projectId', select: 'title projectType location pricePerCredit' },
    ],
  });

  return res.status(200).json(successResponse(result.data, 'All transactions retrieved', result.meta));
};

export const getPlatformAnalytics = async (req, res) => {
  // Aggregate Project types distribution
  const typeDistribution = await Project.aggregate([
    { $match: { deletedAt: null } },
    { $group: { _id: '$projectType', totalListed: { $sum: '$totalCredits' }, count: { $sum: 1 } } },
  ]);

  // Aggregate user counts by role
  const roleDistribution = await User.aggregate([
    { $match: { deletedAt: null } },
    { $group: { _id: '$role', count: { $sum: 1 } } },
  ]);

  // Aggregate monthly trade sales
  const salesHistory = await Transaction.aggregate([
    { $match: { paymentStatus: 'completed' } },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
        },
        volume: { $sum: '$creditsPurchased' },
        revenue: { $sum: '$totalAmount' },
        count: { $sum: 1 },
      },
    },
    { $sort: { '_id.year': -1, '_id.month': -1 } },
    { $limit: 12 },
  ]);

  const analytics = {
    projectTypes: typeDistribution,
    usersByRole: roleDistribution,
    salesByMonth: salesHistory,
  };

  return res.status(200).json(successResponse(analytics, 'Aggregated platform analytics retrieved'));
};

export default {
  listAllUsers,
  updateUserRole,
  toggleUserSuspension,
  getPendingProjects,
  listAllTransactions,
  getPlatformAnalytics,
};
