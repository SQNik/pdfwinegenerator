import { Request, Response, NextFunction } from 'express';
import { wineCreateSchema, wineUpdateSchema } from '../validators/schemas';
import { DataStore } from '../services/dataStore';
import { Wine, ApiResponse, PaginatedResponse, ValidationError } from '../types';
import logger from '../utils/logger';
import Joi from 'joi';

export class WineController {
  private dataStore: DataStore;

  constructor(dataStore: DataStore) {
    this.dataStore = dataStore;
  }

  /**
   * Normalize select field values to lowercase for consistency
   */
  private normalizeSelectFields(body: any): any {
    const fieldsConfig = this.dataStore.getFieldsConfig();
    const normalizedBody = { ...body };
    
    fieldsConfig.forEach((field: any) => {
      if (field.type === 'select' && normalizedBody[field.key]) {
        const options = field.options || field.validation?.options || [];
        const value = normalizedBody[field.key];
        
        // Find matching option (case-insensitive) and use lowercase value
        const matchingOption = options.find((option: string) => 
          option.toLowerCase() === value.toLowerCase()
        );
        
        if (matchingOption) {
          normalizedBody[field.key] = matchingOption.toLowerCase();
        }
      }
    });
    
    return normalizedBody;
  }

  /**
   * Generate dynamic validation schema based on current field configuration
   */
  private generateDynamicSchema(): Joi.ObjectSchema {
    const fieldsConfig = this.dataStore.getFieldsConfig();
    const schemaFields: Record<string, Joi.Schema> = {};
    
    fieldsConfig.forEach((field: any) => {
      let joiField: Joi.Schema;
      
      switch (field.type) {
        case 'number':
          joiField = Joi.number();
          if (field.validation?.min !== undefined && field.validation.min !== '' && !isNaN(Number(field.validation.min))) {
            joiField = (joiField as Joi.NumberSchema).min(Number(field.validation.min));
          }
          if (field.validation?.max !== undefined && field.validation.max !== '' && !isNaN(Number(field.validation.max))) {
            joiField = (joiField as Joi.NumberSchema).max(Number(field.validation.max));
          }
          joiField = joiField.allow(null);
          break;
          
        case 'select':
          joiField = Joi.string();
          // Check both field.options and field.validation.options for backward compatibility
          const selectOptions = field.options || field.validation?.options;
          if (selectOptions && selectOptions.length > 0) {
            // Use lowercase options for validation to match normalized values
            const lowercaseOptions = selectOptions.map((opt: string) => opt.toLowerCase());
            joiField = (joiField as Joi.StringSchema).valid(...lowercaseOptions);
          }
          joiField = joiField.allow('');
          break;
          
        case 'textarea':
        case 'text':
        case 'url':
          joiField = Joi.string();
          if (field.validation?.min !== undefined && field.validation.min !== '' && !isNaN(Number(field.validation.min))) {
            joiField = (joiField as Joi.StringSchema).min(Number(field.validation.min));
          }
          if (field.validation?.max !== undefined && field.validation.max !== '' && !isNaN(Number(field.validation.max))) {
            joiField = (joiField as Joi.StringSchema).max(Number(field.validation.max));
          }
          if (field.validation?.pattern) {
            joiField = (joiField as Joi.StringSchema).pattern(new RegExp(field.validation.pattern));
          }
          joiField = joiField.allow('');
          break;
          
        case 'readonly':
          if (field.key === 'id') {
            joiField = Joi.string().required();
          } else {
            joiField = Joi.string().isoDate().required();
          }
          break;
          
        default:
          joiField = Joi.string().allow('');
          break;
      }
      
      // Apply required constraint
      if (field.required && field.type !== 'readonly') {
        if (field.type === 'number') {
          joiField = joiField.required();
        } else {
          joiField = (joiField as Joi.StringSchema).min(1).required();
        }
      }
      
      schemaFields[field.key] = joiField;
    });
    
    // Always allow additional system fields
    schemaFields.id = Joi.string().optional();
    schemaFields.createdAt = Joi.string().isoDate().optional();
    schemaFields.updatedAt = Joi.string().isoDate().optional();
    
    return Joi.object(schemaFields).unknown(false); // Reject unknown fields
  }

  getWines = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const search = req.query.search as string;
      const category = req.query.category as string;
      const type = req.query.type as string;
      const sortBy = req.query.sortBy as string || 'name';
      const sortOrder = req.query.sortOrder as 'asc' | 'desc' || 'asc';

      const offset = (page - 1) * limit;

      let wines = this.dataStore.getWines();

      // Apply filters
      if (search) {
        const searchLower = search.toLowerCase();
        wines = wines.filter(wine =>
          wine.name.toLowerCase().includes(searchLower) ||
          (wine.region && wine.region.toLowerCase().includes(searchLower)) ||
          (wine.description && wine.description.toLowerCase().includes(searchLower))
        );
      }

      if (category) {
        wines = wines.filter(wine => 
          wine.category && wine.category.toLowerCase() === category.toLowerCase()
        );
      }

      if (type) {
        wines = wines.filter(wine => 
          wine.type && wine.type.toLowerCase() === type.toLowerCase()
        );
      }

      // Apply sorting
      wines.sort((a, b) => {
        let aValue: any = a[sortBy as keyof Wine];
        let bValue: any = b[sortBy as keyof Wine];

        if (aValue === undefined) aValue = '';
        if (bValue === undefined) bValue = '';

        if (typeof aValue === 'string') {
          aValue = aValue.toLowerCase();
          bValue = bValue.toLowerCase();
        }

        if (sortOrder === 'desc') {
          return aValue < bValue ? 1 : -1;
        }
        return aValue > bValue ? 1 : -1;
      });

      const total = wines.length;
      const paginatedWines = wines.slice(offset, offset + limit);

      const response: PaginatedResponse<Wine> = {
        success: true,
        data: paginatedWines,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasNext: offset + limit < total,
          hasPrev: page > 1,
        },
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  };

  getWine = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      
      if (!id) {
        const response: ApiResponse = {
          success: false,
          error: 'Wine ID is required'
        };
        res.status(400).json(response);
        return;
      }
      
      const wine = this.dataStore.getWine(id);

      if (!wine) {
        const response: ApiResponse = {
          success: false,
          error: 'Wine not found',
        };
        res.status(404).json(response);
        return;
      }

      const response: ApiResponse<Wine> = {
        success: true,
        data: wine,
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  };

  createWine = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Normalize select field values to lowercase for consistency
      const normalizedBody = this.normalizeSelectFields(req.body);
      
      // Use dynamic validation based on current field configuration
      const dynamicSchema = this.generateDynamicSchema();
      const { error, value } = dynamicSchema.validate(normalizedBody, { abortEarly: false });

      if (error) {
        const validationErrors: ValidationError[] = error.details.map((detail: any) => ({
          field: detail.path.join('.'),
          message: detail.message,
          value: detail.context?.value,
        }));

        const response: ApiResponse = {
          success: false,
          error: 'Validation failed',
          validationErrors,
        };

        res.status(400).json(response);
        return;
      }

      const wine = await this.dataStore.createWine(value);

      const response: ApiResponse<Wine> = {
        success: true,
        data: wine,
      };

      logger.info(`Wine created: ${wine.name} (${wine.id})`);
      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  };

  updateWine = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      
      console.log('UPDATE WINE CONTROLLER:', {
        id,
        url: req.url,
        method: req.method,
        body: req.body,
        params: req.params
      });
      
      if (!id) {
        const response: ApiResponse = {
          success: false,
          error: 'Wine ID is required'
        };
        res.status(400).json(response);
        return;
      }

      // Normalize select field values to lowercase for consistency
      const normalizedBody = this.normalizeSelectFields(req.body);
      
      // Use dynamic validation based on current field configuration
      const dynamicSchema = this.generateDynamicSchema();
      const { error, value } = dynamicSchema.validate(normalizedBody, { abortEarly: false });

      if (error) {
        console.log('VALIDATION ERROR:', error.details);
        const validationErrors: ValidationError[] = error.details.map((detail: any) => ({
          field: detail.path.join('.'),
          message: detail.message,
          value: detail.context?.value,
        }));

        const response: ApiResponse = {
          success: false,
          error: 'Validation failed',
          validationErrors,
        };

        console.log('SENDING VALIDATION ERROR RESPONSE:', response);
        res.status(400).json(response);
        return;
      }

      const updatedWine = await this.dataStore.updateWine(id, value);

      if (!updatedWine) {
        const response: ApiResponse = {
          success: false,
          error: 'Wine not found',
        };
        res.status(404).json(response);
        return;
      }

      const response: ApiResponse<Wine> = {
        success: true,
        data: updatedWine,
      };

      logger.info(`Wine updated: ${updatedWine.name} (${id})`);
      res.json(response);
    } catch (error) {
      next(error);
    }
  };

  deleteWine = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      
      if (!id) {
        const response: ApiResponse = {
          success: false,
          error: 'Wine ID is required'
        };
        res.status(400).json(response);
        return;
      }
      
      const deleted = await this.dataStore.deleteWine(id);

      if (!deleted) {
        const response: ApiResponse = {
          success: false,
          error: 'Wine not found',
        };
        res.status(404).json(response);
        return;
      }

      const response: ApiResponse = {
        success: true,
      };

      logger.info(`Wine deleted: ${id}`);
      res.json(response);
    } catch (error) {
      next(error);
    }
  };

  searchWines = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const query = req.query.q as string;
      const limit = parseInt(req.query.limit as string) || 50;

      if (!query || query.length < 2) {
        const response: ApiResponse = {
          success: false,
          error: 'Search query must be at least 2 characters long',
        };
        res.status(400).json(response);
        return;
      }

      const wines = this.dataStore.getWines();
      const searchLower = query.toLowerCase();

      const results = wines.filter(wine =>
        wine.name?.toLowerCase().includes(searchLower) ||
        (wine.region && wine.region.toLowerCase().includes(searchLower)) ||
        (wine.description && wine.description.toLowerCase().includes(searchLower))
      ).slice(0, limit);

      const response: ApiResponse<Wine[]> = {
        success: true,
        data: results,
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  };

  clearAllWines = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.dataStore.clearAllWines();
      logger.info('All wines cleared from database');

      const response: ApiResponse = {
        success: true,
        data: { message: 'All wines have been cleared' }
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  };
}