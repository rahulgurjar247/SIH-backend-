import multer from 'multer';
import { uploadMultipleToCloudinary } from '../utils/cloudinary.js';

// Configure multer to store files in memory (as buffers)
const storage = multer.memoryStorage();

// File filter
const fileFilter = (req, file, cb) => {
  // Accept only image files
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024, // 10MB default
    files: 5 // Maximum 5 files
  },
  fileFilter: fileFilter
});

// Middleware to upload files to Cloudinary after multer processing
export const uploadToCloudinaryMiddleware = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      req.cloudinaryResults = [];
      return next();
    }

    console.log(`📤 Uploading ${req.files.length} files to Cloudinary...`);

    // Upload files to Cloudinary
    const cloudinaryResults = await uploadMultipleToCloudinary(req.files, 'civic-issues');

    // Check for upload failures
    const failedUploads = cloudinaryResults.filter(result => !result.success);
    if (failedUploads.length > 0) {
      console.error('❌ Some files failed to upload to Cloudinary:', failedUploads);
      return res.status(400).json({
        success: false,
        message: 'Some files failed to upload to Cloudinary',
        errors: failedUploads.map(result => result.error)
      });
    }

    // Attach results to request object
    req.cloudinaryResults = cloudinaryResults;
    
    console.log('✅ All files uploaded to Cloudinary successfully');
    next();
  } catch (error) {
    console.error('❌ Cloudinary upload middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'File upload to Cloudinary failed',
      error: error.message
    });
  }
};

// Error handling middleware for multer
export const handleUploadError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File too large. Maximum size is 10MB.'
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Too many files. Maximum 5 files allowed.'
      });
    }
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        message: 'Unexpected field in file upload.'
      });
    }
  }
  
  if (error.message === 'Only image files are allowed!') {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
  
  next(error);
};

// Export multer upload middleware
export { upload };

// Combined middleware for easy use
export const cloudinaryUpload = [upload.array('images', 5), uploadToCloudinaryMiddleware];
