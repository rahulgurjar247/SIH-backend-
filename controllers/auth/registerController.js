import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../../models/User.js';
import { 
  createSuccessResponse, 
  createErrorResponse,
  createDatabaseErrorResponse 
} from '../../utils/responseUtils.js';
import { ERROR_CODES } from '../../utils/errorTypes.js';
import { asyncHandler } from '../../middleware/errorHandler.js';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '30d'
  });
};

export const register = asyncHandler(async (req, res) => {
  const { name, email, phone, password, location } = req.body;

  // Validate required fields
  if (!name || !email || !phone || !password) {
    const errorResponse = createErrorResponse(
      ERROR_CODES.VALIDATION_REQUIRED_FIELD,
      'Name, email, phone, and password are required'
    );
    return res.status(errorResponse.statusCode).json(errorResponse);
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    const errorResponse = createErrorResponse(
      ERROR_CODES.VALIDATION_INVALID_EMAIL,
      'Please provide a valid email address'
    );
    return res.status(errorResponse.statusCode).json(errorResponse);
  }

  // Validate phone format
  const phoneRegex = /^[0-9]{10}$/;
  if (!phoneRegex.test(phone)) {
    const errorResponse = createErrorResponse(
      ERROR_CODES.VALIDATION_INVALID_PHONE,
      'Please provide a valid 10-digit phone number'
    );
    return res.status(errorResponse.statusCode).json(errorResponse);
  }

  // Validate password strength
  if (password.length < 6) {
    const errorResponse = createErrorResponse(
      ERROR_CODES.VALIDATION_STRING_TOO_SHORT,
      'Password must be at least 6 characters long'
    );
    return res.status(errorResponse.statusCode).json(errorResponse);
  }

  // Check if user already exists
  const existingUser = await User.findOne({ 
    $or: [{ email }, { phone }] 
  });

  if (existingUser) {
    const field = existingUser.email === email ? 'email' : 'phone';
    const errorResponse = createErrorResponse(
      ERROR_CODES.USER_ALREADY_EXISTS,
      `${field === 'email' ? 'Email' : 'Phone number'} already registered. Please use a different ${field}.`
    );
    return res.status(errorResponse.statusCode).json(errorResponse);
  }

  // Create new user
  const user = new User({
    name,
    email,
    phone,
    password,
    location
  });

  await user.save();

  // Generate token
  const token = generateToken(user._id);

  // Remove password from response
  user.password = undefined;

  const successResponse = createSuccessResponse(
    { user, token },
    'User registered successfully'
  );
  res.status(201).json(successResponse);
});
