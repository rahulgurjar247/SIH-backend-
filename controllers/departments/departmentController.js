import Department from '../../models/Department.js';
import User from '../../models/User.js';
import { 
  createSuccessResponse, 
  createErrorResponse,
  createValidationErrorResponse 
} from '../../utils/responseUtils.js';
import { ERROR_CODES } from '../../utils/errorTypes.js';

// @desc    Get all departments
// @route   GET /api/v1/departments
// @access  Private (Admin/Staff)
export const getDepartments = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      isActive,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filter = {};
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (isActive !== undefined) {
      filter.isActive = isActive === 'true';
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get departments with pagination
    const departments = await Department.find(filter)
      .populate('headOfDepartment', 'name email role')
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count
    const total = await Department.countDocuments(filter);

    // Get department statistics
    const stats = await Department.getDepartmentStats();

    const response = createSuccessResponse({
      departments,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        itemsPerPage: parseInt(limit),
        hasNextPage: skip + departments.length < total,
        hasPrevPage: parseInt(page) > 1
      },
      stats
    });

    res.json(response);
  } catch (error) {
    console.error('Get departments error:', error);
    const errorResponse = createErrorResponse(
      ERROR_CODES.INTERNAL_SERVER_ERROR,
      'Failed to fetch departments'
    );
    res.status(errorResponse.statusCode).json(errorResponse);
  }
};

// @desc    Get department by ID
// @route   GET /api/v1/departments/:id
// @access  Private (Admin/Staff)
export const getDepartmentById = async (req, res) => {
  try {
    const { id } = req.params;

    const department = await Department.findById(id)
      .populate('headOfDepartment', 'name email role phone')
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email');

    if (!department) {
      const errorResponse = createErrorResponse(
        ERROR_CODES.NOT_FOUND,
        'Department not found'
      );
      return res.status(errorResponse.statusCode).json(errorResponse);
    }

    // Get department statistics
    const stats = await Department.getDepartmentStats();
    const departmentStats = stats.find(stat => stat._id.toString() === id);

    const response = createSuccessResponse({
      department,
      stats: departmentStats || {
        totalIssues: 0,
        resolvedIssues: 0,
        pendingIssues: 0,
        inProgressIssues: 0,
        resolutionRate: 0
      }
    });

    res.json(response);
  } catch (error) {
    console.error('Get department by ID error:', error);
    const errorResponse = createErrorResponse(
      ERROR_CODES.INTERNAL_SERVER_ERROR,
      'Failed to fetch department'
    );
    res.status(errorResponse.statusCode).json(errorResponse);
  }
};

// @desc    Create new department
// @route   POST /api/v1/departments
// @access  Private (Admin only)
export const createDepartment = async (req, res) => {
  try {
    const {
      name,
      description,
      headOfDepartment,
      contactEmail,
      contactPhone,
      address
    } = req.body;

    // Check if department already exists
    const existingDepartment = await Department.findOne({ 
      name: { $regex: new RegExp(`^${name}$`, 'i') } 
    });

    if (existingDepartment) {
      const errorResponse = createErrorResponse(
        ERROR_CODES.VALIDATION_ERROR,
        'Department with this name already exists'
      );
      return res.status(errorResponse.statusCode).json(errorResponse);
    }

    // Validate head of department if provided
    if (headOfDepartment) {
      const user = await User.findById(headOfDepartment);
      if (!user) {
        const errorResponse = createErrorResponse(
          ERROR_CODES.VALIDATION_ERROR,
          'Head of department user not found'
        );
        return res.status(errorResponse.statusCode).json(errorResponse);
      }
    }

    const departmentData = {
      name,
      description,
      headOfDepartment,
      contactEmail,
      contactPhone,
      address,
      createdBy: req.user.id
    };

    const department = await Department.create(departmentData);

    await department.populate([
      { path: 'headOfDepartment', select: 'name email role' },
      { path: 'createdBy', select: 'name email' }
    ]);

    const response = createSuccessResponse({
      department,
      message: 'Department created successfully'
    });

    res.status(201).json(response);
  } catch (error) {
    console.error('Create department error:', error);
    
    if (error.name === 'ValidationError') {
      const errorResponse = createValidationErrorResponse(error);
      return res.status(errorResponse.statusCode).json(errorResponse);
    }

    const errorResponse = createErrorResponse(
      ERROR_CODES.INTERNAL_SERVER_ERROR,
      'Failed to create department'
    );
    res.status(errorResponse.statusCode).json(errorResponse);
  }
};

// @desc    Update department
// @route   PUT /api/v1/departments/:id
// @access  Private (Admin only)
export const updateDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Remove fields that shouldn't be updated
    delete updateData.createdBy;
    delete updateData.createdAt;

    // Add updatedBy
    updateData.updatedBy = req.user.id;

    const department = await Department.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate([
      { path: 'headOfDepartment', select: 'name email role' },
      { path: 'createdBy', select: 'name email' },
      { path: 'updatedBy', select: 'name email' }
    ]);

    if (!department) {
      const errorResponse = createErrorResponse(
        ERROR_CODES.NOT_FOUND,
        'Department not found'
      );
      return res.status(errorResponse.statusCode).json(errorResponse);
    }

    const response = createSuccessResponse({
      department,
      message: 'Department updated successfully'
    });

    res.json(response);
  } catch (error) {
    console.error('Update department error:', error);
    
    if (error.name === 'ValidationError') {
      const errorResponse = createValidationErrorResponse(error);
      return res.status(errorResponse.statusCode).json(errorResponse);
    }

    const errorResponse = createErrorResponse(
      ERROR_CODES.INTERNAL_SERVER_ERROR,
      'Failed to update department'
    );
    res.status(errorResponse.statusCode).json(errorResponse);
  }
};

// @desc    Delete department
// @route   DELETE /api/v1/departments/:id
// @access  Private (Admin only)
export const deleteDepartment = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if department has any issues
    const Issue = (await import('../../models/Issue.js')).default;
    const issueCount = await Issue.countDocuments({ department: id });

    if (issueCount > 0) {
      const errorResponse = createErrorResponse(
        ERROR_CODES.VALIDATION_ERROR,
        'Cannot delete department with existing issues. Please reassign issues first.'
      );
      return res.status(errorResponse.statusCode).json(errorResponse);
    }

    const department = await Department.findByIdAndDelete(id);

    if (!department) {
      const errorResponse = createErrorResponse(
        ERROR_CODES.NOT_FOUND,
        'Department not found'
      );
      return res.status(errorResponse.statusCode).json(errorResponse);
    }

    const response = createSuccessResponse({
      message: 'Department deleted successfully'
    });

    res.json(response);
  } catch (error) {
    console.error('Delete department error:', error);
    const errorResponse = createErrorResponse(
      ERROR_CODES.INTERNAL_SERVER_ERROR,
      'Failed to delete department'
    );
    res.status(errorResponse.statusCode).json(errorResponse);
  }
};

// @desc    Get department statistics
// @route   GET /api/v1/departments/stats
// @access  Private (Admin/Staff)
export const getDepartmentStats = async (req, res) => {
  try {
    const stats = await Department.getDepartmentStats();

    const response = createSuccessResponse({
      stats,
      message: 'Department statistics retrieved successfully'
    });

    res.json(response);
  } catch (error) {
    console.error('Get department stats error:', error);
    const errorResponse = createErrorResponse(
      ERROR_CODES.INTERNAL_SERVER_ERROR,
      'Failed to fetch department statistics'
    );
    res.status(errorResponse.statusCode).json(errorResponse);
  }
};
