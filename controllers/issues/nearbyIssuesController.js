import Issue from '../../models/Issue.js';

export const getNearbyIssues = async (req, res) => {
  try {
    const { longitude, latitude, radius = 10 } = req.query; // radius in km

    if (!longitude || !latitude) {
      return res.status(400).json({
        success: false,
        message: 'Longitude and latitude are required'
      });
    }

    const userLng = parseFloat(longitude);
    const userLat = parseFloat(latitude);
    const radiusKm = parseFloat(radius);

    // Calculate bounding box for approximate filtering (more efficient than $near)
    const earthRadius = 6371; // Earth's radius in km
    const latDelta = radiusKm / earthRadius * (180 / Math.PI);
    const lngDelta = radiusKm / earthRadius * (180 / Math.PI) / Math.cos(userLat * Math.PI / 180);

    const minLat = userLat - latDelta;
    const maxLat = userLat + latDelta;
    const minLng = userLng - lngDelta;
    const maxLng = userLng + lngDelta;

    // First filter by bounding box for efficiency
    let issues = await Issue.find({
      latitude: { $gte: minLat, $lte: maxLat },
      longitude: { $gte: minLng, $lte: maxLng }
    })
    .populate('reportedBy', 'name')
    .populate('assignedTo', 'name')
    .sort({ createdAt: -1 })
    .limit(100); // Get more initially for distance filtering

    // Calculate exact distances and filter
    const filteredIssues = issues.filter(issue => {
      // Handle both old and new coordinate structures
      let issueLat, issueLng;
      if (issue.coordinates && issue.coordinates.coordinates) {
        // Old structure
        issueLng = issue.coordinates.coordinates[0];
        issueLat = issue.coordinates.coordinates[1];
      } else {
        // New structure
        issueLat = issue.latitude;
        issueLng = issue.longitude;
      }
      
      const distance = calculateDistance(userLat, userLng, issueLat, issueLng);
      return distance <= radiusKm;
    }).slice(0, 50); // Limit to 50 results

    // Process issues to ensure consistent structure and proper image URLs
    const processedIssues = filteredIssues.map(issue => {
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

    res.json({
      success: true,
      data: processedIssues,
      searchParams: {
        userLat,
        userLng,
        radius: radiusKm
      }
    });
  } catch (error) {
    console.error('Get nearby issues error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching nearby issues'
    });
  }
};

// Helper function to calculate distance between two points using Haversine formula
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;
  return distance;
}
