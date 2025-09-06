import Issue from '../../models/Issue.js';

export const voteIssue = async (req, res) => {
  try {
    const { voteType } = req.body; // 'upvote' or 'downvote'

    if (!['upvote', 'downvote'].includes(voteType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid vote type. Must be "upvote" or "downvote"'
      });
    }

    const issue = await Issue.findById(req.params.id);
    if (!issue) {
      return res.status(404).json({
        success: false,
        message: 'Issue not found'
      });
    }

    // Check if user has already voted
    const userId = req.user._id.toString();
    const hasUpvoted = issue.upvotes.includes(userId);
    const hasDownvoted = issue.downvotes.includes(userId);

    if (voteType === 'upvote') {
      if (hasUpvoted) {
        // Remove upvote
        issue.upvotes = issue.upvotes.filter(id => id.toString() !== userId);
      } else {
        // Add upvote and remove downvote if exists
        if (hasDownvoted) {
          issue.downvotes = issue.downvotes.filter(id => id.toString() !== userId);
        }
        issue.upvotes.push(userId);
      }
    } else {
      if (hasDownvoted) {
        // Remove downvote
        issue.downvotes = issue.downvotes.filter(id => id.toString() !== userId);
      } else {
        // Add downvote and remove upvote if exists
        if (hasUpvoted) {
          issue.upvotes = issue.upvotes.filter(id => id.toString() !== userId);
        }
        issue.downvotes.push(userId);
      }
    }

    await issue.save();

    res.json({
      success: true,
      message: 'Vote recorded successfully',
      data: {
        upvotes: issue.upvotes.length,
        downvotes: issue.downvotes.length,
        voteCount: issue.upvotes.length - issue.downvotes.length
      }
    });
  } catch (error) {
    console.error('Vote issue error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while recording vote'
    });
  }
};
