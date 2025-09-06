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

const router = express.Router();

// @route   POST /api/issues
// @desc    Create new issue
// @access  Private
router.post('/create', protect, cloudinaryUpload, handleUploadError, [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Issue title is required')
    .isLength({ max: 100 })
    .withMessage('Title cannot be more than 100 characters'),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Issue description is required')
    .isLength({ max: 500 })
    .withMessage('Description cannot be more than 500 characters'),
  body('category')
    .isIn(['road', 'water', 'electricity', 'garbage', 'drainage', 'park', 'traffic', 'other'])
    .withMessage('Invalid issue category'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'critical'])
    .withMessage('Invalid priority level'),
  body('coordinates')
    .custom((value) => {
      try {
        const coords = JSON.parse(value);
        if (!Array.isArray(coords) || coords.length !== 2) {
          throw new Error('Coordinates must be an array of [longitude, latitude]');
        }
        if (typeof coords[0] !== 'number' || typeof coords[1] !== 'number') {
          throw new Error('Coordinates must be valid numbers');
        }
        return true;
      } catch (error) {
        throw new Error('Invalid coordinates format');
      }
    })
], async (req, res) => {
  try {
    console.log("cook")
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log("1")
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }
    console.log("2")
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
    .isLength({ max: 100 })
    .withMessage('Title cannot be more than 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot be more than 500 characters'),
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

// ...existing code...

export default router;
