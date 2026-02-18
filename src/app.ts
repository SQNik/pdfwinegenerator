import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import slowDown from 'express-slow-down';
import path from 'path';

import config from './config/app';
import { DataStore } from './services/dataStore';
import { PDFService } from './services/pdfService';
import { createWineRoutes } from './routes/wines';
import { createImportRoutes } from './routes/import';
import { createFieldsRoutes } from './routes/fields';
import { createPDFRoutes } from './routes/pdf';
import { createCollectionRoutes } from './routes/collections';
import { createCollectionFieldsRoutes } from './routes/collectionFields';
import { createTemplateEditorRoutes } from './routes/templateEditor';
import { createCustomFormatsRoutes } from './routes/customFormats';
import { createThemeSettingsRoutes } from './routes/themeSettings';
import { createSettingsRoutes } from './routes/settings';
import { errorHandler, notFoundHandler, requestLogger } from './middleware/errorHandler';
import { BackupMonitoringService } from './services/backupMonitoringService';
import logger from './utils/logger';

export class WineManagementApp {
  private app: Application;
  private dataStore: DataStore;
  private pdfService: PDFService;
  private backupService: BackupMonitoringService;

  constructor() {
    this.app = express();
    this.dataStore = new DataStore();
    this.pdfService = new PDFService(this.dataStore);
    this.backupService = new BackupMonitoringService();
  }

  async initialize(): Promise<void> {
    try {
      // Initialize data store
      await this.dataStore.initialize();
      
      // Initialize PDF service
      await this.pdfService.initialize();

      // Initialize backup and monitoring service
      if (process.env.NODE_ENV === 'production' || process.env.MONITORING_ENABLED === 'true') {
        await this.backupService.initialize();
      }

      // Setup middleware
      this.setupMiddleware();

      // Setup routes
      this.setupRoutes();

      // Setup error handling
      this.setupErrorHandling();

      logger.info('Wine Management System initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize Wine Management System:', error);
      throw error;
    }
  }

  private setupMiddleware(): void {
    // Production-ready security middleware
    const isProduction = process.env.NODE_ENV === 'production';
    
    this.app.use(helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: isProduction 
            ? ["'self'", "https://cdn.jsdelivr.net", "https://cdnjs.cloudflare.com"]
            : ["'self'", "'unsafe-inline'", "'unsafe-hashes'", "https://cdn.jsdelivr.net", "https://cdnjs.cloudflare.com"],
          scriptSrcAttr: isProduction ? ["'none'"] : ["'unsafe-inline'"],
          styleSrc: [
            "'self'", 
            "'unsafe-inline'", 
            "https://cdn.jsdelivr.net",
            "https://cdnjs.cloudflare.com",
            "https://fonts.googleapis.com"
          ],
          fontSrc: [
            "'self'", 
            "https://cdn.jsdelivr.net",
            "https://cdnjs.cloudflare.com",
            "https://fonts.googleapis.com",
            "https://fonts.gstatic.com"
          ],
          connectSrc: [
            "'self'",
            isProduction ? "" : "http://localhost:3001",
            isProduction ? "" : "ws://localhost:3001",
            "https://cdn.jsdelivr.net"
          ].filter(Boolean),
          imgSrc: ["'self'", "data:", "https:"],
          frameSrc: ["'self'", "blob:", "data:", "about:"],
          frameAncestors: ["'self'"],
          childSrc: ["'self'", "blob:", "data:", "about:"],
        },
      },
    }));
    this.app.use(cors(config.cors));
    
    // Production optimizations
    if (process.env.ENABLE_COMPRESSION === 'true') {
      this.app.use(compression());
    }

    // Rate limiting for production
    if (process.env.NODE_ENV === 'production') {
      const limiter = rateLimit({
        windowMs: config.security.rateLimitWindowMs,
        max: config.security.rateLimitMaxRequests,
        message: {
          success: false,
          error: 'Too many requests from this IP, please try again later.',
        },
        standardHeaders: true,
        legacyHeaders: false,
      });
      
      const speedLimiter = slowDown({
        windowMs: 15 * 60 * 1000, // 15 minutes
        delayAfter: 50, // allow 50 requests per windowMs without delay
        delayMs: 500, // add 500ms delay per request after delayAfter
        maxDelayMs: 20000, // max delay of 20 seconds
      });
      
      this.app.use('/api/', limiter);
      this.app.use('/api/', speedLimiter);
    } else {
      // Development mode - much higher limits
      const devLimiter = rateLimit({
        windowMs: 60 * 1000, // 1 minute
        max: 1000, // 1000 requests per minute
        message: {
          success: false,
          error: 'Too many requests (dev mode).',
        },
        standardHeaders: true,
        legacyHeaders: false,
      });
      
      this.app.use('/api/', devLimiter);
      logger.info('Development mode: Rate limiting relaxed (1000 req/min)');
    }

    // Request logging
    this.app.use(requestLogger);

    // Body parsing
    this.app.use(express.json({ limit: config.upload.maxFileSize }));
    this.app.use(express.urlencoded({ extended: true, limit: config.upload.maxFileSize }));

    // Static files with caching for production
    const staticOptions = process.env.NODE_ENV === 'production' ? {
      maxAge: parseInt(process.env.STATIC_CACHE_MAX_AGE || '86400', 10) * 1000, // 1 day default
      etag: process.env.ENABLE_ETAG === 'true',
      lastModified: true,
      cacheControl: true,
      immutable: false,
      setHeaders: (res: any, path: string) => {
        // Cache CSS and JS files for longer
        if (path.endsWith('.css') || path.endsWith('.js')) {
          res.setHeader('Cache-Control', 'public, max-age=604800'); // 1 week
        }
        // Cache images for longer
        if (path.match(/\.(jpg|jpeg|png|gif|ico|svg)$/)) {
          res.setHeader('Cache-Control', 'public, max-age=2592000'); // 30 days
        }
        // Security headers for static files
        res.setHeader('X-Content-Type-Options', 'nosniff');
      }
    } : {};
    
    this.app.use(express.static(path.join(__dirname, '../public'), staticOptions));
  }

  private setupRoutes(): void {
    // CORS preflight
    this.app.options('*', cors());
    
    // API routes
    this.app.use('/api/wines', createWineRoutes(this.dataStore));
    this.app.use('/api/collections', createCollectionRoutes(this.dataStore));
    this.app.use('/api/collection-fields', createCollectionFieldsRoutes(this.dataStore));
    this.app.use('/api/import', createImportRoutes(this.dataStore));
    this.app.use('/api/fields', createFieldsRoutes(this.dataStore));
    this.app.use('/api/pdf', createPDFRoutes(this.dataStore));
    this.app.use('/api/custom-formats', createCustomFormatsRoutes(this.dataStore));
    this.app.use('/api/template-editor', createTemplateEditorRoutes(this.dataStore, this.pdfService));
    this.app.use('/api/theme-settings', createThemeSettingsRoutes());
    this.app.use('/theme-settings', createThemeSettingsRoutes()); // Alias bez /api dla kompatybilności
    this.app.use('/api/settings', createSettingsRoutes());

    // Health check
    this.app.get('/api/health', (req, res) => {
      const healthData = {
        success: true,
        message: 'Wine Management System is running',
        timestamp: new Date().toISOString(),
        version: process.env.npm_package_version || '2.0.0',
        environment: process.env.NODE_ENV || 'development',
        uptime: process.uptime(),
        memory: process.memoryUsage(),
      };

      // Add backup service metrics if available
      if (this.backupService && (process.env.NODE_ENV === 'production' || process.env.MONITORING_ENABLED === 'true')) {
        (healthData as any).monitoring = this.backupService.getMetrics();
      }

      res.json(healthData);
    });

    // Monitoring metrics endpoint
    if (process.env.MONITORING_ENABLED === 'true') {
      this.app.get('/metrics', (req, res) => {
        const metrics = this.backupService?.getMetrics();
        res.json({
          success: true,
          data: metrics,
          timestamp: new Date().toISOString()
        });
      });
    }

    // Frontend routes
    this.app.get('/', (req, res) => {
      res.sendFile(path.join(__dirname, '../public/index.html'));
    });
  }

  private setupErrorHandling(): void {
    this.app.use(notFoundHandler);
    this.app.use(errorHandler);
  }

  start(): void {
    const port = config.port;
    this.app.listen(port, () => {
      logger.info(`🍷 Wine Management Server running on http://localhost:${port}`);
      logger.info(`📊 Admin Panel: http://localhost:${port}/admin`);
    });
  }

  getApp(): Application {
    return this.app;
  }
}