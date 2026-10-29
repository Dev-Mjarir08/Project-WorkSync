import { ENV } from './env.js';

const explicitOrigins = [
  ENV.CLIENT_URL,
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:3000'
].filter(Boolean);

export const corsOptions = {
  origin: (origin, callback) => {
    // Allow non-browser requests (Postman, curl, server-to-server, mobile)
    if (!origin) {
      return callback(null, true);
    }

    // In development mode, allow any localhost or 127.0.0.1 port
    if (
      ENV.NODE_ENV === 'development' &&
      /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)
    ) {
      return callback(null, true);
    }

    if (explicitOrigins.includes(origin) || explicitOrigins.includes(origin.replace(/\/$/, ''))) {
      return callback(null, true);
    }

    callback(new Error(`CORS policy blocked access from origin: ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'x-access-token']
};

export default corsOptions;
