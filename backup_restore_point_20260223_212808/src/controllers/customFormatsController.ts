import { Request, Response } from 'express';
import { DataStore } from '../services/dataStore';
import logger from '../utils/logger';
import { 
  customPDFFormatCreateSchema, 
  customPDFFormatUpdateSchema 
} from '../validators/schemas';
import { CustomPDFFormat, CustomPDFFormatCreate, CustomPDFFormatUpdate } from '../types';

export class CustomFormatsController {
  constructor(private dataStore: DataStore) {}

  // GET /api/custom-formats - Get all custom PDF formats
  async getCustomFormats(req: Request, res: Response): Promise<void> {
    try {
      const formats = this.dataStore.getCustomFormats();
      res.json({
        success: true,
        data: formats
      });
    } catch (error) {
      logger.error('Error fetching custom formats:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch custom formats'
      });
    }
  }

  // GET /api/custom-formats/:id - Get custom format by ID
  async getCustomFormat(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      if (!id) {
        res.status(400).json({
          success: false,
          error: 'Format ID is required'
        });
        return;
      }
      
      const format = this.dataStore.getCustomFormat(id);
      
      if (!format) {
        res.status(404).json({
          success: false,
          error: 'Custom format not found'
        });
        return;
      }

      res.json({
        success: true,
        data: format
      });
    } catch (error) {
      logger.error('Error fetching custom format:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch custom format'
      });
    }
  }

  // POST /api/custom-formats - Create new custom format
  async createCustomFormat(req: Request, res: Response): Promise<void> {
    try {
      const { error, value } = customPDFFormatCreateSchema.validate(req.body);
      
      if (error) {
        res.status(400).json({
          success: false,
          error: 'Validation failed',
          validationErrors: error.details.map(detail => ({
            field: detail.path.join('.'),
            message: detail.message
          }))
        });
        return;
      }

      // Check if format with same name already exists
      const existingFormat = await this.dataStore.getCustomFormatByName(value.name);
      if (existingFormat) {
        res.status(409).json({
          success: false,
          error: 'Custom format with this name already exists'
        });
        return;
      }

      const formatData: CustomPDFFormatCreate = value;
      const newFormat = await this.dataStore.createCustomFormat(formatData);
      
      logger.info(`Created custom PDF format: ${newFormat.name} (${newFormat.id})`);
      
      res.status(201).json({
        success: true,
        data: newFormat
      });
    } catch (error) {
      logger.error('Error creating custom format:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create custom format'
      });
    }
  }

  // PUT /api/custom-formats/:id - Update custom format
  async updateCustomFormat(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      if (!id) {
        res.status(400).json({
          success: false,
          error: 'Format ID is required'
        });
        return;
      }
      
      const { error, value } = customPDFFormatUpdateSchema.validate(req.body);
      
      if (error) {
        res.status(400).json({
          success: false,
          error: 'Validation failed',
          validationErrors: error.details.map(detail => ({
            field: detail.path.join('.'),
            message: detail.message
          }))
        });
        return;
      }

      // Check if format exists
      const existingFormat = this.dataStore.getCustomFormat(id);
      if (!existingFormat) {
        res.status(404).json({
          success: false,
          error: 'Custom format not found'
        });
        return;
      }

      // If name is being updated, check for duplicates
      if (value.name && value.name !== existingFormat.name) {
        const duplicateFormat = await this.dataStore.getCustomFormatByName(value.name);
        if (duplicateFormat && duplicateFormat.id !== id) {
          res.status(409).json({
            success: false,
            error: 'Custom format with this name already exists'
          });
          return;
        }
      }

      const updates: CustomPDFFormatUpdate = value;
      const updatedFormat = await this.dataStore.updateCustomFormat(id, updates);
      
      logger.info(`Updated custom PDF format: ${updatedFormat.name} (${id})`);
      
      res.json({
        success: true,
        data: updatedFormat
      });
    } catch (error) {
      logger.error('Error updating custom format:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update custom format'
      });
    }
  }

  // DELETE /api/custom-formats/:id - Delete custom format
  async deleteCustomFormat(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      if (!id) {
        res.status(400).json({
          success: false,
          error: 'Format ID is required'
        });
        return;
      }
      
      // Check if format exists
      const existingFormat = this.dataStore.getCustomFormat(id);
      if (!existingFormat) {
        res.status(404).json({
          success: false,
          error: 'Custom format not found'
        });
        return;
      }

      const deleted = await this.dataStore.deleteCustomFormat(id);
      
      if (deleted) {
        logger.info(`Deleted custom PDF format: ${existingFormat.name} (${id})`);
        res.json({
          success: true,
          message: 'Custom format deleted successfully'
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Failed to delete custom format'
        });
      }
    } catch (error) {
      logger.error('Error deleting custom format:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete custom format'
      });
    }
  }

  // GET /api/custom-formats/validate-name/:name - Check if format name is available
  async validateFormatName(req: Request, res: Response): Promise<void> {
    try {
      const { name } = req.params;
      const { excludeId } = req.query;
      
      if (!name) {
        res.status(400).json({
          success: false,
          error: 'Format name is required'
        });
        return;
      }
      
      const existingFormat = await this.dataStore.getCustomFormatByName(name);
      const isAvailable = !existingFormat || (excludeId && existingFormat.id === excludeId);
      
      res.json({
        success: true,
        data: {
          name,
          available: isAvailable,
          ...(existingFormat && !isAvailable && { conflictId: existingFormat.id })
        }
      });
    } catch (error) {
      logger.error('Error validating format name:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to validate format name'
      });
    }
  }
}