import express from 'express';
import { body, validationResult } from 'express-validator';
import { 
  getNotifications, 
  getUnreadCount, 
  markAsRead, 
  markAllAsRead, 
  deleteNotification, 
  clearReadNotifications, 
  createTestNotification 
} from '../controllers/index.js';
import { protect } from '../middleware/index.js';

const router = express.Router();

// All notification routes require authentication
router.use(protect);

// @route   GET /api/notifications
// @desc    Get user notifications with filters and pagination
// @access  Private
router.get('/', getNotifications);

// @route   GET /api/notifications/unread-count
// @desc    Get unread notification count
// @access  Private
router.get('/unread-count', getUnreadCount);

// @route   PUT /api/notifications/:id/read
// @desc    Mark notification as read
// @access  Private
router.put('/:id/read', markAsRead);

// @route   PUT /api/notifications/read-all
// @desc    Mark all notifications as read
// @access  Private
router.put('/read-all', markAllAsRead);

// @route   DELETE /api/notifications/:id
// @desc    Delete single notification
// @access  Private
router.delete('/:id', deleteNotification);

// @route   DELETE /api/notifications/clear-read
// @desc    Clear all read notifications
// @access  Private
router.delete('/clear-read', clearReadNotifications);

// @route   POST /api/notifications/test
// @desc    Create test notification (for testing purposes)
// @access  Private
router.post('/test', [
  body('title')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Title cannot be more than 100 characters'),
  body('message')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Message cannot be more than 500 characters'),
  body('type')
    .optional()
    .isIn(['issue_update', 'status_change', 'assignment', 'reminder', 'announcement', 'system'])
    .withMessage('Invalid notification type'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'urgent'])
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
    await createTestNotification(req, res);
  } catch (error) {
    console.error('Create test notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating test notification'
    });
  }
});

export default router;
