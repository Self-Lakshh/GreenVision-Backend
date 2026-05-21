import authService, { sanitizeUser } from '../services/auth.service.js';
import User from '../models/User.js';
import { successResponse } from '../utils/apiResponse.js';
import { AppError } from '../middleware/errorHandler.js';

export const register = async (req, res) => {
  const meta = {
    userAgent: req.headers['user-agent'],
    ipAddress: req.ip,
  };
  const result = await authService.register(req.body, meta);
  return res.status(201).json(successResponse(result, 'Registration successful'));
};

export const login = async (req, res) => {
  const meta = {
    userAgent: req.headers['user-agent'],
    ipAddress: req.ip,
  };
  const result = await authService.login(req.body, meta);
  return res.status(200).json(successResponse(result, 'Login successful'));
};

export const refresh = async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    throw new AppError('Refresh token is required', 400, 'MISSING_REFRESH_TOKEN');
  }
  const result = await authService.refresh(refreshToken);
  return res.status(200).json(successResponse(result, 'Tokens refreshed successfully'));
};

export const logout = async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    throw new AppError('Refresh token is required', 400, 'MISSING_REFRESH_TOKEN');
  }
  await authService.logout(refreshToken);
  return res.status(200).json(successResponse(null, 'Logged out successfully'));
};

export const getMe = async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user || !user.isActive) {
    throw new AppError('User not found or account deactivated', 404, 'USER_NOT_FOUND');
  }
  return res.status(200).json(successResponse(sanitizeUser(user), 'Current user profile retrieved'));
};

export default {
  register,
  login,
  refresh,
  logout,
  getMe,
};
