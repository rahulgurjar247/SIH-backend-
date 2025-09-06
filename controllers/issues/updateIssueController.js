import Issue from '../../models/Issue.js';

export const updateIssue = async (req, res) => {
  try {
    const { title, description, category, priority, location, tags } = req.body;

    const issue = await Issue.findById(req.params.id);
    if (!issue) {
      return res.status(404).json({
        success: false,
        message: 'Issue not found'
      });
    }

    // Check if user can update this issue
    if (issue.reportedBy.toString() !== req.user._id.toString() && 
        !['admin', 'staff'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this issue'
      });
    }

    // Update fields
    if (title) issue.title = title;
    if (description) issue.description = description;
    if (category) issue.category = category;
    if (priority) issue.priority = priority;
    if (location) issue.location = location;
    if (tags) issue.tags = tags.split(',').map(tag => tag.trim());

    await issue.save();

    // Populate related fields
    await issue.populate('reportedBy', 'name email phone');
    await issue.populate('assignedTo', 'name email phone');

    res.json({
      success: true,
      message: 'Issue updated successfully',
      data: issue
    });
  } catch (error) {
    console.error('Update issue error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating issue'
    });
  }
};
