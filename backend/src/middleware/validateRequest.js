import { ApiError } from '../utils/ApiError.js';

export const validateRequest = (schema, source = 'body') => {
  return (req, res, next) => {
    try {
      const parsedData = schema.parse(req[source]);

      // In Express 5, req.query and req.params are getter-only properties on req
      if (source === 'body') {
        req.body = parsedData;
      } else if (req[source] && typeof req[source] === 'object') {
        try {
          Object.assign(req[source], parsedData);
        } catch {
          // If properties are non-configurable in Express 5
        }
      }

      req.validated = req.validated || {};
      req.validated[source] = parsedData;

      next();
    } catch (error) {
      const issues = error.issues || error.errors;
      if (issues && Array.isArray(issues) && issues.length > 0) {
        const errorDetails = issues.map((err) => ({
          field: err.path && err.path.length > 0 ? err.path.join('.') : source,
          message: err.message
        }));
        return next(
          new ApiError(
            400,
            errorDetails[0]?.message || 'Validation failed',
            errorDetails
          )
        );
      }
      return next(new ApiError(400, error.message || 'Invalid request data'));
    }
  };
};

export default validateRequest;
