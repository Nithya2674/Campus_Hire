import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Job title is required'],
      trim: true,
      maxlength: [150, 'Title cannot exceed 150 characters'],
    },
    company: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
      maxlength: [120, 'Company name cannot exceed 120 characters'],
    },
    description: {
      type: String,
      required: [true, 'Job description is required'],
    },
    location: {
      type: String,
      required: [true, 'Job location is required'],
      trim: true,
    },
    jobType: {
      type: String,
      required: [true, 'Job type is required'],
      enum: ['Full-time', 'Internship', 'Part-time', 'Contract'],
      default: 'Full-time',
    },
    salaryRange: {
      type: String,
      trim: true,
      default: 'Not specified',
    },
    requiredSkills: {
      type: [String],
      default: [],
    },
    eligibility: {
      minCgpa: {
        type: Number,
        min: 0,
        max: 10,
        default: 0,
      },
      eligibleBranches: {
        type: [String],
        default: [], // empty means all branches eligible
      },
      allowedGraduationYears: {
        type: [Number],
        default: [], // empty means any graduation year
      },
    },
    recruiterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Recruiter ID is required'],
      index: true,
    },
    status: {
      type: String,
      enum: ['draft', 'published', 'closed'],
      default: 'published',
      index: true,
    },
    applicationDeadline: {
      type: Date,
      required: [true, 'Application deadline is required'],
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Search index for text searches
jobSchema.index({ title: 'text', company: 'text', description: 'text', location: 'text' });
jobSchema.index({ status: 1, applicationDeadline: 1, createdAt: -1 });

export const Job = mongoose.model('Job', jobSchema);
export default Job;
