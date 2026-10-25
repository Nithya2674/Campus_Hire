import User from '../models/User.js';
import { sendSuccess, sendError } from '../utils/responseHandler.js';

export const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return sendError(res, 404, 'User not found');
    }
    return sendSuccess(res, 200, 'User profile fetched successfully', { user });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const { name, profile } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return sendError(res, 404, 'User not found');
    }

    if (name) {
      user.name = name.trim();
    }

    if (profile) {
      // Merge profile fields cleanly
      user.profile = {
        ...user.profile.toObject(),
        ...profile,
      };
    }

    await user.save();

    return sendSuccess(res, 200, 'Profile updated successfully', {
      user: user.toJSON(),
    });
  } catch (error) {
    next(error);
  }
};
