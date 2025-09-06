import express from 'express';
import { body, validationResult } from 'express-validator';
import { 
  getDashboard, 
  updateIssueStatus, 
  assignIssue, 
  getUsers, 
  updateUserRole, 
  verifyUser, 
  deleteUser 
} from '../controllers/index.js';
import { protect, authorize } from '../middleware/index.js';

const router = express.Router();

// All admin routes require admin role
router.use(protect, authorize('admin'));

// @route   GET /api/admin/dashboard
// @desc    Get admin dashboard statistics
// @access  Private (Admin only)
router.get('/dashboard', getDashboard);

// @route   PUT /api/admin/issues/:id/status
// @desc    Update issue status and assign to staff
// @access  Private (Admin only)
router.put('/issues/:id/status', [
  body('status')
    .optional()
    .isIn(['pending', 'acknowledged', 'in-progress', 'resolved', 'rejected'])
    .withMessage('Invalid status'),
  body('assignedTo')
    .optional()
    .isMongoId()
    .withMessage('Invalid user ID'),
  body('resolutionNotes')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Resolution notes cannot be more than 1000 characters'),
  body('estimatedResolutionTime')
    .optional()
    .isISO8601()
    .withMessage('Invalid date format')
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
    await updateIssueStatus(req, res);
  } catch (error) {
    console.error('Update issue status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating issue status'
    });
  }
});

// @route   PUT /api/admin/issues/:id/assign
// @desc    Assign issue to staff member
// @access  Private (Admin only)
router.put('/issues/:id/assign', [
  body('assignedTo')
    .isMongoId()
    .withMessage('Invalid user ID'),
  body('estimatedResolutionTime')
    .optional()
    .isISO8601()
    .withMessage('Invalid date format')
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
    await assignIssue(req, res);
  } catch (error) {
    console.error('Assign issue error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while assigning issue'
    });
  }
});

// @route   GET /api/admin/users
// @desc    Get all users with filters
// @access  Private (Admin only)
router.get('/users', getUsers);

// @route   PUT /api/admin/users/:id/role
// @desc    Update user role
// @access  Private (Admin only)
router.put('/users/:id/role', [
  body('role')
    .isIn(['citizen', 'staff', 'admin'])
    .withMessage('Invalid role. Must be citizen, staff, or admin')
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
    await updateUserRole(req, res);
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating user role'
    });
  }
});

// @route   PUT /api/admin/users/:id/verify
// @desc    Verify user account
// @access  Private (Admin only)
router.put('/users/:id/verify', verifyUser);

// @route   DELETE /api/admin/users/:id
// @desc    Delete user account
// @access  Private (Admin only)
router.delete('/users/:id', deleteUser);

export default router;
