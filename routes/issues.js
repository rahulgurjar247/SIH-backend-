import express from 'express';
import { body, validationResult } from 'express-validator';
import { 
  createIssue, 
  getIssues, 
  getIssue, 
  updateIssue, 
  voteIssue, 
  getNearbyIssues 
} from '../controllers/index.js';
import { protect, authorize } from '../middleware/index.js';
import { cloudinaryUpload, handleUploadError } from '../middleware/cloudinaryUpload.js';
import { addIssueUpdate, getIssueUpdates } from '../controllers/index.js';

const router = express.Router();

// @route   POST /api/issues
// @desc    Create new issue
// @access  Private
router.post('/create', protect, cloudinaryUpload, handleUploadError, [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Issue title is required')
    .isLength({ min: 5, max: 200 })
    .withMessage('Title must be between 5 and 200 characters'),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Issue description is required')
    .isLength({ min: 10, max: 2000 })
    .withMessage('Description must be between 10 and 2000 characters'),
  body('category')
    .isIn(['road', 'water', 'electricity', 'garbage', 'drainage', 'park', 'traffic', 'other'])
    .withMessage('Invalid issue category'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'critical'])
    .withMessage('Invalid priority level'),
  body('coordinates')
    .optional()
    .custom((value) => {
      if (!value) {
        return true; // coordinates are optional
      }
      
      try {
        let coords = value;
        
        // When coming from FormData (like from React Native), it will be a string.
        if (typeof value === 'string') {
          coords = JSON.parse(value);
        }
        
        if (!Array.isArray(coords) || coords.length !== 2) {
          throw new Error('Coordinates must be an array of [longitude, latitude]');
        }
        
        const [longitude, latitude] = coords.map(coord => parseFloat(coord));
        
        if (isNaN(longitude) || isNaN(latitude)) {
          throw new Error('Coordinates must be valid numbers');
        }
        
        if (longitude < -180 || longitude > 180 || latitude < -90 || latitude > 90) {
          throw new Error('Invalid coordinate values. Longitude: -180 to 180, Latitude: -90 to 90');
        }
        
        return true;
      } catch (error) {
        throw new Error(`Invalid coordinates format: ${error.message}`);
      }
    }),
  body('address')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Address cannot be more than 500 characters'),
  body('tags')
    .optional()
    .custom((value) => {
      if (!value) return true;
      
      // Handle string format (comma separated)
      if (typeof value === 'string') {
        const tags = value.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
        if (tags.length > 10) {
          throw new Error('Maximum 10 tags allowed');
        }
        return true;
      }
      
      // Handle array format
      if (Array.isArray(value)) {
        if (value.length > 10) {
          throw new Error('Maximum 10 tags allowed');
        }
        return true;
      }
      
      throw new Error('Tags must be a string or array');
    }),
  body('isAnonymous')
    .optional()
    .custom((value) => {
      // Handle string 'true'/'false' from FormData or boolean
      if (value === 'true' || value === 'false' || typeof value === 'boolean') {
        return true;
      }
      throw new Error('isAnonymous must be true or false');
    })
], async (req, res) => {
  try {
    console.log("🔍 Validation check starting...");
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log("❌ Validation errors found:", errors.array());
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }
    console.log("✅ Validation passed, calling createIssue controller...");
    await createIssue(req, res);
  } catch (error) {
    console.error('Create issue error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating issue'
    });
  }
});

// @route   GET /api/issues
// @desc    Get all issues with filters and pagination
// @access  Public (with optional auth)
router.get('/', getIssues);

// @route   GET /api/issues/nearby
// @desc    Get nearby issues based on coordinates
// @access  Public
router.get('/nearby', getNearbyIssues);

// @route   GET /api/issues/:id
// @desc    Get single issue by ID
// @access  Public (with optional auth)
router.get('/:id', getIssue);

// @route   POST /api/issues/:id/vote
// @desc    Vote on issue (upvote/downvote)
// @access  Private
router.post('/:id/vote', protect, [
  body('voteType')
    .isIn(['upvote', 'downvote'])
    .withMessage('Vote type must be either "upvote" or "downvote"')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }
    await voteIssue(req, res);
  } catch (error) {
    console.error('Vote issue error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while recording vote'
    });
  }
});

// @route   PUT /api/issues/:id
// @desc    Update issue
// @access  Private (owner or admin/staff)
router.put('/:id', protect, [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Title must be between 5 and 200 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Description must be between 10 and 2000 characters'),
  body('category')
    .optional()
    .isIn(['road', 'water', 'electricity', 'garbage', 'drainage', 'park', 'traffic', 'other'])
    .withMessage('Invalid issue category'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'critical'])
    .withMessage('Invalid priority level')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }
    await updateIssue(req, res);
  } catch (error) {
    console.error('Update issue error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating issue'
    });
  }
});

// @route   GET /api/issues/:id/updates
// @desc    Get progress updates for an issue
// @access  Private (authorized roles)
router.get('/:id/updates', protect, getIssueUpdates);

// @route   POST /api/issues/:id/updates
// @desc    Add a progress update (note, optional images, optional status change)
// @access  Private (admin/department/staff)
router.post(
  '/:id/updates',
  protect,
  cloudinaryUpload,
  handleUploadError,
  [
    body('note').optional().isLength({ max: 1000 }).withMessage('Note too long'),
    body('status').optional().isIn(['pending', 'acknowledged', 'in-progress', 'resolved', 'rejected']).withMessage('Invalid status'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: 'Validation errors', errors: errors.array() });
    }
    await addIssueUpdate(req, res);
  }
);

export default router;