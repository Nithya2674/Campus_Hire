import User from '../models/User.js';
import { generateToken, setAuthCookie, clearAuthCookie } from '../services/tokenService.js';
import { sendSuccess, sendError } from '../utils/responseHandler.js';

export const register = async (req, res, next) => {
  try {
    const { name, email, password, role, companyName } = req.body;

    // Disallow public registration as admin
    if (role === 'admin') {
      return sendError(res, 403, 'Administrator accounts cannot be created via public registration.');
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return sendError(res, 409, 'An account with this email address already exists.');
    }

    const passwordHash = await User.hashPassword(password);

    const initialProfile = {};
    if (role === 'recruiter' && companyName) {
      initialProfile.companyName = companyName;
    }

    const user = await User.create({
      name,
      email,
      passwordHash,
      role,
      profile: initialProfile,
    });

    const token = generateToken(user);
    setAuthCookie(res, token);

    return sendSuccess(
      res,
      201,
      'Registration successful',
      {
        user: user.toJSON(),
        token,
      }
    );
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+passwordHash');
    if (!user) {
      return sendError(res, 401, 'Invalid email or password.');
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return sendError(res, 401, 'Invalid email or password.');
    }

    if (!user.isActive) {
      return sendError(res, 403, 'Your account has been deactivated. Please contact an administrator.');
    }

    const token = generateToken(user);
    setAuthCookie(res, token);

    return sendSuccess(res, 200, 'Login successful', {
      user: user.toJSON(),
      token,
    });
  } catch (error) {
    next(error);
  }
};

export const logout = (req, res) => {
  clearAuthCookie(res);
  return sendSuccess(res, 200, 'Logged out successfully');
};

export const getMe = async (req, res) => {
  return sendSuccess(res, 200, 'Authenticated user details', {
    user: req.user.toJSON(),
  });
};
