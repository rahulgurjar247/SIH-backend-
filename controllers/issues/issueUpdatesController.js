import Issue from '../../models/Issue.js';

export const addIssueUpdate = async (req, res) => {
  try {
    const { id } = req.params;
    const { note, status } = req.body;
    const uploader = req.user;

    const issue = await Issue.findById(id);
    if (!issue) {
      return res.status(404).json({ success: false, message: 'Issue not found' });
    }

    // Only admin/department/staff allowed (and optionally reporter)
    if (!uploader || !['admin', 'department', 'staff'].includes(uploader.role)) {
      return res.status(403).json({ success: false, message: 'Not authorized to add updates' });
    }

    const images = (req.cloudinaryResults || []).map(r => ({
      url: r.url,
      publicId: r.public_id,
      width: r.width,
      height: r.height,
      format: r.format,
      bytes: r.bytes,
      uploadedAt: new Date(),
    }));

    const update = {
      note: note || '',
      status: status || undefined,
      images,
      createdBy: uploader._id,
      createdAt: new Date(),
    };

    // Push update and optionally set current status
    issue.updates.push(update);
    if (status) issue.status = status;
    issue.lastUpdated = new Date();

    await issue.save();
    await issue.populate('reportedBy', 'name email phone');
    await issue.populate('assignedTo', 'name email phone');
    await issue.populate('updates.createdBy', 'name email');

    res.json({ success: true, message: 'Update added', data: issue });
  } catch (error) {
    console.error('Add issue update error:', error);
    res.status(500).json({ success: false, message: 'Server error while adding update' });
  }
};

export const getIssueUpdates = async (req, res) => {
  try {
    const { id } = req.params;
    const issue = await Issue.findById(id).populate('updates.createdBy', 'name email');
    if (!issue) {
      return res.status(404).json({ success: false, message: 'Issue not found' });
    }
    res.json({ success: true, data: issue.updates || [] });
  } catch (error) {
    console.error('Get issue updates error:', error);
    res.status(500).json({ success: false, message: 'Server error while fetching updates' });
  }
};


