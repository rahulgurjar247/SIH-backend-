import { validationResult } from 'express-validator';
import { createValidationErrorResponse } from '../utils/responseUtils.js';
import { ERROR_CODES } from '../utils/errorTypes.js';

// Enhanced middleware to check for validation errors
export const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // Transform validation errors to a more user-friendly format
    const formattedErrors = errors.array().map(error => {
      let message = error.msg;
      
      // Customize error messages based on validation type
      switch (error.type) {
        case 'field':
          if (error.msg.includes('required')) {
            message = `${error.path} is required`;
          } else if (error.msg.includes('email')) {
            message = 'Please provide a valid email address';
          } else if (error.msg.includes('phone')) {
            message = 'Please provide a valid phone number';
          } else if (error.msg.includes('length')) {
            message = `${error.path} length is invalid`;
          } else if (error.msg.includes('format')) {
            message = `${error.path} format is invalid`;
          }
          break;
        case 'alternative':
          message = `One of the following fields is required: ${error.nestedErrors.map(e => e.path).join(', ')}`;
          break;
        case 'unknown_fields':
          message = `Unknown field: ${error.path}`;
          break;
        default:
          message = error.msg;
      }
      
      return {
        field: error.path || error.param,
        message,
        value: error.value,
        type: error.type
      };
    });

    const errorResponse = createValidationErrorResponse(formattedErrors);
    return res.status(errorResponse.statusCode).json(errorResponse);
  }
  next();
};

// Custom validation error handler for specific field validation
export const validateField = (fieldName, validator, errorMessage) => {
  return (req, res, next) => {
    const value = req.body[fieldName];
    
    if (!validator(value)) {
      const errorResponse = createValidationErrorResponse([{
        field: fieldName,
        message: errorMessage,
        value: value,
        type: 'custom'
      }]);
      return res.status(errorResponse.statusCode).json(errorResponse);
    }
    
    next();
  };
};

// Custom validation for MongoDB ObjectId
export const isValidObjectId = (value) => {
  if (!value) return false;
  const objectIdPattern = /^[0-9a-fA-F]{24}$/;
  return objectIdPattern.test(value);
};

// Custom validation for coordinates
export const isValidCoordinates = (value) => {
  if (!Array.isArray(value) || value.length !== 2) return false;
  const [longitude, latitude] = value;
  return (
    typeof longitude === 'number' && 
    typeof latitude === 'number' &&
    longitude >= -180 && longitude <= 180 &&
    latitude >= -90 && latitude <= 90
  );
};

// Custom validation for phone number
export const isValidPhoneNumber = (value) => {
  if (!value) return false;
  const phonePattern = /^[0-9]{10}$/;
  return phonePattern.test(value);
};

// Custom validation for email
export const isValidEmail = (value) => {
  if (!value) return false;
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailPattern.test(value);
};

// Custom validation for date
export const isValidDate = (value) => {
  if (!value) return false;
  const date = new Date(value);
  return !isNaN(date.getTime());
};

// Custom validation for file size
export const isValidFileSize = (file, maxSize = 10 * 1024 * 1024) => {
  if (!file) return false;
  return file.size <= maxSize;
};

// Custom validation for file type
export const isValidFileType = (file, allowedTypes = ['image/jpeg', 'image/png', 'image/gif']) => {
  if (!file) return false;
  return allowedTypes.includes(file.mimetype);
};

// Custom validation for enum values
export const isValidEnum = (value, allowedValues) => {
  if (!value) return false;
  return allowedValues.includes(value);
};

// Custom validation for array
export const isValidArray = (value, minLength = 0, maxLength = Infinity) => {
  if (!Array.isArray(value)) return false;
  return value.length >= minLength && value.length <= maxLength;
};

// Custom validation for string length
export const isValidStringLength = (value, minLength = 0, maxLength = Infinity) => {
  if (typeof value !== 'string') return false;
  return value.length >= minLength && value.length <= maxLength;
};

// Custom validation for numeric range
export const isValidNumericRange = (value, min = -Infinity, max = Infinity) => {
  if (typeof value !== 'number' || isNaN(value)) return false;
  return value >= min && value <= max;
};

// Custom validation for boolean
export const isValidBoolean = (value) => {
  return typeof value === 'boolean';
};

// Custom validation for URL
export const isValidURL = (value) => {
  if (!value) return false;
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
};

// Custom validation for JSON
export const isValidJSON = (value) => {
  if (typeof value !== 'string') return false;
  try {
    JSON.parse(value);
    return true;
  } catch {
    return false;
  }
};
