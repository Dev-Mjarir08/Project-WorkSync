import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const ENV = {
  PORT: process.env.PORT || 8081,
  NODE_ENV: process.env.NODE_ENV || 'development',
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb+srv://jarir_08:12345@nodejs.lvwtj3x.mongodb.net/worksync?retryWrites=true&w=majority',
  JWT_SECRET: process.env.JWT_SECRET || 'worksync_jwt_secret_key_production_grade_super_secret_2026',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  CLIENT_URL: process.env.CLIENT_URL || 'https://project-work-syncc.vercel.app',
  SERVER_URL: process.env.SERVER_URL || 'https://project-work-sync-backend.vercel.app'
};

export default ENV;
