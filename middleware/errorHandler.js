// Error handling middleware
import { 
  ERROR_CODES, 
  ERROR_MESSAGES, 
  HTTP_STATUS_CODES 
} from '../utils/errorTypes.js';
import { 
  createErrorResponse, 
  createDatabaseErrorResponse,
  createValidationErrorResponse 
} from '../utils/responseUtils.js';
import logger from '../utils/logger.js';

export const notFound = (req, res, next) => {
  const error = new Error(`Route not found - ${req.originalUrl}`);
  error.statusCode = 404;
  error.errorCode = ERROR_CODES.USER_NOT_FOUND;
  next(error);
};

export const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Enhanced logging with request context
  logger.error('API Error Occurred', err, {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    userId: req.user ? req.user._id : null,
    errorName: err.name,
    errorCode: err.code,
    statusCode: err.statusCode
  });

  // Mongoose bad ObjectId (CastError)
  if (err.name === 'CastError') {
    const errorResponse = createErrorResponse(
      ERROR_CODES.DB_CAST_ERROR,
      `Invalid ID format: ${err.value}`
    );
    return res.status(errorResponse.statusCode).json(errorResponse);
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const value = err.keyValue[field];
    const errorResponse = createErrorResponse(
      ERROR_CODES.DB_DUPLICATE_KEY,
      `${field} '${value}' already exists. Please use a different value.`
    );
    return res.status(errorResponse.statusCode).json(errorResponse);
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const validationErrors = Object.values(err.errors).map(val => ({
      path: val.path,
      msg: val.message,
      value: val.value
    }));
    const errorResponse = createValidationErrorResponse(validationErrors);
    return res.status(errorResponse.statusCode).json(errorResponse);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    const errorResponse = createErrorResponse(
      ERROR_CODES.AUTH_TOKEN_INVALID,
      'Invalid authentication token. Please log in again.'
    );
    return res.status(errorResponse.statusCode).json(errorResponse);
  }

  if (err.name === 'TokenExpiredError') {
    const errorResponse = createErrorResponse(
      ERROR_CODES.AUTH_TOKEN_EXPIRED,
      'Your session has expired. Please log in again.'
    );
    return res.status(errorResponse.statusCode).json(errorResponse);
  }

  // Multer file upload errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    const errorResponse = createErrorResponse(
      ERROR_CODES.UPLOAD_FILE_TOO_LARGE,
      'File size exceeds the maximum allowed limit of 10MB.'
    );
    return res.status(errorResponse.statusCode).json(errorResponse);
  }

  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    const errorResponse = createErrorResponse(
      ERROR_CODES.UPLOAD_INVALID_TYPE,
      'Unexpected file field. Please check your file upload configuration.'
    );
    return res.status(errorResponse.statusCode).json(errorResponse);
  }

  // Rate limiting errors
  if (err.statusCode === 429) {
    const errorResponse = createErrorResponse(
      ERROR_CODES.SERVER_RATE_LIMIT,
      'Too many requests from this IP. Please try again later.'
    );
    return res.status(errorResponse.statusCode).json(errorResponse);
  }

  // Custom application errors with error codes
  if (err.errorCode && ERROR_CODES[err.errorCode]) {
    const errorResponse = createErrorResponse(
      err.errorCode,
      err.message || ERROR_MESSAGES[err.errorCode]
    );
    return res.status(errorResponse.statusCode).json(errorResponse);
  }

  // Database connection errors
  if (err.name === 'MongoNetworkError' || err.name === 'MongoTimeoutError') {
    const errorResponse = createErrorResponse(
      ERROR_CODES.DB_CONNECTION_FAILED,
      'Database connection failed. Please try again later.'
    );
    return res.status(errorResponse.statusCode).json(errorResponse);
  }

  // Syntax errors (malformed JSON)
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    const errorResponse = createErrorResponse(
      ERROR_CODES.VALIDATION_INVALID_FORMAT,
      'Invalid JSON format in request body.'
    );
    return res.status(errorResponse.statusCode).json(errorResponse);
  }

  // Default server error
  const statusCode = err.statusCode || 500;
  const errorResponse = {
    success: false,
    message: err.message || ERROR_MESSAGES[ERROR_CODES.SERVER_INTERNAL_ERROR],
    errorCode: err.errorCode || ERROR_CODES.SERVER_INTERNAL_ERROR,
    statusCode,
    timestamp: new Date().toISOString(),
    ...(process.env.NODE_ENV === 'development' && { 
      stack: err.stack,
      details: {
        name: err.name,
        code: err.code,
        path: err.path,
        value: err.value
      }
    })
  };

  res.status(statusCode).json(errorResponse);
};

// Async error handler wrapper
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Custom error class
export class AppError extends Error {
  constructor(message, statusCode, errorCode) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}
