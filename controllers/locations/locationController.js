import Location from '../../models/Location.js';
import { 
  createSuccessResponse, 
  createErrorResponse 
} from '../../utils/responseUtils.js';
import { ERROR_CODES } from '../../utils/errorTypes.js';

// @desc    Get all locations by type
// @route   GET /api/v1/locations/type/:type
// @access  Public
export const getLocationsByType = async (req, res) => {
  try {
    const { type } = req.params;
    const { parentId } = req.query;

    let query = { type, isActive: true };
    
    if (parentId) {
      query.parentId = parentId;
    }

    const locations = await Location.find(query)
      .sort({ name: 1 })
      .select('name type parentId bounds center zoomLevel level stateCode districtCode');

    const response = createSuccessResponse({
      data: locations,
      message: `Locations of type ${type} retrieved successfully`
    });

    res.json(response);
  } catch (error) {
    console.error('Get locations by type error:', error);
    const errorResponse = createErrorResponse(
      ERROR_CODES.INTERNAL_SERVER_ERROR,
      'Failed to fetch locations'
    );
    res.status(errorResponse.statusCode).json(errorResponse);
  }
};

// @desc    Get location hierarchy (states -> districts -> tehsils)
// @route   GET /api/v1/locations/hierarchy
// @access  Public
export const getLocationHierarchy = async (req, res) => {
  try {
    const { stateId, districtId } = req.query;

    let result = {};

    if (!stateId && !districtId) {
      // Get all states
      const states = await Location.find({ type: 'state', isActive: true })
        .sort({ name: 1 })
        .select('name bounds center zoomLevel level stateCode');

      result = {
        states: states.map(state => ({
          _id: state._id,
          name: state.name,
          bounds: state.formattedBounds,
          center: state.centerArray,
          zoomLevel: state.zoomLevel,
          level: state.level,
          stateCode: state.stateCode
        }))
      };
    } else if (stateId && !districtId) {
      // Get districts for a specific state
      const districts = await Location.find({ 
        type: 'district', 
        parentId: stateId, 
        isActive: true 
      })
      .sort({ name: 1 })
      .select('name bounds center zoomLevel level districtCode');

      result = {
        districts: districts.map(district => ({
          _id: district._id,
          name: district.name,
          bounds: district.formattedBounds,
          center: district.centerArray,
          zoomLevel: district.zoomLevel,
          level: district.level,
          districtCode: district.districtCode
        }))
      };
    } else if (districtId) {
      // Get tehsils for a specific district
      const tehsils = await Location.find({ 
        type: 'tehsil', 
        parentId: districtId, 
        isActive: true 
      })
      .sort({ name: 1 })
      .select('name bounds center zoomLevel level');

      result = {
        tehsils: tehsils.map(tehsil => ({
          _id: tehsil._id,
          name: tehsil.name,
          bounds: tehsil.formattedBounds,
          center: tehsil.centerArray,
          zoomLevel: tehsil.zoomLevel,
          level: tehsil.level
        }))
      };
    }

    const response = createSuccessResponse({
      data: result,
      message: 'Location hierarchy retrieved successfully'
    });

    res.json(response);
  } catch (error) {
    console.error('Get location hierarchy error:', error);
    const errorResponse = createErrorResponse(
      ERROR_CODES.INTERNAL_SERVER_ERROR,
      'Failed to fetch location hierarchy'
    );
    res.status(errorResponse.statusCode).json(errorResponse);
  }
};

// @desc    Find location containing a specific point
// @route   GET /api/v1/locations/containing
// @access  Public
export const getLocationContainingPoint = async (req, res) => {
  try {
    const { latitude, longitude, type } = req.query;

    if (!latitude || !longitude) {
      const errorResponse = createErrorResponse(
        ERROR_CODES.BAD_REQUEST,
        'Latitude and longitude are required'
      );
      return res.status(errorResponse.statusCode).json(errorResponse);
    }

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    if (isNaN(lat) || isNaN(lng)) {
      const errorResponse = createErrorResponse(
        ERROR_CODES.BAD_REQUEST,
        'Invalid latitude or longitude values'
      );
      return res.status(errorResponse.statusCode).json(errorResponse);
    }

    const query = {
      'bounds.south': { $lte: lat },
      'bounds.north': { $gte: lat },
      'bounds.west': { $lte: lng },
      'bounds.east': { $gte: lng },
      isActive: true
    };

    if (type) {
      query.type = type;
    }

    const locations = await Location.find(query)
      .sort({ level: 1 })
      .select('name type bounds center zoomLevel level parentId')
      .populate('parentId', 'name type');

    const response = createSuccessResponse({
      data: locations,
      message: 'Locations containing the point retrieved successfully'
    });

    res.json(response);
  } catch (error) {
    console.error('Get location containing point error:', error);
    const errorResponse = createErrorResponse(
      ERROR_CODES.INTERNAL_SERVER_ERROR,
      'Failed to find locations containing the point'
    );
    res.status(errorResponse.statusCode).json(errorResponse);
  }
};

// @desc    Get location by ID
// @route   GET /api/v1/locations/:id
// @access  Public
export const getLocationById = async (req, res) => {
  try {
    const { id } = req.params;

    const location = await Location.findById(id)
      .populate('parentId', 'name type')
      .select('name type parentId bounds center zoomLevel level stateCode districtCode population area');

    if (!location) {
      const errorResponse = createErrorResponse(
        ERROR_CODES.NOT_FOUND,
        'Location not found'
      );
      return res.status(errorResponse.statusCode).json(errorResponse);
    }

    const response = createSuccessResponse({
      data: location,
      message: 'Location retrieved successfully'
    });

    res.json(response);
  } catch (error) {
    console.error('Get location by ID error:', error);
    const errorResponse = createErrorResponse(
      ERROR_CODES.INTERNAL_SERVER_ERROR,
      'Failed to fetch location'
    );
    res.status(errorResponse.statusCode).json(errorResponse);
  }
};

// @desc    Get all locations (for admin)
// @route   GET /api/v1/locations
// @access  Private (Admin only)
export const getAllLocations = async (req, res) => {
  try {
    const { type, parentId, page = 1, limit = 50 } = req.query;

    let query = { isActive: true };

    if (type) {
      query.type = type;
    }

    if (parentId) {
      query.parentId = parentId;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [locations, total] = await Promise.all([
      Location.find(query)
        .sort({ name: 1 })
        .skip(skip)
        .limit(parseInt(limit))
        .select('name type parentId bounds center zoomLevel level stateCode districtCode population area'),
      Location.countDocuments(query)
    ]);

    const response = createSuccessResponse({
      data: locations,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        itemsPerPage: parseInt(limit),
        hasNextPage: skip + parseInt(limit) < total,
        hasPrevPage: parseInt(page) > 1
      },
      message: 'Locations retrieved successfully'
    });

    res.json(response);
  } catch (error) {
    console.error('Get all locations error:', error);
    const errorResponse = createErrorResponse(
      ERROR_CODES.INTERNAL_SERVER_ERROR,
      'Failed to fetch locations'
    );
    res.status(errorResponse.statusCode).json(errorResponse);
  }
};
