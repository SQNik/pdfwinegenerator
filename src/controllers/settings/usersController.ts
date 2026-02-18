import { Request, Response } from 'express';
import { SettingsService } from '../../services/settingsService';
import logger from '../../utils/logger';

export class UsersController {
  private service = new SettingsService();

  async getUsers(req: Request, res: Response): Promise<void> {
    try {
      const users = await this.service.getUserSettings();
      res.json({
        success: true,
        data: {
          users: users
        }
      });
    } catch (error) {
      logger.error('Error getting users:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to load users',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async addUser(req: Request, res: Response): Promise<void> {
    try {
      const newUser = {
        ...req.body,
        id: `user-${Date.now()}`,
        createdAt: new Date().toISOString(),
        active: true
      };
      
      const users = await this.service.addUser(newUser);
      res.json({
        success: true,
        message: 'User added successfully',
        data: users
      });
    } catch (error) {
      logger.error('Error adding user:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to add user',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async updateUser(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      
      if (!userId) {
        res.status(400).json({
          success: false,
          message: 'User ID is required'
        });
        return;
      }
      
      const users = await this.service.updateUser(userId, req.body);
      res.json({
        success: true,
        message: 'User updated successfully',
        data: users
      });
    } catch (error) {
      logger.error('Error updating user:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update user',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async deleteUser(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      
      if (!userId) {
        res.status(400).json({
          success: false,
          message: 'User ID is required'
        });
        return;
      }
      
      const users = await this.service.removeUser(userId);
      res.json({
        success: true,
        message: 'User deleted successfully',
        data: users
      });
    } catch (error) {
      logger.error('Error deleting user:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete user',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}
