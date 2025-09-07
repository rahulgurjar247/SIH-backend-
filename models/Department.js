import mongoose from 'mongoose';

const departmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Department name is required'],
    trim: true,
    unique: true,
    maxlength: [100, 'Department name cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  headOfDepartment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  contactEmail: {
    type: String,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  contactPhone: {
    type: String,
    trim: true,
    match: [/^[\+]?[1-9][\d]{0,15}$/, 'Please enter a valid phone number']
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: {
      type: String,
      default: 'India'
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for department statistics
departmentSchema.virtual('issueCount', {
  ref: 'Issue',
  localField: '_id',
  foreignField: 'department',
  count: true
});

departmentSchema.virtual('resolvedIssueCount', {
  ref: 'Issue',
  localField: '_id',
  foreignField: 'department',
  count: true,
  match: { status: 'resolved' }
});

departmentSchema.virtual('pendingIssueCount', {
  ref: 'Issue',
  localField: '_id',
  foreignField: 'department',
  count: true,
  match: { status: 'pending' }
});

// Index for better performance
departmentSchema.index({ name: 1 });
departmentSchema.index({ isActive: 1 });
departmentSchema.index({ headOfDepartment: 1 });

// Pre-save middleware
departmentSchema.pre('save', function(next) {
  if (this.isModified('name')) {
    this.name = this.name.trim();
  }
  next();
});

// Static method to get department statistics
departmentSchema.statics.getDepartmentStats = async function() {
  const stats = await this.aggregate([
    {
      $lookup: {
        from: 'issues',
        localField: '_id',
        foreignField: 'department',
        as: 'issues'
      }
    },
    {
      $project: {
        name: 1,
        totalIssues: { $size: '$issues' },
        resolvedIssues: {
          $size: {
            $filter: {
              input: '$issues',
              cond: { $eq: ['$$this.status', 'resolved'] }
            }
          }
        },
        pendingIssues: {
          $size: {
            $filter: {
              input: '$issues',
              cond: { $eq: ['$$this.status', 'pending'] }
            }
          }
        },
        inProgressIssues: {
          $size: {
            $filter: {
              input: '$issues',
              cond: { $eq: ['$$this.status', 'in-progress'] }
            }
          }
        },
        resolutionRate: {
          $cond: {
            if: { $gt: [{ $size: '$issues' }, 0] },
            then: {
              $multiply: [
                {
                  $divide: [
                    {
                      $size: {
                        $filter: {
                          input: '$issues',
                          cond: { $eq: ['$$this.status', 'resolved'] }
                        }
                      }
                    },
                    { $size: '$issues' }
                  ]
                },
                100
              ]
            },
            else: 0
          }
        }
      }
    },
    {
      $sort: { totalIssues: -1 }
    }
  ]);

  return stats;
};

const Department = mongoose.model('Department', departmentSchema);

export default Department;
