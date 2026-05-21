import jwt from 'jsonwebtoken';
import { errorResponse } from '../utils/apiResponse.js';

export const verifyToken = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json(errorResponse('No token provided', 'MISSING_TOKEN'));
  }
  try {
    const token = header.split(' ')[1];
    const secret = process.env.JWT_SECRET || 'super_secret_nirmal_carbon_jwt_key_at_least_32_characters_long';
    const payload = jwt.verify(token, secret);
    req.user = { id: payload.sub, role: payload.role, email: payload.email };
    next();
  } catch (err) {
    next(err);
  }
};

export const requireRole = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user?.role)) {
    return res.status(403).json(errorResponse(`Access denied. Required role: ${roles.join(' or ')}`, 'FORBIDDEN'));
  }
  next();
};
