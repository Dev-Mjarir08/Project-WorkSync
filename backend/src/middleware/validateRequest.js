import { ApiError } from '../utils/ApiError.js';

export const validateRequest = (schema, source = 'body') => {
  return (req, res, next) => {
    try {
      const parsedData = schema.parse(req[source]);
      req[source] = parsedData;
      next();
    } catch (error) {
      const issues = error.issues || error.errors;
      if (issues && Array.isArray(issues) && issues.length > 0) {
        const errorDetails = issues.map((err) => ({
          field: err.path && err.path.length > 0 ? err.path.join('.') : 'body',
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
