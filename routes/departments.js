import express from 'express';
import { body, param, query, validationResult } from 'express-validator';
import {
  getDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  getDepartmentStats
} from '../controllers/departments/departmentController.js';
import { protect, authorize } from '../middleware/index.js';

const router = express.Router();

// All department routes require authentication
router.use(protect);

// @route   GET /api/v1/departments
// @desc    Get all departments
// @access  Private (Admin/Staff)
router.get('/', authorize('admin', 'department'), [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('search')
    .optional()
    .trim()
    .isLength({ min: 2 })
    .withMessage('Search query must be at least 2 characters'),
  query('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean'),
  query('sortBy')
    .optional()
    .isIn(['name', 'createdAt', 'updatedAt', 'totalIssues'])
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
    await getDepartments(req, res);
  } catch (error) {
    console.error('Get departments error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching departments'
    });
  }
});

// @route   GET /api/v1/departments/stats
// @desc    Get department statistics
// @access  Private (Admin/Staff)
router.get('/stats', authorize('admin', 'department'), async (req, res) => {
  try {
    await getDepartmentStats(req, res);
  } catch (error) {
    console.error('Get department stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching department statistics'
    });
  }
});

// @route   GET /api/v1/departments/:id
// @desc    Get department by ID
// @access  Private (Admin/Staff)
router.get('/:id', authorize('admin', 'department'), [
  param('id')
    .isMongoId()
    .withMessage('Invalid department ID')
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
    await getDepartmentById(req, res);
  } catch (error) {
    console.error('Get department by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching department'
    });
  }
});

// @route   POST /api/v1/departments
// @desc    Create new department
// @access  Private (Admin only)
router.post('/', authorize('admin'), [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Department name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Department name must be between 2 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  body('headOfDepartment')
    .optional()
    .isMongoId()
    .withMessage('Invalid head of department ID'),
  body('contactEmail')
    .optional()
    .isEmail()
    .withMessage('Please provide a valid email address'),
  body('contactPhone')
    .optional()
    .matches(/^[\+]?[1-9][\d]{0,15}$/)
    .withMessage('Please provide a valid phone number'),
  body('address.street')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Street address cannot exceed 200 characters'),
  body('address.city')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('City name cannot exceed 100 characters'),
  body('address.state')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('State name cannot exceed 100 characters'),
  body('address.zipCode')
    .optional()
    .trim()
    .isLength({ max: 20 })
    .withMessage('Zip code cannot exceed 20 characters')
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
    await createDepartment(req, res);
  } catch (error) {
    console.error('Create department error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating department'
    });
  }
});

// @route   PUT /api/v1/departments/:id
// @desc    Update department
// @access  Private (Admin only)
router.put('/:id', authorize('admin'), [
  param('id')
    .isMongoId()
    .withMessage('Invalid department ID'),
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Department name must be between 2 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  body('headOfDepartment')
    .optional()
    .isMongoId()
    .withMessage('Invalid head of department ID'),
  body('contactEmail')
    .optional()
    .isEmail()
    .withMessage('Please provide a valid email address'),
  body('contactPhone')
    .optional()
    .matches(/^[\+]?[1-9][\d]{0,15}$/)
    .withMessage('Please provide a valid phone number'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean')
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
    await updateDepartment(req, res);
  } catch (error) {
    console.error('Update department error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating department'
    });
  }
});

// @route   DELETE /api/v1/departments/:id
// @desc    Delete department
// @access  Private (Admin only)
router.delete('/:id', authorize('admin'), [
  param('id')
    .isMongoId()
    .withMessage('Invalid department ID')
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
    await deleteDepartment(req, res);
  } catch (error) {
    console.error('Delete department error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting department'
    });
  }
});

export default router;
