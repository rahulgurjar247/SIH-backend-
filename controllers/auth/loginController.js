import jwt from 'jsonwebtoken';
import User from '../../models/User.js';
import { 
  createSuccessResponse, 
  createAuthErrorResponse, 
  createServerErrorResponse 
} from '../../utils/responseUtils.js';
import { ERROR_CODES } from '../../utils/errorTypes.js';
import { asyncHandler } from '../../middleware/errorHandler.js';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '30d'
  });
};

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Validate required fields
  if (!email || !password) {
    const errorResponse = createAuthErrorResponse(
      ERROR_CODES.VALIDATION_REQUIRED_FIELD,
      'Email and password are required'
    );
    return res.status(errorResponse.statusCode).json(errorResponse);
  }

  // Check if user exists
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    const errorResponse = createAuthErrorResponse(
      ERROR_CODES.AUTH_INVALID_CREDENTIALS,
      'Invalid email or password'
    );
    return res.status(errorResponse.statusCode).json(errorResponse);
  }

  // Check if account is disabled
  if (user.isDisabled) {
    const errorResponse = createAuthErrorResponse(
      ERROR_CODES.AUTH_ACCOUNT_DISABLED,
      'Your account has been disabled. Please contact support.'
    );
    return res.status(errorResponse.statusCode).json(errorResponse);
  }

  // Check if password matches
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    const errorResponse = createAuthErrorResponse(
      ERROR_CODES.AUTH_INVALID_CREDENTIALS,
      'Invalid email or password'
    );
    return res.status(errorResponse.statusCode).json(errorResponse);
  }

  // Generate token
  const token = generateToken(user._id);

  // Update last active
  user.lastActive = Date.now();
  await user.save();

  // Remove password from response
  user.password = undefined;

  const successResponse = createSuccessResponse(
    { user, token },
    'Login successful'
  );
  res.json(successResponse);
});
