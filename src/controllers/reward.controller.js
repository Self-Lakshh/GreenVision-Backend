import Reward from '../models/Reward.js';
import Notification from '../models/Notification.js';
import { successResponse } from '../utils/apiResponse.js';
import { AppError } from '../middleware/errorHandler.js';
import { paginate } from '../utils/paginate.js';

export const listRewards = async (req, res) => {
  const { category, maxPoints, page = 1, limit = 20 } = req.query;
  const filter = { isActive: true, deletedAt: null };

  if (category) {
    filter.category = category;
  }

  if (maxPoints) {
    filter.pointsRequired = { $lte: Number(maxPoints) };
  }

  const result = await paginate(Reward, filter, {
    page: Number(page),
    limit: Number(limit),
    sort: { pointsRequired: 1 },
  });

  return res.status(200).json(successResponse(result.data, 'Active rewards retrieved successfully', result.meta));
};

export const getRewardDetails = async (req, res) => {
  const reward = await Reward.findOne({ _id: req.params.id, isActive: true, deletedAt: null });
  if (!reward) {
    throw new AppError('Reward not found', 404, 'REWARD_NOT_FOUND');
  }

  return res.status(200).json(successResponse(reward, 'Reward details retrieved successfully'));
};

export const createReward = async (req, res) => {
  const reward = await Reward.create(req.body);
  return res.status(201).json(successResponse(reward, 'Reward item created successfully'));
};

export const updateReward = async (req, res) => {
  const reward = await Reward.findOneAndUpdate(
    { _id: req.params.id, deletedAt: null },
    { $set: req.body },
    { new: true, runValidators: true }
  );

  if (!reward) {
    throw new AppError('Reward not found or deleted', 404, 'REWARD_NOT_FOUND');
  }

  return res.status(200).json(successResponse(reward, 'Reward item updated successfully'));
};

export const deleteReward = async (req, res) => {
  const reward = await Reward.findOneAndUpdate(
    { _id: req.params.id, deletedAt: null },
    { $set: { isActive: false, deletedAt: new Date() } },
    { new: true }
  );

  if (!reward) {
    throw new AppError('Reward not found or already deleted', 404, 'REWARD_NOT_FOUND');
  }

  return res.status(200).json(successResponse(null, 'Reward item soft-deleted successfully'));
};

export const getMyRedemptions = async (req, res) => {
  // Redemption history is tracked via point redemptions in-app notifications
  const redemptions = await Notification.find({
    userId: req.user.id,
    type: 'redemption',
  }).sort({ createdAt: -1 });

  return res.status(200).json(successResponse(redemptions, 'Your redemption history retrieved successfully'));
};

export default {
  listRewards,
  getRewardDetails,
  createReward,
  updateReward,
  deleteReward,
  getMyRedemptions,
};
