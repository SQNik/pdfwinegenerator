import { Request, Response, NextFunction } from 'express';
import { DataStore } from '../services/dataStore';
import { 
  collectionCreateSchema, 
  collectionUpdateSchema
} from '../validators/schemas';
import { Collection, CollectionWithWines, Wine, ApiResponse, ValidationError } from '../types';

export class CollectionController {
  constructor(private dataStore: DataStore) {}

  getCollections = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const collections = this.dataStore.getCollections();
      const includeWines = req.query.includeWines === 'true';
      
      let result: Collection[] | CollectionWithWines[] = collections;
      
      if (includeWines) {
        result = collections.map(collection => ({
          ...collection,
          wines: this.dataStore.getWinesByCatalogNumbers(collection.wines)
        })) as CollectionWithWines[];
      }

      const response: ApiResponse<Collection[] | CollectionWithWines[]> = {
        success: true,
        data: result
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  };

  getCollection = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      
      if (!id) {
        res.status(400).json({
          success: false,
          error: 'Collection ID is required',
        });
        return;
      }

      const collection = this.dataStore.getCollection(id);
      if (!collection) {
        res.status(404).json({
          success: false,
          error: 'Collection not found',
        });
        return;
      }

      const includeWines = req.query.includeWines === 'true';
      let result: Collection | CollectionWithWines = collection;

      if (includeWines) {
        result = {
          ...collection,
          wines: this.dataStore.getWinesByCatalogNumbers(collection.wines)
        } as CollectionWithWines;
      }

      const response: ApiResponse<Collection | CollectionWithWines> = {
        success: true,
        data: result
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  };

  createCollection = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      console.log('🚀 Creating collection - Raw request body:', JSON.stringify(req.body, null, 2));
      
      const { error, value } = collectionCreateSchema.validate(req.body);
      
      if (error) {
        console.log('❌ Validation error:', error.details.map(d => ({ field: d.path.join('.'), message: d.message, value: d.context?.value })));
      } else {
        console.log('✅ Validation passed - Processed data:', JSON.stringify(value, null, 2));
      }
      
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

      // Validate that all wine catalog numbers exist (frontend sends catalogNumbers, not IDs)
      if (value.wines && value.wines.length > 0) {
        const invalidCatalogNumbers = value.wines.filter((catalogNumber: string) => !this.dataStore.getWineByCatalogNumber(catalogNumber));
        if (invalidCatalogNumbers.length > 0) {
          res.status(400).json({
            success: false,
            error: `Invalid wine catalog numbers: ${invalidCatalogNumbers.join(', ')}`
          });
          return;
        }
      }

      const collection = await this.dataStore.createCollection(value);

      const response: ApiResponse<Collection> = {
        success: true,
        data: collection
      };

      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  };

  updateCollection = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      
      if (!id) {
        res.status(400).json({
          success: false,
          error: 'Collection ID is required',
        });
        return;
      }

      const { error, value } = collectionUpdateSchema.validate(req.body);
      
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

      // Validate that all wine catalog numbers exist (frontend sends catalogNumbers, not IDs)
      if (value.wines && value.wines.length > 0) {
        const invalidCatalogNumbers = value.wines.filter((catalogNumber: string) => !this.dataStore.getWineByCatalogNumber(catalogNumber));
        if (invalidCatalogNumbers.length > 0) {
          res.status(400).json({
            success: false,
            error: `Invalid wine catalog numbers: ${invalidCatalogNumbers.join(', ')}`
          });
          return;
        }
      }

      const collection = await this.dataStore.updateCollection(id, value);
      
      if (!collection) {
        res.status(404).json({
          success: false,
          error: 'Collection not found',
        });
        return;
      }

      const response: ApiResponse<Collection> = {
        success: true,
        data: collection
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  };

  deleteCollection = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      
      if (!id) {
        res.status(400).json({
          success: false,
          error: 'Collection ID is required',
        });
        return;
      }

      const deleted = await this.dataStore.deleteCollection(id);
      
      if (!deleted) {
        res.status(404).json({
          success: false,
          error: 'Collection not found',
        });
        return;
      }

      const response: ApiResponse<null> = {
        success: true,
        data: null
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  };

  addWineToCollection = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id, wineId } = req.params;
      
      if (!id || !wineId) {
        res.status(400).json({
          success: false,
          error: 'Collection ID and Wine ID are required',
        });
        return;
      }

      const success = await this.dataStore.addWineToCollection(id, wineId);
      
      if (!success) {
        res.status(400).json({
          success: false,
          error: 'Failed to add wine to collection. Collection or wine may not exist.',
        });
        return;
      }

      const response: ApiResponse<null> = {
        success: true,
        data: null
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  };

  removeWineFromCollection = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id, wineId } = req.params;
      
      if (!id || !wineId) {
        res.status(400).json({
          success: false,
          error: 'Collection ID and Wine ID are required',
        });
        return;
      }

      const success = await this.dataStore.removeWineFromCollection(id, wineId);
      
      if (!success) {
        res.status(404).json({
          success: false,
          error: 'Collection not found or wine not in collection',
        });
        return;
      }

      const response: ApiResponse<null> = {
        success: true,
        data: null
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Export collection with full wine data as JSON
   */
  exportCollectionWithWines = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      
      if (!id) {
        res.status(400).json({
          success: false,
          error: 'Collection ID is required',
        });
        return;
      }

      const collection = this.dataStore.getCollection(id);
      if (!collection) {
        res.status(404).json({
          success: false,
          error: 'Collection not found',
        });
        return;
      }

      // Get full wine data for each wine in the collection
      const fullWines = this.dataStore.getWinesByCatalogNumbers(collection.wines);

      // Create export object with collection data and full wine details
      const exportData = {
        collection: {
          id: collection.id,
          name: collection.name,
          description: collection.description,
          tags: collection.tags,
          status: collection.status,
          dynamicFields: collection.dynamicFields,
          metadata: collection.metadata,
          createdAt: collection.createdAt,
          updatedAt: collection.updatedAt,
          wineCount: fullWines.length
        },
        wines: fullWines,
        exportInfo: {
          exportedAt: new Date().toISOString(),
          totalWines: fullWines.length,
          exportFormat: 'JSON'
        }
      };

      // Set appropriate headers for JSON download
      const filename = `collection-${collection.name.replace(/[^a-zA-Z0-9]/g, '_')}-${Date.now()}.json`;
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      
      res.json(exportData);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get merged collections with full wine data (for API consumption)
   */
  getCollectionsWithFullWineData = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const collections = this.dataStore.getCollections();
      
      // Create merged data structure
      const mergedData = collections.map(collection => ({
        id: collection.id,
        name: collection.name,
        description: collection.description,
        tags: collection.tags,
        status: collection.status,
        dynamicFields: collection.dynamicFields,
        metadata: collection.metadata,
        createdAt: collection.createdAt,
        updatedAt: collection.updatedAt,
        wines: this.dataStore.getWinesByCatalogNumbers(collection.wines),
        wineCount: collection.wines.length
      }));

      const response: ApiResponse<typeof mergedData> = {
        success: true,
        data: mergedData
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  };

}