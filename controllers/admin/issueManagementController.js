import Issue from '../../models/Issue.js';
import User from '../../models/User.js';
import Notification from '../../models/Notification.js';

export const updateIssueStatus = async (req, res) => {
  try {
    const { status, assignedTo, resolutionNotes, estimatedResolutionTime } = req.body;

    const issue = await Issue.findById(req.params.id);
    if (!issue) {
      return res.status(404).json({
        success: false,
        message: 'Issue not found'
      });
    }

    // Update issue fields
    if (status) issue.status = status;
    if (assignedTo) issue.assignedTo = assignedTo;
    if (resolutionNotes) issue.resolutionNotes = resolutionNotes;
    if (estimatedResolutionTime) issue.estimatedResolutionTime = estimatedResolutionTime;

    // Set resolution time if status is resolved
    if (status === 'resolved') {
      issue.actualResolutionTime = Date.now();
    }

    await issue.save();

    // Create notification for issue reporter
    if (status && status !== issue.status) {
      await Notification.createNotification({
        recipient: issue.reportedBy,
        title: 'Issue Status Updated',
        message: `Your issue "${issue.title}" status has been updated to ${status}`,
        type: 'status_change',
        relatedIssue: issue._id,
        priority: 'medium'
      });
    }

    // Create notification for assigned staff (if assigned)
    if (assignedTo && assignedTo !== issue.assignedTo) {
      await Notification.createNotification({
        recipient: assignedTo,
        title: 'New Issue Assigned',
        message: `You have been assigned issue: "${issue.title}"`,
        type: 'assignment',
        relatedIssue: issue._id,
        priority: 'high',
        actionRequired: true
      });
    }

    // Populate related fields
    await issue.populate('reportedBy', 'name email phone');
    await issue.populate('assignedTo', 'name email phone');

    res.json({
      success: true,
      message: 'Issue status updated successfully',
      data: issue
    });
  } catch (error) {
    console.error('Update issue status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating issue status'
    });
  }
};

export const assignIssue = async (req, res) => {
  try {
    const { assignedTo, estimatedResolutionTime } = req.body;

    const issue = await Issue.findById(req.params.id);
    if (!issue) {
      return res.status(404).json({
        success: false,
        message: 'Issue not found'
      });
    }

    // Check if assigned user exists and is staff
    if (assignedTo) {
      const assignedUser = await User.findById(assignedTo);
      if (!assignedUser) {
        return res.status(404).json({
          success: false,
          message: 'Assigned user not found'
        });
      }
      if (!['admin', 'staff'].includes(assignedUser.role)) {
        return res.status(400).json({
          success: false,
          message: 'Can only assign issues to admin or staff members'
        });
      }
    }

    // Update assignment
    issue.assignedTo = assignedTo;
    if (estimatedResolutionTime) issue.estimatedResolutionTime = estimatedResolutionTime;

    await issue.save();

    // Create notification for assigned staff
    if (assignedTo) {
      await Notification.createNotification({
        recipient: assignedTo,
        title: 'New Issue Assigned',
        message: `You have been assigned issue: "${issue.title}"`,
        type: 'assignment',
        relatedIssue: issue._id,
        priority: 'high',
        actionRequired: true
      });
    }

    // Populate related fields
    await issue.populate('reportedBy', 'name email phone');
    await issue.populate('assignedTo', 'name email phone');

    res.json({
      success: true,
      message: 'Issue assigned successfully',
      data: issue
    });
  } catch (error) {
    console.error('Assign issue error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while assigning issue'
    });
  }
};
