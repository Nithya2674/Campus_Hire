import mongoose from 'mongoose';

const applicationSchema = new mongoose.Schema(
  {
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: [true, 'Job reference is required'],
      index: true,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Student reference is required'],
      index: true,
    },
    resumeUrl: {
      type: String,
      required: [true, 'Resume URL is required'],
      trim: true,
    },
    coverNote: {
      type: String,
      trim: true,
      maxlength: [1000, 'Cover note cannot exceed 1000 characters'],
      default: '',
    },
    status: {
      type: String,
      enum: ['applied', 'shortlisted', 'rejected', 'selected', 'withdrawn'],
      default: 'applied',
      index: true,
    },
    statusHistory: [
      {
        status: {
          type: String,
          enum: ['applied', 'shortlisted', 'rejected', 'selected', 'withdrawn'],
          required: true,
        },
        changedAt: {
          type: Date,
          default: Date.now,
        },
        changedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        note: {
          type: String,
          default: '',
        },
      },
    ],
    appliedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate applications by same student for same job
applicationSchema.index({ jobId: 1, studentId: 1 }, { unique: true });
applicationSchema.index({ studentId: 1, createdAt: -1 });

export const Application = mongoose.model('Application', applicationSchema);
export default Application;
