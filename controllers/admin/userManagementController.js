import User from '../../models/User.js';
import Issue from '../../models/Issue.js';
import Notification from '../../models/Notification.js';

export const getUsers = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      role,
      state,
      district,
      isVerified,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filter = {};
    if (role) filter.role = role;
    if (state) filter['location.state'] = state;
    if (district) filter['location.district'] = district;
    if (isVerified !== undefined) filter.isVerified = isVerified === 'true';

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Execute query
    const users = await User.find(filter)
      .select('-password')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const total = await User.countDocuments(filter);

    // Calculate pagination info
    const totalPages = Math.ceil(total / parseInt(limit));
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    res.json({
      success: true,
      data: users,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalItems: total,
        itemsPerPage: parseInt(limit),
        hasNextPage,
        hasPrevPage
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching users'
    });
  }
};

export const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;

    if (!['citizen', 'staff', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role. Must be citizen, staff, or admin'
      });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prevent admin from changing their own role
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot change your own role'
      });
    }

    user.role = role;
    await user.save();

    // Create notification for user
    await Notification.createNotification({
      recipient: user._id,
      title: 'Role Updated',
      message: `Your role has been updated to ${role}`,
      type: 'system',
      priority: 'medium'
    });

    // Remove password from response
    user.password = undefined;

    res.json({
      success: true,
      message: 'User role updated successfully',
      data: user
    });
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating user role'
    });
  }
};

export const verifyUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: 'User is already verified'
      });
    }

    user.isVerified = true;
    await user.save();

    // Create notification for user
    await Notification.createNotification({
      recipient: user._id,
      title: 'Account Verified',
      message: 'Your account has been verified successfully. You can now access all features.',
      type: 'system',
      priority: 'high'
    });

    // Remove password from response
    user.password = undefined;

    res.json({
      success: true,
      message: 'User verified successfully',
      data: user
    });
  } catch (error) {
    console.error('Verify user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while verifying user'
    });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prevent admin from deleting their own account
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete your own account'
      });
    }

    // Check if user has reported issues
    const issueCount = await Issue.countDocuments({ reportedBy: user._id });
    if (issueCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete user with ${issueCount} reported issues. Please reassign or delete issues first.`
      });
    }

    await User.findByIdAndDelete(user._id);

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting user'
    });
  }
};
