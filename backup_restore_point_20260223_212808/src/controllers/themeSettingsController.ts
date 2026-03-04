import { Request, Response } from 'express';
import fs from 'fs/promises';
import path from 'path';
import multer from 'multer';
import logger from '../utils/logger';

const THEME_SETTINGS_FILE = path.join(__dirname, '../../data/theme-settings.json');
const UPLOADS_DIR = path.join(__dirname, '../../public/uploads/branding');

// Configure multer for logo uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    try {
      await fs.mkdir(UPLOADS_DIR, { recursive: true });
      cb(null, UPLOADS_DIR);
    } catch (error) {
      cb(error as Error, UPLOADS_DIR);
    }
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const filename = `logo-${Date.now()}${ext}`;
    cb(null, filename);
  }
});

const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PNG, JPG, and SVG are allowed.'));
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB
  }
});

interface ThemeSettings {
  primaryColor?: string;
  heroGradientStart?: string;
  heroGradientEnd?: string;
  borderRadius?: string;
  shadowIntensity?: string;
  spacing?: string;
  fontSize?: string;
  customCSS?: string;
  appName?: string;
  appLogoUrl?: string | null;
  appIcon?: string;
}

export class ThemeSettingsController {
  /**
   * Get current theme settings
   */
  async getSettings(req: Request, res: Response): Promise<void> {
    try {
      const settings = await this.loadSettings();
      res.json({
        success: true,
        data: settings
      });
    } catch (error) {
      logger.error('Error getting theme settings:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to load theme settings',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Update theme settings
   */
  async updateSettings(req: Request, res: Response): Promise<void> {
    try {
      const newSettings: ThemeSettings = req.body;
      
      // Validate settings
      if (newSettings.customCSS && typeof newSettings.customCSS !== 'string') {
        res.status(400).json({
          success: false,
          message: 'Custom CSS must be a string'
        });
        return;
      }

      // Load existing settings
      const existingSettings = await this.loadSettings();

      // Merge with new settings
      const updatedSettings = {
        ...existingSettings,
        ...newSettings,
        updatedAt: new Date().toISOString()
      };

      // Save to file
      await this.saveSettings(updatedSettings);

      res.json({
        success: true,
        message: 'Theme settings updated successfully',
        data: updatedSettings
      });
    } catch (error) {
      logger.error('Error updating theme settings:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update theme settings',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Upload logo file
   */
  async uploadLogo(req: Request, res: Response): Promise<void> {
    try {
      if (!req.file) {
        res.status(400).json({
          success: false,
          message: 'No file uploaded'
        });
        return;
      }

      // Delete old logo if exists
      const existingSettings = await this.loadSettings();
      if (existingSettings.appLogoUrl) {
        await this.deleteOldLogo(existingSettings.appLogoUrl);
      }

      // Generate URL for the new logo
      const logoUrl = `/uploads/branding/${req.file.filename}`;

      // Update settings with new logo URL
      const updatedSettings = {
        ...existingSettings,
        appLogoUrl: logoUrl,
        updatedAt: new Date().toISOString()
      };

      await this.saveSettings(updatedSettings);

      res.json({
        success: true,
        message: 'Logo uploaded successfully',
        data: {
          logoUrl,
          filename: req.file.filename
        }
      });
    } catch (error) {
      logger.error('Error uploading logo:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to upload logo',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Delete logo
   */
  async deleteLogo(req: Request, res: Response): Promise<void> {
    try {
      const existingSettings = await this.loadSettings();

      if (existingSettings.appLogoUrl) {
        await this.deleteOldLogo(existingSettings.appLogoUrl);

        // Update settings
        const updatedSettings = {
          ...existingSettings,
          appLogoUrl: null,
          updatedAt: new Date().toISOString()
        };

        await this.saveSettings(updatedSettings);

        res.json({
          success: true,
          message: 'Logo deleted successfully'
        });
      } else {
        res.status(404).json({
          success: false,
          message: 'No logo to delete'
        });
      }
    } catch (error) {
      logger.error('Error deleting logo:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete logo',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Reset theme settings to defaults
   */
  async resetSettings(req: Request, res: Response): Promise<void> {
    try {
      // Delete logo if exists
      const existingSettings = await this.loadSettings();
      if (existingSettings.appLogoUrl) {
        await this.deleteOldLogo(existingSettings.appLogoUrl);
      }

      const defaultSettings: ThemeSettings = {
        primaryColor: '#10b981',
        heroGradientStart: '#10b981',
        heroGradientEnd: '#059669',
        borderRadius: '8px',
        shadowIntensity: 'medium',
        spacing: 'normal',
        fontSize: 'medium',
        customCSS: '',
        appName: 'Katalog Win',
        appLogoUrl: null,
        appIcon: 'bi-wine'
      };

      await this.saveSettings(defaultSettings);

      res.json({
        success: true,
        message: 'Theme settings reset to defaults',
        data: defaultSettings
      });
    } catch (error) {
      logger.error('Error resetting theme settings:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to reset theme settings',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Load settings from file
   */
  private async loadSettings(): Promise<ThemeSettings> {
    try {
      const data = await fs.readFile(THEME_SETTINGS_FILE, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      // If file doesn't exist, return defaults
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        const defaults: ThemeSettings = {
          primaryColor: '#10b981',
          heroGradientStart: '#10b981',
          heroGradientEnd: '#059669',
          borderRadius: '8px',
          shadowIntensity: 'medium',
          spacing: 'normal',
          fontSize: 'medium',
          customCSS: '',
          appName: 'Katalog Win',
          appIcon: 'bi-wine'
        };
        await this.saveSettings(defaults);
        return defaults;
      }
      throw error;
    }
  }

  /**
   * Save settings to file
   */
  private async saveSettings(settings: ThemeSettings): Promise<void> {
    await fs.writeFile(
      THEME_SETTINGS_FILE,
      JSON.stringify(settings, null, 2),
      'utf-8'
    );
  }

  /**
   * Delete old logo file
   */
  private async deleteOldLogo(logoUrl: string): Promise<void> {
    try {
      // Extract filename from URL
      const filename = path.basename(logoUrl);
      const filepath = path.join(UPLOADS_DIR, filename);

      // Check if file exists and delete
      await fs.access(filepath);
      await fs.unlink(filepath);
      logger.info(`Deleted old logo: ${filename}`);
    } catch (error) {
      // Ignore if file doesn't exist
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
        logger.warn('Failed to delete old logo:', error);
      }
    }
  }
}
