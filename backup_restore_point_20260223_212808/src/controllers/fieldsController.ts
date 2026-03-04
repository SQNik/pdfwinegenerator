import { Request, Response } from 'express';
import { DataStore } from '../services/dataStore';
import { FieldConfig } from '../types';
import { DEFAULT_SYSTEM_FIELDS, isSystemField, validateSystemFields } from '../config/defaultFields';
import logger from '../utils/logger';

export class FieldsController {
  constructor(private dataStore: DataStore) {}

  /**
   * Get fields configuration
   */
  getFieldsConfig = async (req: Request, res: Response): Promise<void> => {
    try {
      const config = this.dataStore.getFieldsConfig();
      res.json({
        success: true,
        data: config,
      });
    } catch (error) {
      logger.error('Error getting fields configuration:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  };

  /**
   * Update fields configuration
   */
  updateFieldsConfig = async (req: Request, res: Response): Promise<void> => {
    try {
      const { config } = req.body;

      if (!Array.isArray(config)) {
        res.status(400).json({
          success: false,
          message: 'Configuration must be an array',
        });
        return;
      }

      // 🔒 WALIDACJA POLA SYSTEMOWYCH - sprawdź czy wszystkie niezbędne pola są obecne
      const systemValidation = validateSystemFields(config);
      if (!systemValidation.valid) {
        res.status(400).json({
          success: false,
          message: `Nie można usunąć pól systemowych. Brakuje: ${systemValidation.missing.join(', ')}`,
          error: 'SYSTEM_FIELDS_REQUIRED',
          missingFields: systemValidation.missing
        });
        return;
      }

      // Basic validation of fields
      for (const field of config) {
        if (!field.key || !field.label || !field.type) {
          res.status(400).json({
            success: false,
            message: 'Each field must have key, label, and type',
          });
          return;
        }

        // 🔒 WALIDACJA POLA SYSTEMOWYCH - sprawdź czy nie modyfikujemy kluczowych właściwości
        if (isSystemField(field.key)) {
          const systemField = DEFAULT_SYSTEM_FIELDS.find(sf => sf.key === field.key);
          if (systemField) {
            // Sprawdź czy nie zmieniono kluczowych właściwości
            if (field.type !== systemField.type) {
              res.status(400).json({
                success: false,
                message: `Nie można zmienić typu pola systemowego '${field.key}' z '${systemField.type}' na '${field.type}'`,
                error: 'SYSTEM_FIELD_TYPE_LOCKED'
              });
              return;
            }
            
            if (field.required !== systemField.required) {
              res.status(400).json({
                success: false,
                message: `Nie można zmienić wymagalności pola systemowego '${field.key}'`,
                error: 'SYSTEM_FIELD_REQUIRED_LOCKED'
              });
              return;
            }

            // Wymuś flagę systemową
            field.isSystemField = true;
          }
        }
      }

      const updatedConfig = await this.dataStore.updateFieldsConfig(config);

      res.json({
        success: true,
        data: updatedConfig,
        message: 'Fields configuration updated successfully',
      });

      logger.info(`Fields configuration updated with ${config.length} fields`);
    } catch (error) {
      logger.error('Error updating fields configuration:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  };

  /**
   * Reset fields configuration to defaults
   */
  resetFieldsConfig = async (req: Request, res: Response): Promise<void> => {
    try {
      // 🔒 Przywróć domyślną konfigurację systemową (12 zabezpieczonych pól)
      const defaultConfig = [...DEFAULT_SYSTEM_FIELDS];
      
      const updatedConfig = await this.dataStore.updateFieldsConfig(defaultConfig);

      res.json({
        success: true,
        data: updatedConfig,
        message: 'Fields configuration reset to system defaults (12 protected fields)',
      });

      logger.info('Fields configuration reset to system defaults with 12 protected fields');
    } catch (error) {
      logger.error('Error resetting fields configuration:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  };

  /**
   * Get system fields information
   */
  getSystemFields = async (req: Request, res: Response): Promise<void> => {
    try {
      const systemFieldKeys = DEFAULT_SYSTEM_FIELDS.map(field => field.key);
      
      res.json({
        success: true,
        data: {
          systemFields: DEFAULT_SYSTEM_FIELDS,
          systemFieldKeys,
          count: DEFAULT_SYSTEM_FIELDS.length,
          message: 'These fields are protected and cannot be deleted'
        },
      });
    } catch (error) {
      logger.error('Error getting system fields:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  };
}