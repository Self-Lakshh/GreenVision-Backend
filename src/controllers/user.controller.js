import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import { sanitizeUser } from '../services/auth.service.js';
import { successResponse } from '../utils/apiResponse.js';
import { AppError } from '../middleware/errorHandler.js';
import { paginate } from '../utils/paginate.js';

export const getProfile = async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user || !user.isActive) {
    throw new AppError('User profile not found', 404, 'USER_NOT_FOUND');
  }
  return res.status(200).json(successResponse(sanitizeUser(user), 'Profile retrieved successfully'));
};

export const updateProfile = async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.user.id,
    { $set: req.body },
    { new: true, runValidators: true }
  );
  if (!user) {
    throw new AppError('User profile not found', 404, 'USER_NOT_FOUND');
  }
  return res.status(200).json(successResponse(sanitizeUser(user), 'Profile updated successfully'));
};

export const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user.id).select('+passwordHash');
  if (!user) {
    throw new AppError('User profile not found', 404, 'USER_NOT_FOUND');
  }

  const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!isMatch) {
    throw new AppError('Incorrect current password', 400, 'PASSWORD_INCORRECT');
  }

  user.passwordHash = await bcrypt.hash(newPassword, 12);
  await user.save();

  return res.status(200).json(successResponse(null, 'Password updated successfully'));
};

export const getNotifications = async (req, res) => {
  const { page = 1, limit = 20, unread } = req.query;
  const filter = { userId: req.user.id };

  if (unread === 'true') {
    filter.isRead = false;
  }

  const result = await paginate(Notification, filter, {
    page: Number(page),
    limit: Number(limit),
    sort: { createdAt: -1 },
  });

  return res.status(200).json(successResponse(result.data, 'Notifications retrieved successfully', result.meta));
};

export const readNotification = async (req, res) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, userId: req.user.id },
    { $set: { isRead: true, readAt: new Date() } },
    { new: true }
  );

  if (!notification) {
    throw new AppError('Notification not found', 404, 'NOTIFICATION_NOT_FOUND');
  }

  return res.status(200).json(successResponse(notification, 'Notification marked as read'));
};

export const readAllNotifications = async (req, res) => {
  await Notification.updateMany(
    { userId: req.user.id, isRead: false },
    { $set: { isRead: true, readAt: new Date() } }
  );

  return res.status(200).json(successResponse(null, 'All notifications marked as read'));
};

export default {
  getProfile,
  updateProfile,
  changePassword,
  getNotifications,
  readNotification,
  readAllNotifications,
};
