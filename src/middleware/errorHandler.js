import logger from '../utils/logger.js';
import { errorResponse } from '../utils/apiResponse.js';

export class AppError extends Error {
  constructor(message, statusCode = 500, code = 'ERROR') {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export function errorHandler(err, req, res, next) {
  // Log with Winston
  logger.error(err.message || 'Error occurred', { stack: err.stack, path: req.path, method: req.method });

  // ZodError
  if (err.name === 'ZodError') {
    return res.status(400).json(
      errorResponse(
        'Validation failed',
        'VALIDATION_ERROR',
        err.errors.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
        }))
      )
    );
  }

  // Mongoose ValidationError
  if (err.name === 'ValidationError') {
    return res.status(400).json(
      errorResponse(
        'Validation failed',
        'VALIDATION_ERROR',
        Object.values(err.errors).map((e) => e.message)
      )
    );
  }

  // Mongoose Duplicate Key
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern || {})[0] || 'field';
    return res.status(409).json(
      errorResponse(`${field.charAt(0).toUpperCase() + field.slice(1)} already exists`, 'DUPLICATE_KEY')
    );
  }

  // Mongoose CastError (invalid ObjectId)
  if (err.name === 'CastError') {
    return res.status(400).json(errorResponse('Invalid ID format', 'INVALID_ID'));
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json(errorResponse('Invalid token', 'INVALID_TOKEN'));
  }
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json(errorResponse('Token expired, please refresh', 'TOKEN_EXPIRED'));
  }

  // AppError (custom) or fallback
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';
  const errorCode = err.code || 'SERVER_ERROR';

  return res.status(statusCode).json(errorResponse(message, errorCode));
}

export default errorHandler;
