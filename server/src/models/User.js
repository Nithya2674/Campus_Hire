import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
      index: true,
    },
    passwordHash: {
      type: String,
      required: [true, 'Password is required'],
      select: false,
    },
    role: {
      type: String,
      enum: {
        values: ['student', 'recruiter', 'admin'],
        message: '{VALUE} is not a valid role',
      },
      default: 'student',
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    profile: {
      // Student specific fields
      college: { type: String, trim: true, default: '' },
      degree: { type: String, trim: true, default: '' },
      branch: { type: String, trim: true, default: '' },
      graduationYear: { type: Number, default: null },
      cgpa: { type: Number, min: 0, max: 10, default: null },
      skills: [{ type: String, trim: true }],
      resumeUrl: { type: String, trim: true, default: '' },
      phone: { type: String, trim: true, default: '' },
      bio: { type: String, trim: true, default: '' },

      // Recruiter specific fields
      companyName: { type: String, trim: true, default: '' },
      designation: { type: String, trim: true, default: '' },
      companyWebsite: { type: String, trim: true, default: '' },
      companyLocation: { type: String, trim: true, default: '' },
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (doc, ret) {
        delete ret.passwordHash;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Method to verify password
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.passwordHash);
};

// Static helper to hash passwords
userSchema.statics.hashPassword = async function (plainPassword) {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(plainPassword, salt);
};

export const User = mongoose.model('User', userSchema);
export default User;
