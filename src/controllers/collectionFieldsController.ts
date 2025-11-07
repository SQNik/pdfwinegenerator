import { Request, Response, NextFunction } from 'express';
import { DataStore } from '../services/dataStore';
import { 
  collectionFieldCreateSchema, 
  collectionFieldUpdateSchema 
} from '../validators/schemas';
import { CollectionField, ApiResponse, ValidationError } from '../types';
import logger from '../utils/logger';

/**
 * CollectionFieldsController - Dedykowany kontroler do zarządzania polami dynamicznymi kolekcji
 * 
 * Funkcjonalności:
 * - CRUD operacje na polach kolekcji 
 * - Walidacja i sanityzacja danych
 * - Zarządzanie kolejnością pól
 * - Obsługa aktywacji/deaktywacji pól
 * - Logowanie zmian dla audytu
 */
export class CollectionFieldsController {
  constructor(private dataStore: DataStore) {}

  /**
   * Pobiera konfigurację wszystkich pól kolekcji
   */
  getCollectionFieldsConfig = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const fields = this.dataStore.getCollectionFields();
      
      // Sortuj pola według kolejności wyświetlania
      const sortedFields = fields.sort((a, b) => {
        const orderA = (a as any).displayOrder || 999;
        const orderB = (b as any).displayOrder || 999;
        return orderA - orderB;
      });

      const response: ApiResponse<CollectionField[]> = {
        success: true,
        data: sortedFields
      };

      logger.info('Collection fields config retrieved', { 
        service: 'collection-fields', 
        count: fields.length 
      });

      res.json(response);
    } catch (error) {
      logger.error('Error retrieving collection fields config', { 
        service: 'collection-fields', 
        error: error instanceof Error ? error.message : error 
      });
      next(error);
    }
  };

  /**
   * Pobiera konkretne pole kolekcji
   */
  getCollectionField = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { fieldId } = req.params;
      
      if (!fieldId) {
        res.status(400).json({
          success: false,
          error: 'Field ID is required'
        });
        return;
      }

      const field = this.dataStore.getCollectionFieldById(fieldId);
      
      if (!field) {
        res.status(404).json({
          success: false,
          error: 'Collection field not found'
        });
        return;
      }

      const response: ApiResponse<CollectionField> = {
        success: true,
        data: field
      };

      res.json(response);
    } catch (error) {
      logger.error('Error retrieving collection field', { 
        service: 'collection-fields', 
        fieldId: req.params.fieldId,
        error: error instanceof Error ? error.message : error 
      });
      next(error);
    }
  };

  /**
   * Tworzy nowe pole kolekcji
   */
  createCollectionField = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Walidacja danych wejściowych
      const { error, value: validatedData } = collectionFieldCreateSchema.validate(req.body, {
        abortEarly: false,
        stripUnknown: true
      });

      if (error) {
        const validationErrors: ValidationError[] = error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message,
          value: detail.context?.value
        }));

        res.status(400).json({
          success: false,
          error: 'Validation failed',
          validationErrors
        });
        return;
      }

      // Sprawdź, czy pole o tej nazwie już nie istnieje
      const existingFields = this.dataStore.getCollectionFields();
      const duplicateNameField = existingFields.find(f => 
        f.name.toLowerCase() === validatedData.name.toLowerCase()
      );
      
      if (duplicateNameField) {
        res.status(409).json({
          success: false,
          error: 'Field with this name already exists'
        });
        return;
      }

      // Sprawdź, czy pole o tym ID już nie istnieje
      const duplicateIdField = existingFields.find(f => f.id === validatedData.id);
      if (duplicateIdField) {
        res.status(409).json({
          success: false,
          error: 'Field with this ID already exists'
        });
        return;
      }

      // Utwórz nowe pole
      const newField: CollectionField = {
        ...validatedData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const created = await this.dataStore.createCollectionField(newField);

      const response: ApiResponse<CollectionField> = {
        success: true,
        data: created
      };

      logger.info('Collection field created', { 
        service: 'collection-fields', 
        fieldId: created.id,
        fieldName: created.name,
        fieldType: created.type
      });

      res.status(201).json(response);
    } catch (error) {
      logger.error('Error creating collection field', { 
        service: 'collection-fields', 
        error: error instanceof Error ? error.message : error 
      });
      next(error);
    }
  };

  /**
   * Aktualizuje istniejące pole kolekcji
   */
  updateCollectionField = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { fieldId } = req.params;
      
      if (!fieldId) {
        res.status(400).json({
          success: false,
          error: 'Field ID is required'
        });
        return;
      }

      // Sprawdź, czy pole istnieje
      const existingField = this.dataStore.getCollectionFieldById(fieldId);
      if (!existingField) {
        res.status(404).json({
          success: false,
          error: 'Collection field not found'
        });
        return;
      }

      // Walidacja danych wejściowych
      const { error, value: validatedData } = collectionFieldUpdateSchema.validate(req.body, {
        abortEarly: false,
        stripUnknown: true
      });

      if (error) {
        const validationErrors: ValidationError[] = error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message,
          value: detail.context?.value
        }));

        res.status(400).json({
          success: false,
          error: 'Validation failed',
          validationErrors
        });
        return;
      }

      // Sprawdź duplikaty nazw (z wyjątkiem aktualnie edytowanego pola)
      if (validatedData.name) {
        const existingFields = this.dataStore.getCollectionFields();
        const duplicateNameField = existingFields.find(f => 
          f.id !== fieldId && f.name.toLowerCase() === validatedData.name.toLowerCase()
        );
        
        if (duplicateNameField) {
          res.status(409).json({
            success: false,
            error: 'Field with this name already exists'
          });
          return;
        }
      }

      // Przygotuj zaktualizowane dane
      const updatedField: CollectionField = {
        ...existingField,
        ...validatedData,
        updatedAt: new Date().toISOString()
      };

      const result = await this.dataStore.updateCollectionField(fieldId, updatedField);

      if (!result) {
        res.status(500).json({
          success: false,
          error: 'Failed to update collection field'
        });
        return;
      }

      const response: ApiResponse<CollectionField> = {
        success: true,
        data: result
      };

      logger.info('Collection field updated', { 
        service: 'collection-fields', 
        fieldId,
        changes: Object.keys(validatedData)
      });

      res.json(response);
    } catch (error) {
      logger.error('Error updating collection field', { 
        service: 'collection-fields', 
        fieldId: req.params.fieldId,
        error: error instanceof Error ? error.message : error 
      });
      next(error);
    }
  };

  /**
   * Usuwa pole kolekcji
   * Uwaga: Nie usuwa danych z istniejących kolekcji, tylko ukrywa pole w UI
   */
  deleteCollectionField = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { fieldId } = req.params;
      
      if (!fieldId) {
        res.status(400).json({
          success: false,
          error: 'Field ID is required'
        });
        return;
      }

      // Sprawdź, czy pole istnieje
      const existingField = this.dataStore.getCollectionFieldById(fieldId);
      if (!existingField) {
        res.status(404).json({
          success: false,
          error: 'Collection field not found'
        });
        return;
      }

      // Sprawdź, czy pole nie jest polem systemowym
      if ((existingField as any).isSystemField) {
        res.status(403).json({
          success: false,
          error: 'Cannot delete system field'
        });
        return;
      }

      await this.dataStore.deleteCollectionField(fieldId);

      const response: ApiResponse<{ id: string }> = {
        success: true,
        data: { id: fieldId }
      };

      logger.info('Collection field deleted', { 
        service: 'collection-fields', 
        fieldId,
        fieldName: existingField.name
      });

      res.json(response);
    } catch (error) {
      logger.error('Error deleting collection field', { 
        service: 'collection-fields', 
        fieldId: req.params.fieldId,
        error: error instanceof Error ? error.message : error 
      });
      next(error);
    }
  };

  /**
   * Aktualizuje kolejność wyświetlania pól
   */
  updateFieldsOrder = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { fieldIds } = req.body;
      
      if (!Array.isArray(fieldIds)) {
        res.status(400).json({
          success: false,
          error: 'fieldIds must be an array'
        });
        return;
      }

      // Sprawdź, czy wszystkie pola istnieją
      const existingFields = this.dataStore.getCollectionFields();
      const existingFieldIds = existingFields.map(f => f.id);
      
      const invalidIds = fieldIds.filter(id => !existingFieldIds.includes(id));
      if (invalidIds.length > 0) {
        res.status(400).json({
          success: false,
          error: `Invalid field IDs: ${invalidIds.join(', ')}`
        });
        return;
      }

      // Aktualizuj kolejność
      await this.dataStore.updateCollectionFieldsOrder(fieldIds);

      const response: ApiResponse<{ success: boolean }> = {
        success: true,
        data: { success: true }
      };

      logger.info('Collection fields order updated', { 
        service: 'collection-fields', 
        fieldCount: fieldIds.length
      });

      res.json(response);
    } catch (error) {
      logger.error('Error updating collection fields order', { 
        service: 'collection-fields', 
        error: error instanceof Error ? error.message : error 
      });
      next(error);
    }
  };

  /**
   * Pobiera statystyki użycia pól w kolekcjach
   */
  getFieldsUsageStats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const fields = this.dataStore.getCollectionFields();
      const collections = this.dataStore.getCollections();
      
      const stats = fields.map(field => {
        const usageCount = collections.filter(collection => 
          collection.dynamicFields && 
          Object.prototype.hasOwnProperty.call(collection.dynamicFields, field.id) &&
          collection.dynamicFields[field.id] !== null &&
          collection.dynamicFields[field.id] !== undefined &&
          collection.dynamicFields[field.id] !== ''
        ).length;

        return {
          fieldId: field.id,
          fieldName: field.name,
          fieldType: field.type,
          usageCount,
          usagePercentage: collections.length > 0 ? Math.round((usageCount / collections.length) * 100) : 0
        };
      });

      const response: ApiResponse<typeof stats> = {
        success: true,
        data: stats
      };

      res.json(response);
    } catch (error) {
      logger.error('Error retrieving fields usage stats', { 
        service: 'collection-fields', 
        error: error instanceof Error ? error.message : error 
      });
      next(error);
    }
  };
}