import { Request, Response } from 'express';
import { SettingsService } from '../../services/settingsService';
import logger from '../../utils/logger';

export class SystemController {
  private service = new SettingsService();

  async getSettings(req: Request, res: Response): Promise<void> {
    try {
      const settings = await this.service.getSystemSettings();
      res.json({
        success: true,
        data: settings
      });
    } catch (error) {
      logger.error('Error getting system settings:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to load system settings',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async updateSettings(req: Request, res: Response): Promise<void> {
    try {
      const settings = await this.service.updateSystemSettings(req.body);
      res.json({
        success: true,
        message: 'System settings updated successfully',
        data: settings
      });
    } catch (error) {
      logger.error('Error updating system settings:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update system settings',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async resetToDefaults(req: Request, res: Response): Promise<void> {
    try {
      const settings = await this.service.resetSystemSettings();
      res.json({
        success: true,
        message: 'System settings reset to defaults',
        data: settings
      });
    } catch (error) {
      logger.error('Error resetting system settings:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to reset system settings',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}
