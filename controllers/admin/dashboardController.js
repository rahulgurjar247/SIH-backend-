import Issue from '../../models/Issue.js';
import User from '../../models/User.js';

export const getDashboard = async (req, res) => {
  try {
    // Basic counts
    const totalIssues = await Issue.countDocuments();
    const totalUsers = await User.countDocuments();
    const pendingIssues = await Issue.countDocuments({ status: 'pending' });
    const resolvedIssues = await Issue.countDocuments({ status: 'resolved' });

    // Issues by status
    const issuesByStatus = await Issue.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // Issues by category
    const issuesByCategory = await Issue.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);

    // Issues by priority
    const issuesByPriority = await Issue.aggregate([
      { $group: { _id: '$priority', count: { $sum: 1 } } }
    ]);

    // Issues by state
    const issuesByState = await Issue.aggregate([
      { $group: { _id: '$location.state', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    // Issues by district
    const issuesByDistrict = await Issue.aggregate([
      { $group: { _id: '$location.district', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    // Recent issues
    const recentIssues = await Issue.find()
      .populate('reportedBy', 'name')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      success: true,
      data: {
        overview: {
          totalIssues,
          totalUsers,
          pendingIssues,
          resolvedIssues,
          resolutionRate: totalIssues > 0 
            ? ((resolvedIssues / totalIssues) * 100).toFixed(2) 
            : 0
        },
        issuesByStatus,
        issuesByCategory,
        issuesByPriority,
        issuesByState,
        issuesByDistrict,
        recentIssues
      }
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching dashboard data'
    });
  }
};
