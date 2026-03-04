import { promises as fs } from 'fs';
import path from 'path';
import { createWriteStream } from 'fs';
import { pipeline } from 'stream/promises';
import { createGzip } from 'zlib';
import logger from '../utils/logger';

export interface BackupConfig {
  dataPath: string;
  backupPath: string;
  maxBackups: number;
  compressionEnabled: boolean;
  includePatterns: string[];
  excludePatterns: string[];
}

export interface MonitoringMetrics {
  filesCount: number;
  totalSize: number;
  lastBackup: Date | null;
  lastError: string | null;
  healthStatus: 'healthy' | 'warning' | 'error';
  uptime: number;
  memoryUsage: NodeJS.MemoryUsage;
}

export class BackupMonitoringService {
  private config: BackupConfig;
  private metrics: MonitoringMetrics;
  private backupInterval: NodeJS.Timeout | null = null;
  private healthCheckInterval: NodeJS.Timeout | null = null;

  constructor(config: Partial<BackupConfig> = {}) {
    this.config = {
      dataPath: process.env.DATA_PATH || './data',
      backupPath: process.env.BACKUP_PATH || './data/backups',
      maxBackups: parseInt(process.env.MAX_BACKUPS || '30', 10),
      compressionEnabled: true,
      includePatterns: ['*.json'],
      excludePatterns: ['*.tmp', '*.log'],
      ...config
    };

    this.metrics = {
      filesCount: 0,
      totalSize: 0,
      lastBackup: null,
      lastError: null,
      healthStatus: 'healthy',
      uptime: Date.now(),
      memoryUsage: process.memoryUsage()
    };
  }

  async initialize(): Promise<void> {
    try {
      // Ensure backup directory exists
      await fs.mkdir(this.config.backupPath, { recursive: true });
      
      // Start automatic backup and health monitoring
      if (process.env.NODE_ENV === 'production') {
        this.startAutomaticBackup();
        this.startHealthMonitoring();
      }
      
      logger.info('BackupMonitoringService initialized successfully', {
        backupPath: this.config.backupPath,
        maxBackups: this.config.maxBackups
      });
    } catch (error) {
      logger.error('Failed to initialize BackupMonitoringService:', error);
      throw error;
    }
  }

  async createBackup(): Promise<string> {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupDir = path.join(this.config.backupPath, `backup-${timestamp}`);
      
      await fs.mkdir(backupDir, { recursive: true });

      const files = await this.getFilesToBackup();
      let totalSize = 0;

      for (const file of files) {
        const relativePath = path.relative(this.config.dataPath, file);
        const backupFilePath = path.join(backupDir, relativePath);
        
        // Ensure backup subdirectory exists
        await fs.mkdir(path.dirname(backupFilePath), { recursive: true });
        
        if (this.config.compressionEnabled) {
          await this.compressFile(file, `${backupFilePath}.gz`);
        } else {
          await fs.copyFile(file, backupFilePath);
        }
        
        const stats = await fs.stat(file);
        totalSize += stats.size;
      }

      // Create backup manifest
      const manifest = {
        timestamp: new Date().toISOString(),
        filesCount: files.length,
        totalSize,
        compression: this.config.compressionEnabled,
        files: files.map(f => path.relative(this.config.dataPath, f))
      };

      await fs.writeFile(
        path.join(backupDir, 'manifest.json'),
        JSON.stringify(manifest, null, 2)
      );

      // Update metrics
      this.metrics.filesCount = files.length;
      this.metrics.totalSize = totalSize;
      this.metrics.lastBackup = new Date();
      this.metrics.lastError = null;

      // Cleanup old backups
      await this.cleanupOldBackups();

      logger.info('Backup created successfully', {
        backupDir,
        filesCount: files.length,
        totalSize: `${(totalSize / 1024 / 1024).toFixed(2)} MB`
      });

      return backupDir;
    } catch (error) {
      this.metrics.lastError = error instanceof Error ? error.message : 'Unknown error';
      this.metrics.healthStatus = 'error';
      logger.error('Failed to create backup:', error);
      throw error;
    }
  }

  private async getFilesToBackup(): Promise<string[]> {
    const files: string[] = [];
    
    const scanDirectory = async (dir: string): Promise<void> => {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        
        if (entry.isDirectory()) {
          await scanDirectory(fullPath);
        } else if (entry.isFile()) {
          const shouldInclude = this.config.includePatterns.some(pattern =>
            this.matchPattern(entry.name, pattern)
          );
          
          const shouldExclude = this.config.excludePatterns.some(pattern =>
            this.matchPattern(entry.name, pattern)
          );
          
          if (shouldInclude && !shouldExclude) {
            files.push(fullPath);
          }
        }
      }
    };

    await scanDirectory(this.config.dataPath);
    return files;
  }

  private matchPattern(filename: string, pattern: string): boolean {
    const regex = new RegExp(pattern.replace(/\*/g, '.*'));
    return regex.test(filename);
  }

  private async compressFile(inputPath: string, outputPath: string): Promise<void> {
    const readStream = await fs.open(inputPath, 'r');
    const writeStream = createWriteStream(outputPath);
    const gzipStream = createGzip();

    await pipeline(
      readStream.createReadStream(),
      gzipStream,
      writeStream
    );

    await readStream.close();
  }

  private async cleanupOldBackups(): Promise<void> {
    try {
      const backupEntries = await fs.readdir(this.config.backupPath, { withFileTypes: true });
      const backupDirs = backupEntries
        .filter(entry => entry.isDirectory() && entry.name.startsWith('backup-'))
        .map(entry => ({
          name: entry.name,
          path: path.join(this.config.backupPath, entry.name),
          created: this.parseBackupTimestamp(entry.name)
        }))
        .sort((a, b) => b.created.getTime() - a.created.getTime());

      if (backupDirs.length > this.config.maxBackups) {
        const toDelete = backupDirs.slice(this.config.maxBackups);
        
        for (const backup of toDelete) {
          await fs.rm(backup.path, { recursive: true, force: true });
          logger.info('Deleted old backup', { backup: backup.name });
        }
      }
    } catch (error) {
      logger.error('Failed to cleanup old backups:', error);
    }
  }

  private parseBackupTimestamp(backupName: string): Date {
    const timestamp = backupName.replace('backup-', '').replace(/-/g, ':');
    return new Date(timestamp);
  }

  private startAutomaticBackup(): void {
    // Create backup every 6 hours
    const interval = 6 * 60 * 60 * 1000;
    
    this.backupInterval = setInterval(async () => {
      try {
        await this.createBackup();
        logger.info('Automatic backup completed successfully');
      } catch (error) {
        logger.error('Automatic backup failed:', error);
      }
    }, interval);

    logger.info('Automatic backup started', { intervalHours: 6 });
  }

  private startHealthMonitoring(): void {
    const interval = parseInt(process.env.HEALTH_CHECK_INTERVAL || '30000', 10);
    
    this.healthCheckInterval = setInterval(() => {
      this.updateHealthMetrics();
    }, interval);

    logger.info('Health monitoring started', { intervalMs: interval });
  }

  private updateHealthMetrics(): void {
    this.metrics.memoryUsage = process.memoryUsage();
    
    // Check memory usage
    const memoryThreshold = 500 * 1024 * 1024; // 500MB
    if (this.metrics.memoryUsage.heapUsed > memoryThreshold) {
      this.metrics.healthStatus = 'warning';
      logger.warn('High memory usage detected', {
        heapUsed: `${(this.metrics.memoryUsage.heapUsed / 1024 / 1024).toFixed(2)} MB`
      });
    }

    // Check last backup age
    if (this.metrics.lastBackup) {
      const hoursSinceBackup = (Date.now() - this.metrics.lastBackup.getTime()) / (1000 * 60 * 60);
      if (hoursSinceBackup > 24) {
        this.metrics.healthStatus = 'warning';
        logger.warn('No recent backup found', { hoursSinceBackup: hoursSinceBackup.toFixed(1) });
      }
    }
  }

  getMetrics(): MonitoringMetrics {
    return {
      ...this.metrics,
      uptime: Date.now() - this.metrics.uptime
    };
  }

  async getBackupList(): Promise<Array<{ name: string; created: Date; size: number }>> {
    try {
      const backupEntries = await fs.readdir(this.config.backupPath, { withFileTypes: true });
      const backups = [];

      for (const entry of backupEntries) {
        if (entry.isDirectory() && entry.name.startsWith('backup-')) {
          const backupPath = path.join(this.config.backupPath, entry.name);
          const stats = await fs.stat(backupPath);
          
          backups.push({
            name: entry.name,
            created: this.parseBackupTimestamp(entry.name),
            size: stats.size
          });
        }
      }

      return backups.sort((a, b) => b.created.getTime() - a.created.getTime());
    } catch (error) {
      logger.error('Failed to get backup list:', error);
      return [];
    }
  }

  async restoreBackup(backupName: string): Promise<void> {
    try {
      const backupPath = path.join(this.config.backupPath, backupName);
      const manifestPath = path.join(backupPath, 'manifest.json');
      
      // Read backup manifest
      const manifestContent = await fs.readFile(manifestPath, 'utf-8');
      const manifest = JSON.parse(manifestContent);
      
      logger.info('Starting backup restoration', {
        backup: backupName,
        filesCount: manifest.filesCount
      });

      // Restore files
      for (const relativePath of manifest.files) {
        const sourceFile = path.join(backupPath, relativePath + (manifest.compression ? '.gz' : ''));
        const targetFile = path.join(this.config.dataPath, relativePath);
        
        // Ensure target directory exists
        await fs.mkdir(path.dirname(targetFile), { recursive: true });
        
        if (manifest.compression) {
          // TODO: Implement decompression if needed
          logger.warn('Compression restoration not implemented yet');
        } else {
          await fs.copyFile(sourceFile, targetFile);
        }
      }

      logger.info('Backup restoration completed successfully', { backup: backupName });
    } catch (error) {
      logger.error('Failed to restore backup:', error);
      throw error;
    }
  }

  shutdown(): void {
    if (this.backupInterval) {
      clearInterval(this.backupInterval);
      this.backupInterval = null;
    }
    
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }
    
    logger.info('BackupMonitoringService shutdown completed');
  }
}