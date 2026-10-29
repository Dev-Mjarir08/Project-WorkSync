import { ApiError } from '../utils/ApiError.js';

export const authorizePlatformRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ApiError(401, 'User must be authenticated.'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new ApiError(
          403,
          `Forbidden: Role '${req.user.role}' is not authorized to access this resource.`
        )
      );
    }

    next();
  };
};

export default authorizePlatformRole;
