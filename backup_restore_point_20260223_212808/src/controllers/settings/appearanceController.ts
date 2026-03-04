import { Request, Response } from 'express';
import { SettingsService } from '../../services/settingsService';
import logger from '../../utils/logger';
import { upload } from '../../controllers/themeSettingsController';
import fs from 'fs/promises';
import path from 'path';

const UPLOADS_DIR = path.join(__dirname, '../../../public/uploads/branding');

export class AppearanceController {
  private service = new SettingsService();

  async getSettings(req: Request, res: Response): Promise<void> {
    try {
      const settings = await this.service.getAppearanceSettings();
      res.json({
        success: true,
        data: settings
      });
    } catch (error) {
      logger.error('Error getting appearance settings:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to load appearance settings',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async updateSettings(req: Request, res: Response): Promise<void> {
    try {
      const settings = await this.service.updateAppearanceSettings(req.body);
      res.json({
        success: true,
        message: 'Appearance settings updated successfully',
        data: settings
      });
    } catch (error) {
      logger.error('Error updating appearance settings:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update appearance settings',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async resetToDefaults(req: Request, res: Response): Promise<void> {
    try {
      const settings = await this.service.resetAppearanceSettings();
      res.json({
        success: true,
        message: 'Appearance settings reset to defaults',
        data: settings
      });
    } catch (error) {
      logger.error('Error resetting appearance settings:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to reset appearance settings',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

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
      const existingSettings = await this.service.getAppearanceSettings();
      if (existingSettings.appLogoUrl) {
        await this.deleteOldLogo(existingSettings.appLogoUrl);
      }

      const logoUrl = `/uploads/branding/${req.file.filename}`;

      // Update settings with new logo URL
      const updatedSettings = await this.service.updateAppearanceSettings({
        appLogoUrl: logoUrl
      });

      res.json({
        success: true,
        message: 'Logo uploaded successfully',
        data: {
          logoUrl,
          filename: req.file.filename,
          settings: updatedSettings
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

  async deleteLogo(req: Request, res: Response): Promise<void> {
    try {
      const existingSettings = await this.service.getAppearanceSettings();

      if (existingSettings.appLogoUrl) {
        await this.deleteOldLogo(existingSettings.appLogoUrl);

        await this.service.updateAppearanceSettings({
          appLogoUrl: null
        });

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

  private async deleteOldLogo(logoUrl: string): Promise<void> {
    try {
      const filename = path.basename(logoUrl);
      const filepath = path.join(UPLOADS_DIR, filename);
      await fs.access(filepath);
      await fs.unlink(filepath);
      logger.info(`Deleted old logo: ${filename}`);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
        logger.warn('Failed to delete old logo:', error);
      }
    }
  }
}
