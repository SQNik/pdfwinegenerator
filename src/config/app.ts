import { CorsOptions } from 'cors';

export interface AppConfig {
  port: number;
  cors: CorsOptions;
  upload: {
    maxFileSize: string;
    allowedTypes: string[];
  };
  security: {
    rateLimitWindowMs: number;
    rateLimitMaxRequests: number;
  };
  logging: {
    level: string;
    file: string;
  };
}

const config: AppConfig = {
  port: parseInt(process.env.PORT || '3001', 10),
  cors: {
    origin: process.env.NODE_ENV === 'production' 
      ? (process.env.CORS_ORIGIN || '').split(',').filter(Boolean)
      : ['http://localhost:3000', 'http://localhost:3001'],
    credentials: process.env.CORS_CREDENTIALS === 'true',
  },
  upload: {
    maxFileSize: process.env.MAX_FILE_SIZE || '10mb',
    allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'text/csv'],
  },
  security: {
    rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 minutes default
    rateLimitMaxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
  },
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    file: process.env.LOG_FILE || 'logs/wine-management.log',
  },
};

export default config;