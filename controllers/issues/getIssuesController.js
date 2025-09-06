import Issue from '../../models/Issue.js';

export const getIssues = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      category,
      priority,
      state,
      district,
      tehsil,
      village,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    console.log(req.query)

    // Build filter object
    const filter = {};
    if (status) filter.status = status;
    if (category) filter.category = category;
    if (priority) filter.priority = priority;

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Execute query
    const issues = await Issue.find(filter)
      .populate('reportedBy', 'name')
      .populate('assignedTo', 'name')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));
    
    console.log('🔍 Raw issues from DB:', issues.length);
    
    // Process issues to ensure consistent structure and proper image URLs
    const processedIssues = issues.map(issue => {
      const issueObj = issue.toObject();
      
      // Handle mixed data structure - convert old coordinates to longitude/latitude
      if (issueObj.coordinates && issueObj.coordinates.coordinates) {
        issueObj.longitude = issueObj.coordinates.coordinates[0];
        issueObj.latitude = issueObj.coordinates.coordinates[1];
        delete issueObj.coordinates; // Remove old structure
      }
      
      // Cloudinary URLs are already complete HTTPS URLs, no processing needed
      // Keep image data as-is since Cloudinary URLs are already properly formatted
      
      return issueObj;
    });
    
    console.log('✅ Processed issues:', processedIssues.length);
    
    // Get total count for pagination
    const total = await Issue.countDocuments(filter);

    // Calculate pagination info
    const totalPages = Math.ceil(total / parseInt(limit));
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    res.json({
      success: true,
      data: processedIssues,
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
    console.error('Get issues error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching issues'
    });
  }
};

export const getIssue = async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id)
      .populate('reportedBy', 'name email phone')
      .populate('assignedTo', 'name email phone');

    if (!issue) {
      return res.status(404).json({
        success: false,
        message: 'Issue not found'
      });
    }

    // Process issue to ensure consistent structure and proper image URLs
    const issueObj = issue.toObject();
    
    // Handle mixed data structure - convert old coordinates to longitude/latitude
    if (issueObj.coordinates && issueObj.coordinates.coordinates) {
      issueObj.longitude = issueObj.coordinates.coordinates[0];
      issueObj.latitude = issueObj.coordinates.coordinates[1];
      delete issueObj.coordinates; // Remove old structure
    }
    
    // Cloudinary URLs are already complete HTTPS URLs, no processing needed
    // Keep image data as-is since Cloudinary URLs are already properly formatted

    res.json({
      success: true,
      data: issueObj
    });
  } catch (error) {
    console.error('Get issue error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching issue'
    });
  }
};
