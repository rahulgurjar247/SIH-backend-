import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Recipient is required']
  },
  title: {
    type: String,
    required: [true, 'Notification title is required'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  message: {
    type: String,
    required: [true, 'Notification message is required'],
    trim: true,
    maxlength: [500, 'Message cannot be more than 500 characters']
  },
  type: {
    type: String,
    enum: ['issue_update', 'status_change', 'assignment', 'reminder', 'announcement', 'system'],
    required: [true, 'Notification type is required']
  },
  relatedIssue: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Issue',
    default: null
  },
  relatedUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  isRead: {
    type: Boolean,
    default: false
  },
  isSent: {
    type: Boolean,
    default: false
  },
  sentAt: {
    type: Date,
    default: null
  },
  readAt: {
    type: Date,
    default: null
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  actionRequired: {
    type: Boolean,
    default: false
  },
  actionUrl: {
    type: String,
    default: null
  },
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

// Indexes for performance
notificationSchema.index({ recipient: 1, isRead: 1 });
notificationSchema.index({ recipient: 1, createdAt: -1 });
notificationSchema.index({ type: 1 });
notificationSchema.index({ isSent: 1, sentAt: 1 });
notificationSchema.index({ priority: 1 });
notificationSchema.index({ actionRequired: 1 });

// Method to mark notification as read
notificationSchema.methods.markAsRead = function() {
  this.isRead = true;
  this.readAt = Date.now();
  return this.save();
};

// Method to mark notification as sent
notificationSchema.methods.markAsSent = function() {
  this.isSent = true;
  this.sentAt = Date.now();
  return this.save();
};

// Static method to create notification
notificationSchema.statics.createNotification = async function(data) {
  try {
    const notification = new this(data);
    await notification.save();
    return notification;
  } catch (error) {
    throw error;
  }
};

// Static method to get unread count for a user
notificationSchema.statics.getUnreadCount = async function(userId) {
  try {
    return await this.countDocuments({
      recipient: userId,
      isRead: false
    });
  } catch (error) {
    throw error;
  }
};

// Static method to send bulk notifications
notificationSchema.statics.sendBulkNotifications = async function(recipients, notificationData) {
  try {
    const notifications = recipients.map(recipientId => ({
      ...notificationData,
      recipient: recipientId
    }));
    
    return await this.insertMany(notifications);
  } catch (error) {
    throw error;
  }
};

// Virtual for time since creation
notificationSchema.virtual('timeAgo').get(function() {
  const now = Date.now();
  const created = this.createdAt.getTime();
  const diffInSeconds = Math.floor((now - created) / 1000);
  
  if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`;
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  return `${Math.floor(diffInSeconds / 86400)} days ago`;
});

// Ensure virtual fields are serialized
notificationSchema.set('toJSON', { virtuals: true });
notificationSchema.set('toObject', { virtuals: true });

export default mongoose.model('Notification', notificationSchema);
