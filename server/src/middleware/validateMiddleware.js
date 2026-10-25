import { sendError } from '../utils/responseHandler.js';

export const validateBody = (schema) => (req, res, next) => {
  try {
    req.body = schema.parse(req.body);
    next();
  } catch (err) {
    if (err.errors) {
      const formatted = err.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      }));
      return sendError(res, 400, 'Validation failed', formatted);
    }
    return sendError(res, 400, err.message || 'Invalid request data');
  }
};

export const validateQuery = (schema) => (req, res, next) => {
  try {
    req.query = schema.parse(req.query);
    next();
  } catch (err) {
    if (err.errors) {
      const formatted = err.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      }));
      return sendError(res, 400, 'Query validation failed', formatted);
    }
    return sendError(res, 400, err.message || 'Invalid query parameters');
  }
};
