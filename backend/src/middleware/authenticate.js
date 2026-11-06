import { verifyToken } from '../utils/generateToken.js';
import { ApiError } from '../utils/ApiError.js';
import { User } from '../models/User.js';

export const authenticate = async (req, res, next) => {
  try {
    let token = null;

    if (req.headers.authorization) {
      const parts = req.headers.authorization.trim().split(/\s+/);
      if (parts.length === 2 && /^Bearer$/i.test(parts[0])) {
        token = parts[1];
      } else if (parts.length === 1) {
        token = parts[0];
      }
    } else if (req.headers['x-access-token']) {
      token = req.headers['x-access-token'];
    } else if (req.cookies?.token) {
      token = req.cookies.token;
    } else if (req.headers.cookie) {
      const match = req.headers.cookie.match(/(?:^|;\s*)token=([^;]*)/);
      if (match) {
        token = decodeURIComponent(match[1]);
      }
    }

    if (!token) {
      throw new ApiError(401, 'Authentication token missing. Please log in to proceed.');
    }

    token = token.replace(/['"]+/g, '').trim();

    let decoded;
    try {
      decoded = verifyToken(token);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        throw new ApiError(401, 'Authentication token has expired. Please log in again.');
      }
      throw new ApiError(401, 'Invalid authentication token. Please log in again.');
    }

    const userId = decoded.id || decoded._id || decoded.sub;
    if (!userId) {
      throw new ApiError(401, 'Malformed token payload: user identification missing.');
    }

    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(401, 'User account associated with this token no longer exists.');
    }

    if (user.status && user.status !== 'active') {
      throw new ApiError(403, `Your account is ${user.status}. Please contact platform administrators.`);
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

export default authenticate;
