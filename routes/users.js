import express from 'express';
import { query, validationResult } from 'express-validator';
import { 
  getProfile, 
  getMyIssues, 
  getAssignedIssues, 
  searchUsers, 
  getUserById, 
  getUserIssues 
} from '../controllers/index.js';
import { protect, authorize } from '../middleware/index.js';

const router = express.Router();

// All user routes require authentication
router.use(protect);

// @route   GET /api/users/profile
// @desc    Get current user profile
// @access  Private
router.get('/profile', getProfile);

// @route   GET /api/users/my-issues
// @desc    Get current user's reported issues
// @access  Private
router.get('/my-issues', getMyIssues);

// @route   GET /api/users/assigned-issues
// @desc    Get issues assigned to current user (staff/admin only)
// @access  Private (Staff/Admin only)
router.get('/assigned-issues', authorize('staff', 'admin'), getAssignedIssues);

// @route   GET /api/users/search
// @desc    Search users (admin only)
// @access  Private (Admin only)
router.get('/search', authorize('admin'), [
  query('query')
    .optional()
    .trim()
    .isLength({ min: 2 })
    .withMessage('Search query must be at least 2 characters'),
  query('role')
    .optional()
    .isIn(['citizen', 'staff', 'admin'])
    .withMessage('Invalid role'),
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('sortBy')
    .optional()
    .isIn(['createdAt', 'updatedAt', 'name', 'email', 'role'])
    .withMessage('Invalid sort field'),
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be "asc" or "desc"')
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
    await searchUsers(req, res);
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while searching users'
    });
  }
});

// @route   GET /api/users/:id
// @desc    Get user by ID (owner or admin only)
// @access  Private
router.get('/:id', getUserById);

// @route   GET /api/users/:id/issues
// @desc    Get issues reported by specific user (owner or admin only)
// @access  Private
router.get('/:id/issues', getUserIssues);

export default router;
