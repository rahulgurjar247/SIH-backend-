import express from 'express';
import { query, validationResult } from 'express-validator';
import { 
  getIssuesOverview, 
  getLocationStats, 
  getTrends, 
  getUserStats, 
  getPerformanceMetrics 
} from '../controllers/index.js';
import { protect, authorize } from '../middleware/index.js';

const router = express.Router();

// All analytics routes require authentication
router.use(protect);

// @route   GET /api/analytics/issues-overview
// @desc    Get issues overview statistics
// @access  Private
router.get('/issues-overview', [
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid ISO 8601 date'),
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid ISO 8601 date')
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
    await getIssuesOverview(req, res);
  } catch (error) {
    console.error('Issues overview error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching issues overview'
    });
  }
});

// @route   GET /api/analytics/location-stats
// @desc    Get location-based statistics
// @access  Private
router.get('/location-stats', [
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid ISO 8601 date'),
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid ISO 8601 date')
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
    await getLocationStats(req, res);
  } catch (error) {
    console.error('Location stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching location statistics'
    });
  }
});

// @route   GET /api/analytics/trends
// @desc    Get trends over time
// @access  Private
router.get('/trends', [
  query('period')
    .optional()
    .isIn(['daily', 'weekly', 'monthly'])
    .withMessage('Period must be daily, weekly, or monthly'),
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid ISO 8601 date'),
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid ISO 8601 date')
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
    await getTrends(req, res);
  } catch (error) {
    console.error('Trends error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching trends'
    });
  }
});

// @route   GET /api/analytics/user-stats
// @desc    Get user statistics (Admin only)
// @access  Private (Admin only)
router.get('/user-stats', authorize('admin'), [
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid ISO 8601 date'),
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid ISO 8601 date')
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
    await getUserStats(req, res);
  } catch (error) {
    console.error('User stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching user statistics'
    });
  }
});

// @route   GET /api/analytics/performance
// @desc    Get performance metrics (Admin only)
// @access  Private (Admin only)
router.get('/performance', authorize('admin'), [
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid ISO 8601 date'),
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid ISO 8601 date')
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
    await getPerformanceMetrics(req, res);
  } catch (error) {
    console.error('Performance metrics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching performance metrics'
    });
  }
});

export default router;
