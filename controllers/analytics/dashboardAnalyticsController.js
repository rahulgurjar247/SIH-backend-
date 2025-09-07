import Issue from '../../models/Issue.js';
import User from '../../models/User.js';
import Department from '../../models/Department.js';
import { 
  createSuccessResponse, 
  createErrorResponse 
} from '../../utils/responseUtils.js';
import { ERROR_CODES } from '../../utils/errorTypes.js';

// @desc    Get comprehensive dashboard analytics
// @route   GET /api/v1/analytics/dashboard
// @access  Private
export const getDashboardAnalytics = async (req, res) => {
  try {
    const { startDate, endDate, department } = req.query;

    // Build date filter
    const dateFilter = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
      if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
    }

    // Build department filter
    const departmentFilter = {};
    if (department) {
      departmentFilter.department = department;
    }

    // Combine filters
    const filter = { ...dateFilter, ...departmentFilter };

    // Get basic statistics
    const [
      totalIssues,
      resolvedIssues,
      pendingIssues,
      inProgressIssues,
      rejectedIssues,
      issuesByCategory,
      issuesByPriority,
      issuesByStatus,
      issuesByDepartment,
      issuesByMonth,
      topReporters,
      topDepartments
    ] = await Promise.all([
      // Total issues
      Issue.countDocuments(filter),
      
      // Resolved issues
      Issue.countDocuments({ ...filter, status: 'resolved' }),
      
      // Pending issues
      Issue.countDocuments({ ...filter, status: 'pending' }),
      
      // In progress issues
      Issue.countDocuments({ ...filter, status: 'in-progress' }),
      
      // Rejected issues
      Issue.countDocuments({ ...filter, status: 'rejected' }),
      
      // Issues by category
      Issue.aggregate([
        { $match: filter },
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      
      // Issues by priority
      Issue.aggregate([
        { $match: filter },
        { $group: { _id: '$priority', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      
      // Issues by status
      Issue.aggregate([
        { $match: filter },
        { $group: { _id: '$status', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      
      // Issues by department
      Issue.aggregate([
        { $match: { ...filter, department: { $exists: true, $ne: null } } },
        {
          $lookup: {
            from: 'departments',
            localField: 'department',
            foreignField: '_id',
            as: 'departmentInfo'
          }
        },
        { $unwind: '$departmentInfo' },
        { $group: { _id: '$departmentInfo.name', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      
      // Issues by month (last 12 months)
      Issue.aggregate([
        { $match: filter },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' }
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
        { $limit: 12 }
      ]),
      
      // Top reporters
      Issue.aggregate([
        { $match: filter },
        {
          $lookup: {
            from: 'users',
            localField: 'reportedBy',
            foreignField: '_id',
            as: 'reporter'
          }
        },
        { $unwind: '$reporter' },
        { $group: { _id: '$reporter.name', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]),
      
      // Top departments with resolution rates
      Department.aggregate([
        {
          $lookup: {
            from: 'issues',
            localField: '_id',
            foreignField: 'department',
            as: 'issues'
          }
        },
        {
          $project: {
            name: 1,
            totalIssues: { $size: '$issues' },
            resolvedIssues: {
              $size: {
                $filter: {
                  input: '$issues',
                  cond: { $eq: ['$$this.status', 'resolved'] }
                }
              }
            }
          }
        },
        { $match: { totalIssues: { $gt: 0 } } },
        {
          $addFields: {
            resolutionRate: {
              $multiply: [
                { $divide: ['$resolvedIssues', '$totalIssues'] },
                100
              ]
            }
          }
        },
        { $sort: { totalIssues: -1 } },
        { $limit: 10 }
      ])
    ]);

    // Calculate average resolution time
    const resolutionTimeData = await Issue.aggregate([
      { $match: { ...filter, status: 'resolved' } },
      {
        $project: {
          resolutionTime: {
            $divide: [
              { $subtract: ['$updatedAt', '$createdAt'] },
              1000 * 60 * 60 * 24 // Convert to days
            ]
          }
        }
      },
      {
        $group: {
          _id: null,
          averageResolutionTime: { $avg: '$resolutionTime' }
        }
      }
    ]);

    const averageResolutionTime = resolutionTimeData.length > 0 
      ? Math.round(resolutionTimeData[0].averageResolutionTime) 
      : 0;

    // Format monthly data
    const formattedMonthlyData = issuesByMonth.map(item => ({
      month: `${item._id.year}-${item._id.month.toString().padStart(2, '0')}`,
      count: item.count
    }));

    // Format category data
    const formattedCategoryData = issuesByCategory.map(item => ({
      category: item._id,
      count: item.count
    }));

    // Format priority data
    const formattedPriorityData = issuesByPriority.map(item => ({
      priority: item._id,
      count: item.count
    }));

    // Format status data
    const formattedStatusData = issuesByStatus.map(item => ({
      status: item._id,
      count: item.count
    }));

    // Format department data
    const formattedDepartmentData = issuesByDepartment.map(item => ({
      department: item._id,
      count: item.count
    }));

    // Format top reporters
    const formattedTopReporters = topReporters.map(item => ({
      user: item._id,
      count: item.count
    }));

    // Format top departments
    const formattedTopDepartments = topDepartments.map(item => ({
      department: item.name,
      count: item.totalIssues,
      resolved: item.resolvedIssues
    }));

    const analytics = {
      totalIssues,
      resolvedIssues,
      pendingIssues,
      inProgressIssues,
      rejectedIssues,
      issuesByCategory: formattedCategoryData,
      issuesByPriority: formattedPriorityData,
      issuesByStatus: formattedStatusData,
      issuesByDepartment: formattedDepartmentData,
      issuesByMonth: formattedMonthlyData,
      averageResolutionTime,
      topReporters: formattedTopReporters,
      topDepartments: formattedTopDepartments
    };

    const response = createSuccessResponse({
      data: analytics,
      message: 'Dashboard analytics retrieved successfully'
    });

    res.json(response);
  } catch (error) {
    console.error('Get dashboard analytics error:', error);
    const errorResponse = createErrorResponse(
      ERROR_CODES.INTERNAL_SERVER_ERROR,
      'Failed to fetch dashboard analytics'
    );
    res.status(errorResponse.statusCode).json(errorResponse);
  }
};

// @desc    Get user statistics
// @route   GET /api/v1/analytics/users
// @access  Private (Admin only)
export const getUserAnalytics = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    // Build date filter
    const dateFilter = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
      if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
    }

    const [
      totalUsers,
      activeUsers,
      usersByRole,
      usersByDepartment,
      recentUsers,
      topReporters
    ] = await Promise.all([
      // Total users
      User.countDocuments(),
      
      // Active users (logged in within last 30 days)
      User.countDocuments({
        lastActive: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
      }),
      
      // Users by role
      User.aggregate([
        { $group: { _id: '$role', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      
      // Users by department
      User.aggregate([
        { $match: { department: { $exists: true, $ne: null } } },
        {
          $lookup: {
            from: 'departments',
            localField: 'department',
            foreignField: '_id',
            as: 'departmentInfo'
          }
        },
        { $unwind: '$departmentInfo' },
        { $group: { _id: '$departmentInfo.name', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      
      // Recent users
      User.find(dateFilter)
        .sort({ createdAt: -1 })
        .limit(10)
        .select('name email role createdAt lastActive'),
      
      // Top reporters
      Issue.aggregate([
        { $match: dateFilter },
        {
          $lookup: {
            from: 'users',
            localField: 'reportedBy',
            foreignField: '_id',
            as: 'reporter'
          }
        },
        { $unwind: '$reporter' },
        { $group: { _id: '$reporter.name', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ])
    ]);

    const analytics = {
      totalUsers,
      activeUsers,
      usersByRole: usersByRole.map(item => ({
        role: item._id,
        count: item.count
      })),
      usersByDepartment: usersByDepartment.map(item => ({
        department: item._id,
        count: item.count
      })),
      recentUsers,
      topReporters: topReporters.map(item => ({
        user: item._id,
        count: item.count
      }))
    };

    const response = createSuccessResponse({
      data: analytics,
      message: 'User analytics retrieved successfully'
    });

    res.json(response);
  } catch (error) {
    console.error('Get user analytics error:', error);
    const errorResponse = createErrorResponse(
      ERROR_CODES.INTERNAL_SERVER_ERROR,
      'Failed to fetch user analytics'
    );
    res.status(errorResponse.statusCode).json(errorResponse);
  }
};
