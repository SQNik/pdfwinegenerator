# 🍷 Wine Management System - Production Guide

![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)
![Node](https://img.shields.io/badge/node-18%2B-green.svg)
![License](https://img.shields.io/badge/license-MIT-yellow.svg)
![Production Ready](https://img.shields.io/badge/production-ready-brightgreen.svg)

## 📋 Overview

**Wine Management System** is a comprehensive TypeScript-based application for managing wine collections with dynamic field management, PDF generation, and advanced import/export capabilities. Built with Express.js, this system offers a robust solution for wine enthusiasts, collectors, and businesses.

### 🌟 Key Features

- **🎯 Dynamic Field Management** - Zero-code field configuration
- **📊 Collection Management** - Organize wines into custom collections
- **📄 PDF Generation** - Professional wine catalogs and labels
- **📥 Import/Export** - CSV and Google Sheets integration
- **🔒 Production Security** - Rate limiting, CORS, Helmet protection
- **📈 Monitoring & Backup** - Automated backups and health monitoring
- **🚀 Performance** - Optimized for production workloads

## 🚀 Production Deployment

### Prerequisites

- **Node.js** 18+ 
- **npm** 8+
- **PM2** (recommended for production)
- **Linux/Windows Server** with minimum 1GB RAM

### Quick Start

```bash
# Clone the repository
git clone <repository-url>
cd wine-management-system

# Install dependencies
npm install

# Build the application
npm run build

# Copy production environment file
cp .env.production .env

# Configure environment variables (see Configuration section)
nano .env

# Start in production mode
npm run production
```

### Manual Production Setup

```bash
# 1. Build application
npm run build

# 2. Install PM2 globally
npm install -g pm2

# 3. Start with PM2
pm2 start ecosystem.config.json --env production

# 4. Set up PM2 startup script
pm2 startup
pm2 save
```

## ⚙️ Configuration

### Environment Variables

Create a `.env` file in the root directory:

```bash
# Application Environment
NODE_ENV=production
PORT=3001
HOST=0.0.0.0

# Security Configuration
CORS_ORIGIN=https://yourdomain.com
CORS_CREDENTIALS=true
SESSION_SECRET=your-super-secure-session-secret
JWT_SECRET=your-jwt-secret-key

# Performance & Limits
MAX_FILE_SIZE=50mb
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=1000

# Data & Backup
DATA_PATH=./data
BACKUP_PATH=./data/backups
MAX_BACKUPS=30

# Logging
LOG_LEVEL=info
LOG_FILE=./logs/wine-management.log

# Features
MONITORING_ENABLED=true
ENABLE_COMPRESSION=true
ENABLE_STATIC_CACHE=true
```

### PM2 Configuration

The included `ecosystem.config.json` provides:

- **Cluster Mode** - Multi-process scaling
- **Auto-restart** - Automatic recovery from crashes
- **Memory Monitoring** - Restart on memory leaks
- **Log Management** - Centralized logging
- **Deployment Scripts** - Automated deployment

## 📊 API Documentation

### Base URL
```
Production: https://yourdomain.com/api
Development: http://localhost:3001/api
```

### Core Endpoints

#### Wine Management
```http
GET    /api/wines                 # List all wines
POST   /api/wines                 # Create new wine
GET    /api/wines/:id             # Get wine by ID
PUT    /api/wines/:id             # Update wine
DELETE /api/wines/:id             # Delete wine
```

#### Dynamic Fields Management
```http
GET    /api/fields/config         # Get wine fields configuration
POST   /api/fields/config         # Create new field
PUT    /api/fields/config/:id     # Update field
DELETE /api/fields/config/:id     # Delete field
```

#### Collection Fields Management
```http
GET    /api/collection-fields/config     # Get collection fields
POST   /api/collection-fields/config     # Create collection field
PUT    /api/collection-fields/config/:id # Update collection field
DELETE /api/collection-fields/config/:id # Delete collection field
PUT    /api/collection-fields/order      # Update field order
GET    /api/collection-fields/stats      # Get usage statistics
```

#### Collections
```http
GET    /api/collections           # List collections
POST   /api/collections           # Create collection
GET    /api/collections/:id       # Get collection
PUT    /api/collections/:id       # Update collection
DELETE /api/collections/:id       # Delete collection
```

#### Import/Export
```http
POST   /api/import/csv            # Import from CSV
POST   /api/import/google-sheets  # Import from Google Sheets
GET    /api/import/validate       # Validate import data
```

#### PDF Generation
```http
POST   /api/pdf/generate          # Generate PDF
GET    /api/pdf/templates         # List PDF templates
POST   /api/pdf/templates         # Create PDF template
```

### Response Format

All API responses follow this structure:

```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  validationErrors?: ValidationError[];
}
```

### Authentication

Currently, the system operates without authentication. For production use with sensitive data, implement:

- JWT-based authentication
- Role-based access control (RBAC)
- API key management
- Session management

## 🔒 Security Features

### Production Security Measures

- **Helmet.js** - Security headers (CSP, HSTS, etc.)
- **Rate Limiting** - API request throttling
- **CORS Protection** - Cross-origin request control
- **Input Validation** - Joi schema validation
- **File Upload Security** - Type and size restrictions
- **Error Handling** - No sensitive data exposure

### Security Checklist

- [ ] Change default secrets in `.env`
- [ ] Configure proper CORS origins
- [ ] Set up HTTPS with SSL certificates
- [ ] Configure firewall rules
- [ ] Regular security updates
- [ ] Monitor logs for suspicious activity
- [ ] Implement backup encryption

## 📈 Monitoring & Maintenance

### Health Monitoring

```http
GET /api/health    # System health status
GET /metrics       # Detailed metrics (if enabled)
```

### Backup System

The application includes automated backup features:

- **Automatic Backups** - Every 6 hours in production
- **Backup Retention** - Configurable retention policy
- **Compression** - Gzip compression for space efficiency
- **Monitoring** - Backup success/failure tracking

### PM2 Management Commands

```bash
# View status
pm2 status

# View logs
pm2 logs wine-management-system

# Restart application
pm2 restart wine-management-system

# Reload with zero downtime
pm2 reload wine-management-system

# Monitor resources
pm2 monit

# Stop application
pm2 stop wine-management-system
```

### Log Management

Logs are stored in `./logs/` directory:

- `wine-management.log` - Application logs
- `pm2-out.log` - PM2 stdout logs
- `pm2-error.log` - PM2 error logs
- `pm2-combined.log` - Combined PM2 logs

## 🔧 Troubleshooting

### Common Issues

#### Port Already in Use
```bash
# Find process using port 3001
netstat -ano | findstr :3001
# Kill the process
taskkill /PID <PID> /F
```

#### Memory Issues
```bash
# Check memory usage
pm2 monit
# Restart if needed
pm2 restart wine-management-system
```

#### Permission Errors
```bash
# Ensure proper file permissions
chmod -R 755 ./data
chmod -R 755 ./logs
```

### Performance Optimization

1. **Enable Compression** - Set `ENABLE_COMPRESSION=true`
2. **Static File Caching** - Set `ENABLE_STATIC_CACHE=true`
3. **Memory Limits** - Configure PM2 `max_memory_restart`
4. **Database Optimization** - Regular data cleanup
5. **CDN Usage** - For static assets in production

## 📦 Updates & Maintenance

### Update Process

```bash
# 1. Backup current data
npm run backup

# 2. Pull latest changes
git pull origin main

# 3. Install dependencies
npm install

# 4. Build application
npm run build

# 5. Restart with PM2
pm2 reload wine-management-system
```

### Database Migration

When updating, check for schema changes:

```bash
# Verify field synchronization
npm run check-fields

# Auto-fix field issues
npm run fix-fields
```

## 🤝 Support & Contribution

### Getting Help

- **Documentation**: Check this README and inline code comments
- **Logs**: Review application logs for error details
- **Health Check**: Use `/api/health` endpoint for system status

### Development

```bash
# Development mode
npm run dev

# Run tests
npm test

# Lint code
npm run lint

# Format code
npm run format
```

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

**Wine Management System v2.0.0** - Production Ready 🚀

*Last updated: October 16, 2025*