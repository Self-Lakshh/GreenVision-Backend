import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/User.js';
import RefreshToken from '../models/RefreshToken.js';
import { AppError } from '../middleware/errorHandler.js';
import { registerSchema, loginSchema } from '../validators/auth.validator.js';

export const sanitizeUser = (user) => {
  const obj = user.toObject ? user.toObject() : { ...user };
  delete obj.passwordHash;
  delete obj.__v;
  return obj;
};

export const issueTokens = async (user, { userAgent = null, ipAddress = null } = {}) => {
  const secret = process.env.JWT_SECRET || 'super_secret_nirmal_carbon_jwt_key_at_least_32_characters_long';
  const expiresIn = process.env.JWT_EXPIRES_IN || '15m';

  const accessToken = jwt.sign(
    {
      sub: user._id.toString(),
      role: user.role,
      email: user.email,
    },
    secret,
    { expiresIn }
  );

  const rawRefresh = crypto.randomBytes(64).toString('hex');
  const days = Number(process.env.REFRESH_TOKEN_EXPIRES_DAYS) || 7;
  const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000);

  await RefreshToken.create({
    userId: user._id,
    token: rawRefresh,
    expiresAt,
    userAgent,
    ipAddress,
  });

  return { accessToken, refreshToken: rawRefresh };
};

export const register = async (body, meta = {}) => {
  // 1. Zod-validate body
  const parsed = registerSchema.parse(body);

  // 2. Check duplicate email
  const existingUser = await User.findOne({ email: parsed.email.toLowerCase() });
  if (existingUser) {
    throw new AppError('Email already registered', 409, 'EMAIL_EXISTS');
  }

  // 3. Hash password
  const passwordHash = await bcrypt.hash(parsed.password, 12);

  // 4. Create User
  const user = await User.create({
    fullName: parsed.fullName,
    email: parsed.email.toLowerCase(),
    passwordHash,
    role: parsed.role || 'individual',
    phone: parsed.phone || null,
    companyName: parsed.companyName || null,
  });

  // 5. Issue tokens
  const tokens = await issueTokens(user, meta);

  // 6. Return response
  return { user: sanitizeUser(user), ...tokens };
};

export const login = async (body, meta = {}) => {
  // 1. Zod-validate body
  const parsed = loginSchema.parse(body);

  // 2. Find User with passwordHash
  const user = await User.findOne({ email: parsed.email.toLowerCase() }).select('+passwordHash');
  if (!user || !(await bcrypt.compare(parsed.password, user.passwordHash))) {
    throw new AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
  }

  // 3. Check if active
  if (!user.isActive) {
    throw new AppError('Account suspended', 403, 'ACCOUNT_SUSPENDED');
  }

  // 4. Revoke existing tokens for the user
  await RefreshToken.updateMany(
    { userId: user._id, isRevoked: false },
    { $set: { isRevoked: true } }
  );

  // 5. Issue new tokens
  const tokens = await issueTokens(user, meta);

  // 6. Return response
  return { user: sanitizeUser(user), ...tokens };
};

export const refresh = async (token) => {
  // 1. Find the refresh token
  const stored = await RefreshToken.findOne({ token, isRevoked: false });
  if (!stored || stored.expiresAt < new Date()) {
    throw new AppError('Refresh token invalid or expired', 401, 'INVALID_REFRESH_TOKEN');
  }

  // 2. Revoke this refresh token
  await RefreshToken.findByIdAndUpdate(stored._id, { $set: { isRevoked: true } });

  // 3. Find associated user
  const user = await User.findById(stored.userId);
  if (!user || !user.isActive) {
    throw new AppError('User account suspended or not found', 403, 'ACCOUNT_SUSPENDED');
  }

  // 4. Issue new token pair
  return await issueTokens(user, { userAgent: stored.userAgent, ipAddress: stored.ipAddress });
};

export const logout = async (token) => {
  await RefreshToken.findOneAndUpdate({ token }, { $set: { isRevoked: true } });
};

export default {
  sanitizeUser,
  issueTokens,
  register,
  login,
  refresh,
  logout,
};
