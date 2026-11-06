import jwt from 'jsonwebtoken';
import { ENV } from '../config/env.js';

/**
 * Generate a standard JWT token from a payload
 * @param {Object} payload - User data to embed in token (id, email, role, etc.)
 * @param {string|number} [expiresIn] - Optional override for token duration
 * @returns {string} - Signed JWT token
 */
export const generateToken = (payload, expiresIn = ENV.JWT_EXPIRES_IN) => {
  return jwt.sign(payload, ENV.JWT_SECRET, {
    expiresIn
  });
};

/**
 * Generate standardized token structure for production auth responses
 * @param {Object} user - User document or user object
 * @returns {Object} - Formatted tokens with metadata
 */
export const generateAuthTokens = (user) => {
  const userId = user._id ? user._id.toString() : user.id;
  const payload = {
    id: userId,
    email: user.email,
    role: user.role,
    name: user.name
  };

  const accessToken = generateToken(payload, ENV.JWT_EXPIRES_IN || '7d');

  return {
    token: accessToken,
    tokens: {
      accessToken,
      tokenType: 'Bearer',
      expiresIn: ENV.JWT_EXPIRES_IN || '7d'
    }
  };
};

/**
 * Verify and decode a JWT token
 * @param {string} token - Signed JWT string
 * @returns {Object} - Decoded token payload
 */
export const verifyToken = (token) => {
  return jwt.verify(token, ENV.JWT_SECRET);
};

export default {
  generateToken,
  generateAuthTokens,
  verifyToken
};
