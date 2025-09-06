import Issue from '../../models/Issue.js';
import { 
  createSuccessResponse, 
  createErrorResponse,
  createUploadErrorResponse 
} from '../../utils/responseUtils.js';
import { ERROR_CODES } from '../../utils/errorTypes.js';
import { asyncHandler } from '../../middleware/errorHandler.js';

export const createIssue = asyncHandler(async (req, res) => {
  const { title, description, category, priority, location, isAnonymous, tags } = req.body;

  // Debug logging
  console.log('🔍 Create Issue Request Body:', {
    title,
    description,
    category,
    priority,
    location,
    isAnonymous,
    tags,
    coordinates: req.body.coordinates
  });

  // Validate required fields
  if (!title || !description || !category) {
    console.log('❌ Missing required fields:', { title: !!title, description: !!description, category: !!category });
    const errorResponse = createErrorResponse(
      ERROR_CODES.VALIDATION_REQUIRED_FIELD,
      'Title, description, and category are required'
    );
    return res.status(errorResponse.statusCode).json(errorResponse);
  }

  console.log("✅ Required fields validation passed")

  // Validate title length
  if (title.length < 5 || title.length > 200) {
    const errorResponse = createErrorResponse(
      ERROR_CODES.VALIDATION_STRING_TOO_LONG,
      'Title must be between 5 and 200 characters'
    );
    return res.status(errorResponse.statusCode).json(errorResponse);
  }

  // Validate description length
  if (description.length < 10 || description.length > 2000) {
    const errorResponse = createErrorResponse(
      ERROR_CODES.VALIDATION_STRING_TOO_LONG,
      'Description must be between 10 and 2000 characters'
    );
    return res.status(errorResponse.statusCode).json(errorResponse);
  }

  // Validate category
  const validCategories = ['road', 'water', 'electricity', 'garbage', 'drainage', 'park', 'traffic', 'other'];
  console.log('🔍 Validating category:', category, 'Valid categories:', validCategories);
  if (!validCategories.includes(category)) {
    console.log('❌ Invalid category:', category);
    const errorResponse = createErrorResponse(
      ERROR_CODES.VALIDATION_INVALID_VALUE,
      `Category must be one of: ${validCategories.join(', ')}`
    );
    return res.status(errorResponse.statusCode).json(errorResponse);
  }
  console.log('✅ Category validation passed');

  // Validate priority
  const validPriorities = ['low', 'medium', 'high', 'critical'];
  console.log('🔍 Validating priority:', priority, 'Valid priorities:', validPriorities);
  if (priority && !validPriorities.includes(priority)) {
    console.log('❌ Invalid priority:', priority);
    const errorResponse = createErrorResponse(
      ERROR_CODES.VALIDATION_INVALID_VALUE,
      `Priority must be one of: ${validPriorities.join(', ')}`
    );
    return res.status(errorResponse.statusCode).json(errorResponse);
  }
  console.log('✅ Priority validation passed');

  // Parse and validate coordinates
  let longitude = null;
  let latitude = null;
  if (req.body.coordinates) {
    console.log('🔍 Validating coordinates:', req.body.coordinates);
    try {
      const coordinates = JSON.parse(req.body.coordinates);
      console.log('🔍 Parsed coordinates:', coordinates);
      
      if (!Array.isArray(coordinates) || coordinates.length !== 2) {
        console.log('❌ Invalid coordinates format - not array or wrong length:', coordinates);
        const errorResponse = createErrorResponse(
          ERROR_CODES.VALIDATION_INVALID_COORDINATES,
          'Location coordinates must be an array with [longitude, latitude]'
        );
        return res.status(errorResponse.statusCode).json(errorResponse);
      }

      [longitude, latitude] = coordinates;
      if (typeof longitude !== 'number' || typeof latitude !== 'number' ||
          longitude < -180 || longitude > 180 || latitude < -90 || latitude > 90) {
        console.log('❌ Invalid coordinate values:', { longitude, latitude });
        const errorResponse = createErrorResponse(
          ERROR_CODES.VALIDATION_INVALID_COORDINATES,
          'Invalid coordinate values. Longitude must be between -180 and 180, latitude between -90 and 90'
        );
        return res.status(errorResponse.statusCode).json(errorResponse);
      }
      console.log('✅ Coordinates validation passed');
    } catch (error) {
      console.log('❌ Error parsing coordinates:', error);
      const errorResponse = createErrorResponse(
        ERROR_CODES.VALIDATION_INVALID_COORDINATES,
        'Invalid coordinates format'
      );
      return res.status(errorResponse.statusCode).json(errorResponse);
    }
  } else {
    console.log('⚠️ No coordinates provided');
  }

  // Process uploaded images from Cloudinary
  const images = [];
  if (req.cloudinaryResults && req.cloudinaryResults.length > 0) {
    console.log('📸 Processing Cloudinary upload results:', req.cloudinaryResults.length);
    
    req.cloudinaryResults.forEach((result, index) => {
      if (result.success) {
        images.push({
          url: result.secure_url,
          publicId: result.public_id,
          width: result.width,
          height: result.height,
          format: result.format,
          bytes: result.bytes
        });
        
        console.log('📸 Cloudinary image processed:', {
          index: index,
          publicId: result.public_id,
          url: result.secure_url,
          dimensions: `${result.width}x${result.height}`,
          format: result.format,
          size: `${Math.round(result.bytes / 1024)}KB`
        });
      } else {
        console.error('❌ Cloudinary upload failed for file:', index, result.error);
      }
    });
  }

  // Create new issue
  const issue = new Issue({
    title,
    description,
    category,
    priority: priority || 'medium',
    longitude,
    latitude,
    images,
    reportedBy: req.user._id,
    isAnonymous: isAnonymous === 'true',
    tags: tags ? tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0) : []
  });

  await issue.save();

  // Populate reporter details
  await issue.populate('reportedBy', 'name email phone');

  const successResponse = createSuccessResponse(
    issue,
    'Issue reported successfully'
  );
  
  console.log('✅ Issue created successfully:', {
    id: issue._id,
    title: issue.title,
    category: issue.category,
    priority: issue.priority,
    longitude: issue.longitude,
    latitude: issue.latitude,
    imageCount: issue.images.length
  });
  
  res.status(201).json(successResponse);
});
