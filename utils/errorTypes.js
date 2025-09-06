// Error types and codes for consistent error handling

export const ERROR_CODES = {
  // Authentication & Authorization
  AUTH_INVALID_CREDENTIALS: 'AUTH_001',
  AUTH_TOKEN_EXPIRED: 'AUTH_002',
  AUTH_TOKEN_INVALID: 'AUTH_003',
  AUTH_ACCESS_DENIED: 'AUTH_004',
  AUTH_USER_NOT_FOUND: 'AUTH_005',
  AUTH_EMAIL_NOT_VERIFIED: 'AUTH_006',
  AUTH_ACCOUNT_DISABLED: 'AUTH_007',
  
  // User Management
  USER_NOT_FOUND: 'USER_001',
  USER_ALREADY_EXISTS: 'USER_002',
  USER_INVALID_DATA: 'USER_003',
  USER_UPDATE_FAILED: 'USER_004',
  USER_DELETE_FAILED: 'USER_005',
  USER_PROFILE_INCOMPLETE: 'USER_006',
  
  // Issue Management
  ISSUE_NOT_FOUND: 'ISSUE_001',
  ISSUE_CREATE_FAILED: 'ISSUE_002',
  ISSUE_UPDATE_FAILED: 'ISSUE_003',
  ISSUE_DELETE_FAILED: 'ISSUE_004',
  ISSUE_INVALID_DATA: 'ISSUE_005',
  ISSUE_ALREADY_RESOLVED: 'ISSUE_006',
  ISSUE_PERMISSION_DENIED: 'ISSUE_007',
  ISSUE_VOTE_FAILED: 'ISSUE_008',
  
  // Validation Errors
  VALIDATION_REQUIRED_FIELD: 'VAL_001',
  VALIDATION_INVALID_FORMAT: 'VAL_002',
  VALIDATION_INVALID_VALUE: 'VAL_003',
  VALIDATION_FILE_TOO_LARGE: 'VAL_004',
  VALIDATION_INVALID_FILE_TYPE: 'VAL_005',
  VALIDATION_STRING_TOO_LONG: 'VAL_006',
  VALIDATION_STRING_TOO_SHORT: 'VAL_007',
  VALIDATION_INVALID_EMAIL: 'VAL_008',
  VALIDATION_INVALID_PHONE: 'VAL_009',
  VALIDATION_INVALID_COORDINATES: 'VAL_010',
  
  // Database Errors
  DB_CONNECTION_FAILED: 'DB_001',
  DB_QUERY_FAILED: 'DB_002',
  DB_DUPLICATE_KEY: 'DB_003',
  DB_VALIDATION_ERROR: 'DB_004',
  DB_CAST_ERROR: 'DB_005',
  
  // File Upload Errors
  UPLOAD_FAILED: 'UPLOAD_001',
  UPLOAD_FILE_TOO_LARGE: 'UPLOAD_002',
  UPLOAD_INVALID_TYPE: 'UPLOAD_003',
  UPLOAD_NO_FILE: 'UPLOAD_004',
  UPLOAD_PROCESSING_FAILED: 'UPLOAD_005',
  
  // Server Errors
  SERVER_INTERNAL_ERROR: 'SRV_001',
  SERVER_SERVICE_UNAVAILABLE: 'SRV_002',
  SERVER_TIMEOUT: 'SRV_003',
  SERVER_RATE_LIMIT: 'SRV_004',
  
  // External Service Errors
  EXTERNAL_SERVICE_FAILED: 'EXT_001',
  EXTERNAL_API_ERROR: 'EXT_002',
  EXTERNAL_TIMEOUT: 'EXT_003',
  
  // Notification Errors
  NOTIFICATION_SEND_FAILED: 'NOTIF_001',
  NOTIFICATION_TEMPLATE_ERROR: 'NOTIF_002',
  NOTIFICATION_INVALID_RECIPIENT: 'NOTIF_003',
  
  // Analytics Errors
  ANALYTICS_DATA_NOT_FOUND: 'ANAL_001',
  ANALYTICS_QUERY_FAILED: 'ANAL_002',
  ANALYTICS_PERMISSION_DENIED: 'ANAL_003'
};

export const ERROR_MESSAGES = {
  // Authentication & Authorization
  [ERROR_CODES.AUTH_INVALID_CREDENTIALS]: 'Invalid email or password. Please check your credentials and try again.',
  [ERROR_CODES.AUTH_TOKEN_EXPIRED]: 'Your session has expired. Please log in again.',
  [ERROR_CODES.AUTH_TOKEN_INVALID]: 'Invalid authentication token. Please log in again.',
  [ERROR_CODES.AUTH_ACCESS_DENIED]: 'Access denied. You do not have permission to perform this action.',
  [ERROR_CODES.AUTH_USER_NOT_FOUND]: 'User account not found. Please check your email or register.',
  [ERROR_CODES.AUTH_EMAIL_NOT_VERIFIED]: 'Please verify your email address before accessing this feature.',
  [ERROR_CODES.AUTH_ACCOUNT_DISABLED]: 'Your account has been disabled. Please contact support.',
  
  // User Management
  [ERROR_CODES.USER_NOT_FOUND]: 'User not found. The requested user does not exist.',
  [ERROR_CODES.USER_ALREADY_EXISTS]: 'User already exists with this email address.',
  [ERROR_CODES.USER_INVALID_DATA]: 'Invalid user data provided. Please check all required fields.',
  [ERROR_CODES.USER_UPDATE_FAILED]: 'Failed to update user information. Please try again.',
  [ERROR_CODES.USER_DELETE_FAILED]: 'Failed to delete user account. Please try again.',
  [ERROR_CODES.USER_PROFILE_INCOMPLETE]: 'User profile is incomplete. Please complete all required fields.',
  
  // Issue Management
  [ERROR_CODES.ISSUE_NOT_FOUND]: 'Issue not found. The requested issue does not exist.',
  [ERROR_CODES.ISSUE_CREATE_FAILED]: 'Failed to create issue. Please check your data and try again.',
  [ERROR_CODES.ISSUE_UPDATE_FAILED]: 'Failed to update issue. Please try again.',
  [ERROR_CODES.ISSUE_DELETE_FAILED]: 'Failed to delete issue. Please try again.',
  [ERROR_CODES.ISSUE_INVALID_DATA]: 'Invalid issue data provided. Please check all required fields.',
  [ERROR_CODES.ISSUE_ALREADY_RESOLVED]: 'This issue has already been resolved.',
  [ERROR_CODES.ISSUE_PERMISSION_DENIED]: 'You do not have permission to perform this action on this issue.',
  [ERROR_CODES.ISSUE_VOTE_FAILED]: 'Failed to vote on issue. Please try again.',
  
  // Validation Errors
  [ERROR_CODES.VALIDATION_REQUIRED_FIELD]: 'This field is required and cannot be empty.',
  [ERROR_CODES.VALIDATION_INVALID_FORMAT]: 'Invalid format for this field.',
  [ERROR_CODES.VALIDATION_INVALID_VALUE]: 'Invalid value provided for this field.',
  [ERROR_CODES.VALIDATION_FILE_TOO_LARGE]: 'File size exceeds the maximum allowed limit.',
  [ERROR_CODES.VALIDATION_INVALID_FILE_TYPE]: 'Invalid file type. Please upload a supported file format.',
  [ERROR_CODES.VALIDATION_STRING_TOO_LONG]: 'Text is too long. Please reduce the length.',
  [ERROR_CODES.VALIDATION_STRING_TOO_SHORT]: 'Text is too short. Please provide more details.',
  [ERROR_CODES.VALIDATION_INVALID_EMAIL]: 'Please provide a valid email address.',
  [ERROR_CODES.VALIDATION_INVALID_PHONE]: 'Please provide a valid phone number.',
  [ERROR_CODES.VALIDATION_INVALID_COORDINATES]: 'Invalid location coordinates provided.',
  
  // Database Errors
  [ERROR_CODES.DB_CONNECTION_FAILED]: 'Database connection failed. Please try again later.',
  [ERROR_CODES.DB_QUERY_FAILED]: 'Database query failed. Please try again.',
  [ERROR_CODES.DB_DUPLICATE_KEY]: 'This record already exists. Please check for duplicates.',
  [ERROR_CODES.DB_VALIDATION_ERROR]: 'Data validation failed. Please check your input.',
  [ERROR_CODES.DB_CAST_ERROR]: 'Invalid data format. Please check your input.',
  
  // File Upload Errors
  [ERROR_CODES.UPLOAD_FAILED]: 'File upload failed. Please try again.',
  [ERROR_CODES.UPLOAD_FILE_TOO_LARGE]: 'File is too large. Maximum size allowed is 10MB.',
  [ERROR_CODES.UPLOAD_INVALID_TYPE]: 'Invalid file type. Only images (JPG, PNG, GIF) are allowed.',
  [ERROR_CODES.UPLOAD_NO_FILE]: 'No file provided. Please select a file to upload.',
  [ERROR_CODES.UPLOAD_PROCESSING_FAILED]: 'Failed to process uploaded file. Please try again.',
  
  // Server Errors
  [ERROR_CODES.SERVER_INTERNAL_ERROR]: 'Internal server error. Please try again later.',
  [ERROR_CODES.SERVER_SERVICE_UNAVAILABLE]: 'Service temporarily unavailable. Please try again later.',
  [ERROR_CODES.SERVER_TIMEOUT]: 'Request timeout. Please try again.',
  [ERROR_CODES.SERVER_RATE_LIMIT]: 'Too many requests. Please wait before trying again.',
  
  // External Service Errors
  [ERROR_CODES.EXTERNAL_SERVICE_FAILED]: 'External service error. Please try again later.',
  [ERROR_CODES.EXTERNAL_API_ERROR]: 'External API error. Please try again later.',
  [ERROR_CODES.EXTERNAL_TIMEOUT]: 'External service timeout. Please try again later.',
  
  // Notification Errors
  [ERROR_CODES.NOTIFICATION_SEND_FAILED]: 'Failed to send notification. Please try again.',
  [ERROR_CODES.NOTIFICATION_TEMPLATE_ERROR]: 'Notification template error. Please contact support.',
  [ERROR_CODES.NOTIFICATION_INVALID_RECIPIENT]: 'Invalid notification recipient.',
  
  // Analytics Errors
  [ERROR_CODES.ANALYTICS_DATA_NOT_FOUND]: 'Analytics data not found for the requested parameters.',
  [ERROR_CODES.ANALYTICS_QUERY_FAILED]: 'Failed to fetch analytics data. Please try again.',
  [ERROR_CODES.ANALYTICS_PERMISSION_DENIED]: 'You do not have permission to access analytics data.'
};

export const HTTP_STATUS_CODES = {
  [ERROR_CODES.AUTH_INVALID_CREDENTIALS]: 401,
  [ERROR_CODES.AUTH_TOKEN_EXPIRED]: 401,
  [ERROR_CODES.AUTH_TOKEN_INVALID]: 401,
  [ERROR_CODES.AUTH_ACCESS_DENIED]: 403,
  [ERROR_CODES.AUTH_USER_NOT_FOUND]: 404,
  [ERROR_CODES.AUTH_EMAIL_NOT_VERIFIED]: 403,
  [ERROR_CODES.AUTH_ACCOUNT_DISABLED]: 403,
  
  [ERROR_CODES.USER_NOT_FOUND]: 404,
  [ERROR_CODES.USER_ALREADY_EXISTS]: 409,
  [ERROR_CODES.USER_INVALID_DATA]: 400,
  [ERROR_CODES.USER_UPDATE_FAILED]: 500,
  [ERROR_CODES.USER_DELETE_FAILED]: 500,
  [ERROR_CODES.USER_PROFILE_INCOMPLETE]: 400,
  
  [ERROR_CODES.ISSUE_NOT_FOUND]: 404,
  [ERROR_CODES.ISSUE_CREATE_FAILED]: 500,
  [ERROR_CODES.ISSUE_UPDATE_FAILED]: 500,
  [ERROR_CODES.ISSUE_DELETE_FAILED]: 500,
  [ERROR_CODES.ISSUE_INVALID_DATA]: 400,
  [ERROR_CODES.ISSUE_ALREADY_RESOLVED]: 400,
  [ERROR_CODES.ISSUE_PERMISSION_DENIED]: 403,
  [ERROR_CODES.ISSUE_VOTE_FAILED]: 500,
  
  [ERROR_CODES.VALIDATION_REQUIRED_FIELD]: 400,
  [ERROR_CODES.VALIDATION_INVALID_FORMAT]: 400,
  [ERROR_CODES.VALIDATION_INVALID_VALUE]: 400,
  [ERROR_CODES.VALIDATION_FILE_TOO_LARGE]: 413,
  [ERROR_CODES.VALIDATION_INVALID_FILE_TYPE]: 400,
  [ERROR_CODES.VALIDATION_STRING_TOO_LONG]: 400,
  [ERROR_CODES.VALIDATION_STRING_TOO_SHORT]: 400,
  [ERROR_CODES.VALIDATION_INVALID_EMAIL]: 400,
  [ERROR_CODES.VALIDATION_INVALID_PHONE]: 400,
  [ERROR_CODES.VALIDATION_INVALID_COORDINATES]: 400,
  
  [ERROR_CODES.DB_CONNECTION_FAILED]: 503,
  [ERROR_CODES.DB_QUERY_FAILED]: 500,
  [ERROR_CODES.DB_DUPLICATE_KEY]: 409,
  [ERROR_CODES.DB_VALIDATION_ERROR]: 400,
  [ERROR_CODES.DB_CAST_ERROR]: 400,
  
  [ERROR_CODES.UPLOAD_FAILED]: 500,
  [ERROR_CODES.UPLOAD_FILE_TOO_LARGE]: 413,
  [ERROR_CODES.UPLOAD_INVALID_TYPE]: 400,
  [ERROR_CODES.UPLOAD_NO_FILE]: 400,
  [ERROR_CODES.UPLOAD_PROCESSING_FAILED]: 500,
  
  [ERROR_CODES.SERVER_INTERNAL_ERROR]: 500,
  [ERROR_CODES.SERVER_SERVICE_UNAVAILABLE]: 503,
  [ERROR_CODES.SERVER_TIMEOUT]: 408,
  [ERROR_CODES.SERVER_RATE_LIMIT]: 429,
  
  [ERROR_CODES.EXTERNAL_SERVICE_FAILED]: 502,
  [ERROR_CODES.EXTERNAL_API_ERROR]: 502,
  [ERROR_CODES.EXTERNAL_TIMEOUT]: 504,
  
  [ERROR_CODES.NOTIFICATION_SEND_FAILED]: 500,
  [ERROR_CODES.NOTIFICATION_TEMPLATE_ERROR]: 500,
  [ERROR_CODES.NOTIFICATION_INVALID_RECIPIENT]: 400,
  
  [ERROR_CODES.ANALYTICS_DATA_NOT_FOUND]: 404,
  [ERROR_CODES.ANALYTICS_QUERY_FAILED]: 500,
  [ERROR_CODES.ANALYTICS_PERMISSION_DENIED]: 403
};
