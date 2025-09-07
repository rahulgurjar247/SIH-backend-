import mongoose from 'mongoose';

const locationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['state', 'district', 'tehsil', 'city', 'village'],
    required: true
  },
  parentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Location',
    default: null
  },
  // Geographic boundaries
  bounds: {
    north: {
      type: Number,
      required: true
    },
    south: {
      type: Number,
      required: true
    },
    east: {
      type: Number,
      required: true
    },
    west: {
      type: Number,
      required: true
    }
  },
  // Center coordinates for map centering
  center: {
    latitude: {
      type: Number,
      required: true
    },
    longitude: {
      type: Number,
      required: true
    }
  },
  // Default zoom level for this location
  zoomLevel: {
    type: Number,
    default: 10
  },
  // Additional metadata
  stateCode: {
    type: String,
    trim: true
  },
  districtCode: {
    type: String,
    trim: true
  },
  population: {
    type: Number
  },
  area: {
    type: Number // in square kilometers
  },
  // Administrative details
  isActive: {
    type: Boolean,
    default: true
  },
  // Hierarchy level (0 = country, 1 = state, 2 = district, 3 = tehsil, etc.)
  level: {
    type: Number,
    required: true,
    min: 0,
    max: 5
  }
}, {
  timestamps: true
});

// Indexes for better performance
locationSchema.index({ type: 1, parentId: 1 });
locationSchema.index({ name: 1, type: 1 });
locationSchema.index({ 'center.latitude': 1, 'center.longitude': 1 });
locationSchema.index({ level: 1 });

// Virtual for getting formatted bounds
locationSchema.virtual('formattedBounds').get(function() {
  return [
    [this.bounds.south, this.bounds.west],
    [this.bounds.north, this.bounds.east]
  ];
});

// Virtual for getting center as array
locationSchema.virtual('centerArray').get(function() {
  return [this.center.latitude, this.center.longitude];
});

// Method to check if a point is within bounds
locationSchema.methods.containsPoint = function(latitude, longitude) {
  return latitude >= this.bounds.south && 
         latitude <= this.bounds.north && 
         longitude >= this.bounds.west && 
         longitude <= this.bounds.east;
};

// Method to get children locations
locationSchema.methods.getChildren = async function() {
  return await this.constructor.find({ parentId: this._id, isActive: true });
};

// Method to get parent location
locationSchema.methods.getParent = async function() {
  if (!this.parentId) return null;
  return await this.constructor.findById(this.parentId);
};

// Static method to get locations by type
locationSchema.statics.getByType = function(type) {
  return this.find({ type, isActive: true }).sort({ name: 1 });
};

// Static method to get locations by parent
locationSchema.statics.getByParent = function(parentId) {
  return this.find({ parentId, isActive: true }).sort({ name: 1 });
};

// Static method to find location containing a point
locationSchema.statics.findContainingPoint = function(latitude, longitude, type = null) {
  const query = {
    'bounds.south': { $lte: latitude },
    'bounds.north': { $gte: latitude },
    'bounds.west': { $lte: longitude },
    'bounds.east': { $gte: longitude },
    isActive: true
  };
  
  if (type) {
    query.type = type;
  }
  
  return this.find(query).sort({ level: 1 });
};

// Ensure virtual fields are serialized
locationSchema.set('toJSON', { virtuals: true });
locationSchema.set('toObject', { virtuals: true });

const Location = mongoose.model('Location', locationSchema);

export default Location;
