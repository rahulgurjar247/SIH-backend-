import Notification from '../../models/Notification.js';

export const getNotifications = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      type,
      isRead,
      priority,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filter = { recipient: req.user._id };
    if (type) filter.type = type;
    if (isRead !== undefined) filter.isRead = isRead === 'true';
    if (priority) filter.priority = priority;

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Execute query
    const notifications = await Notification.find(filter)
      .populate('relatedIssue', 'title category status')
      .populate('relatedUser', 'name')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const total = await Notification.countDocuments(filter);

    // Get unread count
    const unreadCount = await Notification.countDocuments({
      recipient: req.user._id,
      isRead: false
    });

    // Calculate pagination info
    const totalPages = Math.ceil(total / parseInt(limit));
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    res.json({
      success: true,
      data: notifications,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalItems: total,
        itemsPerPage: parseInt(limit),
        hasNextPage,
        hasPrevPage
      },
      unreadCount
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching notifications'
    });
  }
};

export const getUnreadCount = async (req, res) => {
  try {
    const unreadCount = await Notification.getUnreadCount(req.user._id);

    res.json({
      success: true,
      data: { unreadCount }
    });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching unread count'
    });
  }
};

export const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    // Check if user owns this notification
    if (notification.recipient.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this notification'
      });
    }

    await notification.markAsRead();

    res.json({
      success: true,
      message: 'Notification marked as read',
      data: notification
    });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while marking notification as read'
    });
  }
};

export const markAllAsRead = async (req, res) => {
  try {
    const result = await Notification.updateMany(
      { recipient: req.user._id, isRead: false },
      { 
        isRead: true, 
        readAt: new Date() 
      }
    );

    res.json({
      success: true,
      message: `${result.modifiedCount} notifications marked as read`,
      data: { modifiedCount: result.modifiedCount }
    });
  } catch (error) {
    console.error('Mark all as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while marking notifications as read'
    });
  }
};

export const deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    // Check if user owns this notification
    if (notification.recipient.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this notification'
      });
    }

    await Notification.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Notification deleted successfully'
    });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting notification'
    });
  }
};

export const clearReadNotifications = async (req, res) => {
  try {
    const result = await Notification.deleteMany({
      recipient: req.user._id,
      isRead: true
    });

    res.json({
      success: true,
      message: `${result.deletedCount} read notifications cleared`,
      data: { deletedCount: result.deletedCount }
    });
  } catch (error) {
    console.error('Clear read notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while clearing read notifications'
    });
  }
};

export const createTestNotification = async (req, res) => {
  try {
    const { title, message, type, priority } = req.body;

    const notification = await Notification.createNotification({
      recipient: req.user._id,
      title: title || 'Test Notification',
      message: message || 'This is a test notification',
      type: type || 'system',
      priority: priority || 'medium'
    });

    res.json({
      success: true,
      message: 'Test notification created successfully',
      data: notification
    });
  } catch (error) {
    console.error('Create test notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating test notification'
    });
  }
};
