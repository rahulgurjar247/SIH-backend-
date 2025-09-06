import User from '../../models/User.js';
import Issue from '../../models/Issue.js';
import { 
  createSuccessResponse, 
  createNotFoundErrorResponse,
  createPaginatedResponse,
  createAuthorizationErrorResponse 
} from '../../utils/responseUtils.js';
import { ERROR_CODES } from '../../utils/errorTypes.js';
import { asyncHandler } from '../../middleware/errorHandler.js';

export const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('-password');
  
  if (!user) {
    const errorResponse = createNotFoundErrorResponse('User');
    return res.status(errorResponse.statusCode).json(errorResponse);
  }

  const successResponse = createSuccessResponse(user, 'Profile retrieved successfully');
  res.json(successResponse);
});

export const getMyIssues = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 20,
    status,
    category,
    priority,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = req.query;

  // Validate pagination parameters
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  
  if (pageNum < 1 || limitNum < 1 || limitNum > 100) {
    const errorResponse = createErrorResponse(
      ERROR_CODES.VALIDATION_INVALID_VALUE,
      'Invalid pagination parameters. Page must be >= 1, limit must be between 1 and 100'
    );
    return res.status(errorResponse.statusCode).json(errorResponse);
  }

  // Validate sort parameters
  const validSortFields = ['createdAt', 'updatedAt', 'title', 'priority', 'status'];
  if (!validSortFields.includes(sortBy)) {
    const errorResponse = createErrorResponse(
      ERROR_CODES.VALIDATION_INVALID_VALUE,
      `Invalid sort field. Must be one of: ${validSortFields.join(', ')}`
    );
    return res.status(errorResponse.statusCode).json(errorResponse);
  }

  if (!['asc', 'desc'].includes(sortOrder)) {
    const errorResponse = createErrorResponse(
      ERROR_CODES.VALIDATION_INVALID_VALUE,
      'Sort order must be either "asc" or "desc"'
    );
    return res.status(errorResponse.statusCode).json(errorResponse);
  }

  // Build filter object
  const filter = { reportedBy: req.user._id };
  if (status) filter.status = status;
  if (category) filter.category = category;
  if (priority) filter.priority = priority;

  // Build sort object
  const sort = {};
  sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

  // Calculate pagination
  const skip = (pageNum - 1) * limitNum;

  // Execute query
  const issues = await Issue.find(filter)
    .populate('assignedTo', 'name email phone')
    .sort(sort)
    .skip(skip)
    .limit(limitNum);

  // Get total count for pagination
  const total = await Issue.countDocuments(filter);

  // Get statistics
  const totalIssues = await Issue.countDocuments({ reportedBy: req.user._id });
  const pendingIssues = await Issue.countDocuments({ 
    reportedBy: req.user._id, 
    status: 'pending' 
  });
  const resolvedIssues = await Issue.countDocuments({ 
    reportedBy: req.user._id, 
    status: 'resolved' 
  });

  // Calculate pagination info
  const totalPages = Math.ceil(total / limitNum);
  const hasNextPage = pageNum < totalPages;
  const hasPrevPage = pageNum > 1;

  const pagination = {
    currentPage: pageNum,
    totalPages,
    totalItems: total,
    itemsPerPage: limitNum,
    hasNextPage,
    hasPrevPage
  };

  const statistics = {
    totalIssues,
    pendingIssues,
    resolvedIssues,
    resolutionRate: totalIssues > 0 
      ? ((resolvedIssues / totalIssues) * 100).toFixed(2) 
      : 0
  };

  const response = createPaginatedResponse(
    { issues, statistics },
    'Issues retrieved successfully',
    pagination
  );
  res.json(response);
});

export const getAssignedIssues = asyncHandler(async (req, res) => {
  // Check if user is staff or admin
  if (!['admin', 'staff'].includes(req.user.role)) {
    const errorResponse = createAuthorizationErrorResponse(
      'Access denied. Staff or admin role required.'
    );
    return res.status(errorResponse.statusCode).json(errorResponse);
  }

  const {
    page = 1,
    limit = 20,
    status,
    category,
    priority,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = req.query;

  // Validate pagination parameters
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  
  if (pageNum < 1 || limitNum < 1 || limitNum > 100) {
    const errorResponse = createErrorResponse(
      ERROR_CODES.VALIDATION_INVALID_VALUE,
      'Invalid pagination parameters. Page must be >= 1, limit must be between 1 and 100'
    );
    return res.status(errorResponse.statusCode).json(errorResponse);
  }

  // Build filter object
  const filter = { assignedTo: req.user._id };
  if (status) filter.status = status;
  if (category) filter.category = category;
  if (priority) filter.priority = priority;

  // Build sort object
  const sort = {};
  sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

  // Calculate pagination
  const skip = (pageNum - 1) * limitNum;

  // Execute query
  const issues = await Issue.find(filter)
    .populate('reportedBy', 'name email phone')
    .sort(sort)
    .skip(skip)
    .limit(limitNum);

  // Get total count for pagination
  const total = await Issue.countDocuments(filter);

  // Get statistics
  const totalAssigned = await Issue.countDocuments({ assignedTo: req.user._id });
  const pendingAssigned = await Issue.countDocuments({ 
    assignedTo: req.user._id, 
    status: 'pending' 
  });
  const resolvedAssigned = await Issue.countDocuments({ 
    assignedTo: req.user._id, 
    status: 'resolved' 
  });

  // Calculate pagination info
  const totalPages = Math.ceil(total / limitNum);
  const hasNextPage = pageNum < totalPages;
  const hasPrevPage = pageNum > 1;

  const pagination = {
    currentPage: pageNum,
    totalPages,
    totalItems: total,
    itemsPerPage: limitNum,
    hasNextPage,
    hasPrevPage
  };

  const statistics = {
    totalAssigned,
    pendingAssigned,
    resolvedAssigned,
    resolutionRate: totalAssigned > 0 
      ? ((resolvedAssigned / totalAssigned) * 100).toFixed(2) 
      : 0
  };

  const response = createPaginatedResponse(
    { issues, statistics },
    'Assigned issues retrieved successfully',
    pagination
  );
  res.json(response);
});

export const searchUsers = asyncHandler(async (req, res) => {
  const {
    query,
    role,
    state,
    district,
    isVerified,
    page = 1,
    limit = 20,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = req.query;

  // Validate pagination parameters
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  
  if (pageNum < 1 || limitNum < 1 || limitNum > 100) {
    const errorResponse = createErrorResponse(
      ERROR_CODES.VALIDATION_INVALID_VALUE,
      'Invalid pagination parameters. Page must be >= 1, limit must be between 1 and 100'
    );
    return res.status(errorResponse.statusCode).json(errorResponse);
  }

  // Validate role if provided
  if (role && !['user', 'staff', 'admin'].includes(role)) {
    const errorResponse = createErrorResponse(
      ERROR_CODES.VALIDATION_INVALID_VALUE,
      'Invalid role. Must be one of: user, staff, admin'
    );
    return res.status(errorResponse.statusCode).json(errorResponse);
  }

  // Build filter object
  const filter = {};
  
  if (query) {
    filter.$or = [
      { name: { $regex: query, $options: 'i' } },
      { email: { $regex: query, $options: 'i' } },
      { phone: { $regex: query, $options: 'i' } }
    ];
  }
  
  if (role) filter.role = role;
  if (state) filter['location.state'] = state;
  if (district) filter['location.district'] = district;
  if (isVerified !== undefined) filter.isVerified = isVerified === 'true';

  // Build sort object
  const sort = {};
  sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

  // Calculate pagination
  const skip = (pageNum - 1) * limitNum;

  // Execute query
  const users = await User.find(filter)
    .select('-password')
    .sort(sort)
    .skip(skip)
    .limit(limitNum);

  // Get total count for pagination
  const total = await User.countDocuments(filter);

  // Calculate pagination info
  const totalPages = Math.ceil(total / limitNum);
  const hasNextPage = pageNum < totalPages;
  const hasPrevPage = pageNum > 1;

  const pagination = {
    currentPage: pageNum,
    totalPages,
    totalItems: total,
    itemsPerPage: limitNum,
    hasNextPage,
    hasPrevPage
  };

  const response = createPaginatedResponse(
    users,
    'Users retrieved successfully',
    pagination
  );
  res.json(response);
});

export const getUserById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Validate ObjectId format
  if (!/^[0-9a-fA-F]{24}$/.test(id)) {
    const errorResponse = createErrorResponse(
      ERROR_CODES.VALIDATION_INVALID_FORMAT,
      'Invalid user ID format'
    );
    return res.status(errorResponse.statusCode).json(errorResponse);
  }

  const user = await User.findById(id).select('-password');
  
  if (!user) {
    const errorResponse = createNotFoundErrorResponse('User');
    return res.status(errorResponse.statusCode).json(errorResponse);
  }

  // Check if user can access this profile
  if (user._id.toString() !== req.user._id.toString() && 
      req.user.role !== 'admin') {
    const errorResponse = createAuthorizationErrorResponse(
      'Not authorized to access this profile'
    );
    return res.status(errorResponse.statusCode).json(errorResponse);
  }

  const successResponse = createSuccessResponse(user, 'User retrieved successfully');
  res.json(successResponse);
});

export const getUserIssues = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const {
    page = 1,
    limit = 20,
    status,
    category,
    priority,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = req.query;

  // Validate ObjectId format
  if (!/^[0-9a-fA-F]{24}$/.test(id)) {
    const errorResponse = createErrorResponse(
      ERROR_CODES.VALIDATION_INVALID_FORMAT,
      'Invalid user ID format'
    );
    return res.status(errorResponse.statusCode).json(errorResponse);
  }

  // Check if user can access these issues
  if (id !== req.user._id.toString() && req.user.role !== 'admin') {
    const errorResponse = createAuthorizationErrorResponse(
      'Not authorized to access these issues'
    );
    return res.status(errorResponse.statusCode).json(errorResponse);
  }

  // Validate pagination parameters
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  
  if (pageNum < 1 || limitNum < 1 || limitNum > 100) {
    const errorResponse = createErrorResponse(
      ERROR_CODES.VALIDATION_INVALID_VALUE,
      'Invalid pagination parameters. Page must be >= 1, limit must be between 1 and 100'
    );
    return res.status(errorResponse.statusCode).json(errorResponse);
  }

  // Build filter object
  const filter = { reportedBy: id };
  if (status) filter.status = status;
  if (category) filter.category = category;
  if (priority) filter.priority = priority;

  // Build sort object
  const sort = {};
  sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

  // Calculate pagination
  const skip = (pageNum - 1) * limitNum;

  // Execute query
  const issues = await Issue.find(filter)
    .populate('assignedTo', 'name email phone')
    .sort(sort)
    .skip(skip)
    .limit(limitNum);

  // Get total count for pagination
  const total = await Issue.countDocuments(filter);

  // Calculate pagination info
  const totalPages = Math.ceil(total / limitNum);
  const hasNextPage = pageNum < totalPages;
  const hasPrevPage = pageNum > 1;

  const pagination = {
    currentPage: pageNum,
    totalPages,
    totalItems: total,
    itemsPerPage: limitNum,
    hasNextPage,
    hasPrevPage
  };

  const response = createPaginatedResponse(
    issues,
    'User issues retrieved successfully',
    pagination
  );
  res.json(response);
});
