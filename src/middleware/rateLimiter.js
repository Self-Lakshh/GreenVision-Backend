import rateLimit from 'express-rate-limit';
import { errorResponse } from '../utils/apiResponse.js';

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Limit each IP to 20 requests per `window`
  standardHeaders: true,
  legacyHeaders: false,
  message: errorResponse('Too many authentication attempts. Please try again after 15 minutes.', 'TOO_MANY_REQUESTS'),
});

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Limit each IP to 200 requests per `window`
  standardHeaders: true,
  legacyHeaders: false,
  message: errorResponse('Too many requests. Please try again after 15 minutes.', 'TOO_MANY_REQUESTS'),
});

export const paymentLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 10, // Limit each IP to 10 requests per minute
  standardHeaders: true,
  legacyHeaders: false,
  message: errorResponse('Too many payment attempts. Please try again after a minute.', 'TOO_MANY_REQUESTS'),
});

export default {
  authLimiter,
  apiLimiter,
  paymentLimiter,
};
