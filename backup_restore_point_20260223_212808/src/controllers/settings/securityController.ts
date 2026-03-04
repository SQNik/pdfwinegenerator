import { Request, Response } from 'express';
import { SettingsService } from '../../services/settingsService';
import logger from '../../utils/logger';

export class SecurityController {
  private service = new SettingsService();

  async getSettings(req: Request, res: Response): Promise<void> {
    try {
      const settings = await this.service.getSecuritySettings();
      res.json({
        success: true,
        data: settings
      });
    } catch (error) {
      logger.error('Error getting security settings:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to load security settings',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async updateSettings(req: Request, res: Response): Promise<void> {
    try {
      const settings = await this.service.updateSecuritySettings(req.body);
      res.json({
        success: true,
        message: 'Security settings updated successfully',
        data: settings
      });
    } catch (error) {
      logger.error('Error updating security settings:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update security settings',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async resetToDefaults(req: Request, res: Response): Promise<void> {
    try {
      const settings = await this.service.resetSecuritySettings();
      res.json({
        success: true,
        message: 'Security settings reset to defaults',
        data: settings
      });
    } catch (error) {
      logger.error('Error resetting security settings:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to reset security settings',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}
