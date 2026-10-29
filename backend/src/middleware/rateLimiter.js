import rateLimit from 'express-rate-limit';
import { ENV } from '../config/env.js';

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: ENV.NODE_ENV === 'development' ? 500 : 30, // Relaxed in dev, strictly 30 per 15 min in production
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    statusCode: 429,
    message: 'Too many authentication attempts from this IP, please try again after 15 minutes.'
  }
});

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: ENV.NODE_ENV === 'development' ? 2000 : 500,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    statusCode: 429,
    message: 'Too many requests, please try again later.'
  }
});

export default {
  authLimiter,
  apiLimiter
};
