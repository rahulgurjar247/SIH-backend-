import mongoose from 'mongoose';

const issueSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Issue title is required'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Issue description is required'],
    trim: true,
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  category: {
    type: String,
    required: [true, 'Issue category is required'],
    enum: ['road', 'water', 'electricity', 'garbage', 'drainage', 'park', 'traffic', 'other']
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['pending', 'acknowledged', 'in-progress', 'resolved', 'rejected'],
    default: 'pending'
  },
  longitude: {
    type: Number,
    required: [true, 'Longitude is required'],
    min: [-180, 'Longitude must be between -180 and 180'],
    max: [180, 'Longitude must be between -180 and 180']
  },
  latitude: {
    type: Number,
    required: [true, 'Latitude is required'],
    min: [-90, 'Latitude must be between -90 and 90'],
    max: [90, 'Latitude must be between -90 and 90']
  },
  address: {
    type: String,
    trim: true
  },
  images: [{
    url: {
      type: String,
      required: true
    },
    publicId: String,
    width: Number,
    height: Number,
    format: String,
    bytes: Number,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  reportedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Reporter is required']
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  department: {
    type: String,
    enum: ['public-works', 'sanitation', 'water-supply', 'electricity', 'traffic', 'other'],
    default: 'other'
  },
  isAnonymous: {
    type: Boolean,
    default: false
  },
  tags: [{
    type: String,
    trim: true
  }],
  attachments: [{
    filename: String,
    url: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  updates: [{
    note: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
    images: [{
      url: { type: String, required: true },
      publicId: String,
      width: Number,
      height: Number,
      format: String,
      bytes: Number,
      uploadedAt: { type: Date, default: Date.now }
    }],
    status: {
      type: String,
      enum: ['pending', 'acknowledged', 'in-progress', 'resolved', 'rejected'],
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    createdAt: { type: Date, default: Date.now }
  }],
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

  // Indexes for efficient querying
  issueSchema.index({ longitude: 1, latitude: 1 });
  issueSchema.index({ status: 1, priority: 1 });
  issueSchema.index({ category: 1 });
  issueSchema.index({ createdAt: -1 });
  issueSchema.index({ reportedBy: 1 });
  issueSchema.index({ assignedTo: 1 });
  issueSchema.index({ department: 1 });

export default mongoose.model('Issue', issueSchema);
