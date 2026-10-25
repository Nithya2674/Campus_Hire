import { sendError } from '../utils/responseHandler.js';
import logger from '../utils/logger.js';

export const errorHandler = (err, req, res, next) => {
  logger.error(err.stack || err.message);

  // Mongoose CastError (invalid ObjectId)
  if (err.name === 'CastError') {
    return sendError(res, 400, `Resource not found with id of ${err.value}`);
  }

  // Mongoose duplicate key error (code 11000)
  if (err.code === 11000) {
    const keys = Object.keys(err.keyValue || {});
    if (keys.includes('jobId') && keys.includes('studentId')) {
      return sendError(res, 409, 'You have already submitted an application for this job.');
    }
    const field = keys[0] || 'field';
    return sendError(res, 409, `An account with this ${field} already exists.`);
  }

  // Mongoose Validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((val) => val.message);
    return sendError(res, 400, messages.join(', '));
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return sendError(res, 401, 'Invalid authentication token.');
  }

  if (err.name === 'TokenExpiredError') {
    return sendError(res, 401, 'Session expired. Please log in again.');
  }

  const statusCode = err.statusCode || 500;
  const message = process.env.NODE_ENV === 'production' && statusCode === 500
    ? 'Internal Server Error'
    : err.message || 'Server error';

  return sendError(res, statusCode, message);
};
