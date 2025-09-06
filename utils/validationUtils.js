// Validation utility functions

export const validateLocation = (location) => {
  const errors = [];
  
  if (!location) {
    errors.push('Location is required');
    return errors;
  }

  if (!location.state || typeof location.state !== 'string') {
    errors.push('State is required and must be a string');
  }

  if (!location.district || typeof location.district !== 'string') {
    errors.push('District is required and must be a string');
  }

  if (!location.tehsil || typeof location.tehsil !== 'string') {
    errors.push('Tehsil is required and must be a string');
  }

  if (!location.village || typeof location.village !== 'string') {
    errors.push('Village is required and must be a string');
  }

  if (!location.coordinates || !Array.isArray(location.coordinates)) {
    errors.push('Coordinates are required and must be an array');
  } else if (location.coordinates.length !== 2) {
    errors.push('Coordinates must be an array of [longitude, latitude]');
  } else {
    const [longitude, latitude] = location.coordinates;
    if (typeof longitude !== 'number' || longitude < -180 || longitude > 180) {
      errors.push('Longitude must be a number between -180 and 180');
    }
    if (typeof latitude !== 'number' || latitude < -90 || latitude > 90) {
      errors.push('Latitude must be a number between -90 and 90');
    }
  }

  return errors;
};

export const validatePhone = (phone) => {
  if (!phone) return 'Phone number is required';
  
  const phoneRegex = /^[0-9]{10}$/;
  if (!phoneRegex.test(phone)) {
    return 'Phone number must be exactly 10 digits';
  }
  
  return null; // No error
};

export const validateEmail = (email) => {
  if (!email) return 'Email is required';
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return 'Please enter a valid email address';
  }
  
  return null; // No error
};

export const validatePassword = (password) => {
  if (!password) return 'Password is required';
  
  if (password.length < 6) {
    return 'Password must be at least 6 characters long';
  }
  
  if (password.length > 128) {
    return 'Password cannot exceed 128 characters';
  }
  
  return null; // No error
};

export const validateIssueData = (issueData) => {
  const errors = [];
  
  if (!issueData.title || typeof issueData.title !== 'string') {
    errors.push('Issue title is required and must be a string');
  } else if (issueData.title.length > 100) {
    errors.push('Issue title cannot exceed 100 characters');
  }

  if (!issueData.description || typeof issueData.description !== 'string') {
    errors.push('Issue description is required and must be a string');
  } else if (issueData.description.length > 500) {
    errors.push('Issue description cannot exceed 500 characters');
  }

  if (!issueData.category) {
    errors.push('Issue category is required');
  } else {
    const validCategories = ['road', 'streetlight', 'water', 'sanitation', 'electricity', 'garbage', 'drainage', 'park', 'traffic', 'noise', 'other'];
    if (!validCategories.includes(issueData.category)) {
      errors.push('Invalid issue category');
    }
  }

  if (issueData.priority) {
    const validPriorities = ['low', 'medium', 'high', 'critical'];
    if (!validPriorities.includes(issueData.priority)) {
      errors.push('Invalid priority level');
    }
  }

  if (issueData.location) {
    const locationErrors = validateLocation(issueData.location);
    errors.push(...locationErrors);
  }

  return errors;
};

export const validatePaginationParams = (page, limit) => {
  const errors = [];
  
  if (page && (!Number.isInteger(Number(page)) || Number(page) < 1)) {
    errors.push('Page must be a positive integer');
  }
  
  if (limit && (!Number.isInteger(Number(limit)) || Number(limit) < 1 || Number(limit) > 100)) {
    errors.push('Limit must be an integer between 1 and 100');
  }
  
  return errors;
};

export const validateDateRange = (startDate, endDate) => {
  const errors = [];
  
  if (startDate) {
    const start = new Date(startDate);
    if (isNaN(start.getTime())) {
      errors.push('Start date must be a valid date');
    }
  }
  
  if (endDate) {
    const end = new Date(endDate);
    if (isNaN(end.getTime())) {
      errors.push('End date must be a valid date');
    }
  }
  
  if (startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (start > end) {
      errors.push('Start date cannot be after end date');
    }
  }
  
  return errors;
};
