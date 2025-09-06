// Response utility functions for consistent API responses
import { ERROR_CODES, ERROR_MESSAGES, HTTP_STATUS_CODES } from './errorTypes.js';

export const formatResponse = (data, message = 'Success', status = 'success') => {
  return {
    success: status === 'success',
    message,
    data,
    timestamp: new Date().toISOString()
  };
};

export const formatError = (message, errors = null, statusCode = 400, errorCode = null) => {
  return {
    success: false,
    message,
    errorCode,
    errors,
    statusCode,
    timestamp: new Date().toISOString()
  };
};

export const formatPaginationResponse = (data, pagination, message = 'Success') => {
  return {
    success: true,
    message,
    data,
    pagination,
    timestamp: new Date().toISOString()
  };
};

// Enhanced error response functions with error codes
export const createErrorResponse = (errorCode, customMessage = null, additionalData = null) => {
  const message = customMessage || ERROR_MESSAGES[errorCode] || 'An error occurred';
  const statusCode = HTTP_STATUS_CODES[errorCode] || 500;
  
  const response = {
    success: false,
    message,
    errorCode,
    statusCode,
    timestamp: new Date().toISOString()
  };

  if (additionalData) {
    response.data = additionalData;
  }

  return response;
};

// Validation error response
export const createValidationErrorResponse = (validationErrors) => {
  const errors = {};
  
  if (Array.isArray(validationErrors)) {
    validationErrors.forEach(error => {
      if (error.path) {
        errors[error.path] = error.msg || ERROR_MESSAGES[ERROR_CODES.VALIDATION_INVALID_VALUE];
      }
    });
  } else if (typeof validationErrors === 'object') {
    Object.keys(validationErrors).forEach(key => {
      errors[key] = validationErrors[key];
    });
  }

  return {
    success: false,
    message: 'Validation failed. Please check your input.',
    errorCode: ERROR_CODES.VALIDATION_INVALID_VALUE,
    errors,
    statusCode: 400,
    timestamp: new Date().toISOString()
  };
};

// Database error response
export const createDatabaseErrorResponse = (error) => {
  let errorCode = ERROR_CODES.DB_QUERY_FAILED;
  let message = ERROR_MESSAGES[errorCode];

  if (error.name === 'ValidationError') {
    errorCode = ERROR_CODES.DB_VALIDATION_ERROR;
    message = ERROR_MESSAGES[errorCode];
  } else if (error.name === 'CastError') {
    errorCode = ERROR_CODES.DB_CAST_ERROR;
    message = ERROR_MESSAGES[errorCode];
  } else if (error.code === 11000) {
    errorCode = ERROR_CODES.DB_DUPLICATE_KEY;
    message = ERROR_MESSAGES[errorCode];
  }

  return {
    success: false,
    message,
    errorCode,
    statusCode: HTTP_STATUS_CODES[errorCode],
    timestamp: new Date().toISOString()
  };
};

// Authentication error response
export const createAuthErrorResponse = (errorCode, customMessage = null) => {
  return createErrorResponse(errorCode, customMessage);
};

// Authorization error response
export const createAuthorizationErrorResponse = (customMessage = null) => {
  return createErrorResponse(ERROR_CODES.AUTH_ACCESS_DENIED, customMessage);
};

// Not found error response
export const createNotFoundErrorResponse = (resource = 'Resource') => {
  return createErrorResponse(ERROR_CODES.USER_NOT_FOUND, `${resource} not found`);
};

// Server error response
export const createServerErrorResponse = (customMessage = null) => {
  return createErrorResponse(ERROR_CODES.SERVER_INTERNAL_ERROR, customMessage);
};

// File upload error response
export const createUploadErrorResponse = (errorCode, customMessage = null) => {
  return createErrorResponse(errorCode, customMessage);
};

// Rate limit error response
export const createRateLimitErrorResponse = () => {
  return createErrorResponse(ERROR_CODES.SERVER_RATE_LIMIT);
};

// Success response with data
export const createSuccessResponse = (data, message = 'Operation successful') => {
  return {
    success: true,
    message,
    data,
    timestamp: new Date().toISOString()
  };
};

// Success response with pagination
export const createPaginatedResponse = (data, pagination, message = 'Data retrieved successfully') => {
  return {
    success: true,
    message,
    data,
    pagination,
    timestamp: new Date().toISOString()
  };
};
