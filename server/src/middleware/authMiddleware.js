import { extractToken, verifyToken } from '../services/tokenService.js';
import User from '../models/User.js';
import { sendError } from '../utils/responseHandler.js';

export const authenticate = async (req, res, next) => {
  try {
    const token = extractToken(req);

    if (!token) {
      return sendError(res, 401, 'Authentication required. Please log in.');
    }

    let decoded;
    try {
      decoded = verifyToken(token);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return sendError(res, 401, 'Session expired. Please log in again.');
      }
      return sendError(res, 401, 'Invalid authentication token.');
    }

    const user = await User.findById(decoded.id);

    if (!user) {
      return sendError(res, 401, 'Account no longer exists.');
    }

    if (!user.isActive) {
      return sendError(res, 403, 'Your account has been deactivated. Please contact an administrator.');
    }

    req.user = user;
    next();
  } catch (error) {
    return sendError(res, 500, 'Authentication error: ' + error.message);
  }
};

export const optionalAuth = async (req, res, next) => {
  try {
    const token = extractToken(req);
    if (!token) {
      return next();
    }
    try {
      const decoded = verifyToken(token);
      const user = await User.findById(decoded.id);
      if (user && user.isActive) {
        req.user = user;
      }
    } catch {
      // Ignore token errors for optional auth
    }
    next();
  } catch {
    next();
  }
};

