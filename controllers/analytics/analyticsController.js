import Issue from '../../models/Issue.js';
import User from '../../models/User.js';

export const getIssuesOverview = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    // Build date filter
    const dateFilter = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
      if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
    }

    // Basic counts
    const totalIssues = await Issue.countDocuments(dateFilter);
    const issuesByStatus = await Issue.aggregate([
      { $match: dateFilter },
      { $group: { _id: '$status', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    const issuesByCategory = await Issue.aggregate([
      { $match: dateFilter },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    const issuesByPriority = await Issue.aggregate([
      { $match: dateFilter },
      { $group: { _id: '$priority', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Resolution statistics
    const resolvedIssues = await Issue.countDocuments({
      ...dateFilter,
      status: 'resolved'
    });

    const resolutionRate = totalIssues > 0 
      ? ((resolvedIssues / totalIssues) * 100).toFixed(2) 
      : 0;

    // Average resolution time
    const avgResolutionTime = await Issue.aggregate([
      { 
        $match: { 
          ...dateFilter, 
          status: 'resolved', 
          actualResolutionTime: { $exists: true } 
        } 
      },
      { 
        $group: { 
          _id: null, 
          avgTime: { $avg: '$actualResolutionTime' } 
        } 
      }
    ]);

    res.json({
      success: true,
      data: {
        totalIssues,
        resolvedIssues,
        resolutionRate: parseFloat(resolutionRate),
        averageResolutionTime: avgResolutionTime.length > 0 
          ? Math.round(avgResolutionTime[0].avgTime) 
          : 0,
        issuesByStatus,
        issuesByCategory,
        issuesByPriority
      }
    });
  } catch (error) {
    console.error('Issues overview error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching issues overview'
    });
  }
};

export const getLocationStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    // Build date filter
    const dateFilter = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
      if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
    }

    // Issues by state
    const issuesByState = await Issue.aggregate([
      { $match: dateFilter },
      { $group: { _id: '$location.state', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Issues by district
    const issuesByDistrict = await Issue.aggregate([
      { $match: dateFilter },
      { $group: { _id: '$location.district', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Issues by tehsil
    const issuesByTehsil = await Issue.aggregate([
      { $match: dateFilter },
      { $group: { _id: '$location.tehsil', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Issues by village
    const issuesByVillage = await Issue.aggregate([
      { $match: dateFilter },
      { $group: { _id: '$location.village', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 20 }
    ]);

    // Top locations with most issues
    const topLocations = await Issue.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: {
            state: '$location.state',
            district: '$location.district',
            tehsil: '$location.tehsil',
            village: '$location.village'
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    res.json({
      success: true,
      data: {
        issuesByState,
        issuesByDistrict,
        issuesByTehsil,
        issuesByVillage,
        topLocations
      }
    });
  } catch (error) {
    console.error('Location stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching location statistics'
    });
  }
};

export const getTrends = async (req, res) => {
  try {
    const { period = 'monthly', startDate, endDate } = req.query;

    // Build date filter
    const dateFilter = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
      if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
    }

    let groupFormat;
    let dateFormat;

    switch (period) {
      case 'daily':
        groupFormat = { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } };
        dateFormat = '%Y-%m-%d';
        break;
      case 'weekly':
        groupFormat = { $dateToString: { format: '%Y-%U', date: '$createdAt' } };
        dateFormat = '%Y-%U';
        break;
      case 'monthly':
      default:
        groupFormat = { $dateToString: { format: '%Y-%m', date: '$createdAt' } };
        dateFormat = '%Y-%m';
        break;
    }

    // Issues over time
    const issuesOverTime = await Issue.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: groupFormat,
          count: { $sum: 1 },
          resolved: {
            $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] }
          }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Issues by category over time
    const categoryTrends = await Issue.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: {
            date: groupFormat,
            category: '$category'
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.date': 1 } }
    ]);

    // Issues by priority over time
    const priorityTrends = await Issue.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: {
            date: groupFormat,
            priority: '$priority'
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.date': 1 } }
    ]);

    res.json({
      success: true,
      data: {
        period,
        dateFormat,
        issuesOverTime,
        categoryTrends,
        priorityTrends
      }
    });
  } catch (error) {
    console.error('Trends error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching trends'
    });
  }
};

export const getUserStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    // Build date filter
    const dateFilter = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
      if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
    }

    // User registration trends
    const userRegistrationTrends = await User.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Users by role
    const usersByRole = await User.aggregate([
      { $match: dateFilter },
      { $group: { _id: '$role', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Users by state
    const usersByState = await User.aggregate([
      { $match: dateFilter },
      { $group: { _id: '$location.state', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    // Users by district
    const usersByDistrict = await User.aggregate([
      { $match: dateFilter },
      { $group: { _id: '$location.district', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    // Verification statistics
    const verifiedUsers = await User.countDocuments({
      ...dateFilter,
      isVerified: true
    });

    const totalUsers = await User.countDocuments(dateFilter);
    const verificationRate = totalUsers > 0 
      ? ((verifiedUsers / totalUsers) * 100).toFixed(2) 
      : 0;

    // Most active users (by issues reported)
    const mostActiveUsers = await Issue.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: '$reportedBy',
          issueCount: { $sum: 1 }
        }
      },
      { $sort: { issueCount: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      {
        $project: {
          _id: 1,
          name: '$user.name',
          email: '$user.email',
          issueCount: 1
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        totalUsers,
        verifiedUsers,
        verificationRate: parseFloat(verificationRate),
        userRegistrationTrends,
        usersByRole,
        usersByState,
        usersByDistrict,
        mostActiveUsers
      }
    });
  } catch (error) {
    console.error('User stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching user statistics'
    });
  }
};

export const getPerformanceMetrics = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    // Build date filter
    const dateFilter = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
      if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
    }

    // Response time metrics
    const responseTimeMetrics = await Issue.aggregate([
      { $match: { ...dateFilter, status: { $in: ['acknowledged', 'in-progress', 'resolved'] } } },
      {
        $group: {
          _id: null,
          avgResponseTime: { $avg: '$acknowledgedAt' },
          avgResolutionTime: { $avg: '$actualResolutionTime' }
        }
      }
    ]);

    // Department performance
    const departmentPerformance = await Issue.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: '$department',
          totalIssues: { $sum: 1 },
          resolvedIssues: {
            $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] }
          },
          avgResolutionTime: { $avg: '$actualResolutionTime' }
        }
      },
      {
        $addFields: {
          resolutionRate: {
            $cond: [
              { $gt: ['$totalIssues', 0] },
              { $multiply: [{ $divide: ['$resolvedIssues', '$totalIssues'] }, 100] },
              0
            ]
          }
        }
      },
      { $sort: { resolutionRate: -1 } }
    ]);

    // Staff performance
    const staffPerformance = await Issue.aggregate([
      { $match: { ...dateFilter, assignedTo: { $exists: true } } },
      {
        $group: {
          _id: '$assignedTo',
          assignedIssues: { $sum: 1 },
          resolvedIssues: {
            $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] }
          },
          avgResolutionTime: { $avg: '$actualResolutionTime' }
        }
      },
      {
        $addFields: {
          resolutionRate: {
            $cond: [
              { $gt: ['$assignedIssues', 0] },
              { $multiply: [{ $divide: ['$resolvedIssues', '$assignedIssues'] }, 100] },
              0
            ]
          }
        }
      },
      { $sort: { resolutionRate: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      {
        $project: {
          _id: 1,
          name: '$user.name',
          email: '$user.email',
          assignedIssues: 1,
          resolvedIssues: 1,
          resolutionRate: 1,
          avgResolutionTime: 1
        }
      }
    ]);

    // SLA compliance
    const slaCompliance = await Issue.aggregate([
      { $match: { ...dateFilter, status: 'resolved', estimatedResolutionTime: { $exists: true } } },
      {
        $addFields: {
          slaMet: {
            $cond: [
              { $lte: ['$actualResolutionTime', '$estimatedResolutionTime'] },
              1,
              0
            ]
          }
        }
      },
      {
        $group: {
          _id: null,
          totalResolved: { $sum: 1 },
          slaMet: { $sum: '$slaMet' }
        }
      },
      {
        $addFields: {
          slaComplianceRate: {
            $multiply: [{ $divide: ['$slaMet', '$totalResolved'] }, 100]
          }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        responseTimeMetrics: responseTimeMetrics[0] || {},
        departmentPerformance,
        staffPerformance,
        slaCompliance: slaCompliance[0] || {}
      }
    });
  } catch (error) {
    console.error('Performance metrics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching performance metrics'
    });
  }
};
