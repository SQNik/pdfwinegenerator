/**
 * CollectionDataBuilder - Unified Collection Data Preparation Service
 * 
 * This service ensures that collection data is prepared EXACTLY THE SAME WAY
 * for all PDF generation scenarios:
 * - Template Editor Preview
 * - Collection Preview
 * - Final PDF Generation
 * 
 * SINGLE SOURCE OF TRUTH for collection data structure
 */

import { DataStore } from './dataStore';
import { Collection, Wine, CollectionField } from '../types';
import logger from '../utils/logger';

export interface PreparedCollectionData {
  id: string;
  name: string;
  description: string;
  wines: Wine[];
  winesList: Wine[];
  totalWines: number;
  customTitle?: string;
  dynamicFields: { [key: string]: any };
  dynamicFieldsByName: { [key: string]: any };
  // Additional metadata
  createdAt?: string;
  updatedAt?: string;
  tags?: string[];
  status?: string;
  pdfBackground?: string;
  wineCount?: number;
}

export class CollectionDataBuilder {
  constructor(private dataStore: DataStore) {}

  /**
   * Prepare collection data with all dynamic fields properly mapped
   * This is THE SINGLE SOURCE OF TRUTH for collection data preparation
   * 
   * @param collectionId - Collection ID
   * @param customTitle - Optional custom title to override collection name
   * @returns Prepared collection data with dynamicFieldsByName
   */
  async prepareCollectionData(
    collectionId: string,
    customTitle?: string
  ): Promise<PreparedCollectionData> {
    logger.info('🔧 CollectionDataBuilder: Preparing collection data', { collectionId });

    // 1. Get collection
    const collection = this.dataStore.getCollection(collectionId);
    if (!collection) {
      throw new Error(`Collection not found: ${collectionId}`);
    }

    // 2. Get wines for this collection
    const wines = this.dataStore.getWinesByCatalogNumbers(collection.wines || []);
    logger.info(`🔧 CollectionDataBuilder: Loaded ${wines.length} wines`);

    // 3. Get collection field definitions
    const collectionFields = this.dataStore.getCollectionFields();
    logger.info(`🔧 CollectionDataBuilder: Loaded ${collectionFields.length} collection field definitions`);

    // 4. Create field name-to-ID mapping
    const fieldNameToId: { [key: string]: string } = {};
    collectionFields.forEach(field => {
      fieldNameToId[field.name.toLowerCase()] = field.id;
    });

    // 5. Create dynamicFieldsByName object for template access
    const dynamicFieldsByName: { [key: string]: any } = {};
    if (collection.dynamicFields) {
      Object.entries(collection.dynamicFields).forEach(([fieldId, value]) => {
        const field = collectionFields.find(f => f.id === fieldId);
        if (field) {
          dynamicFieldsByName[field.name.toLowerCase()] = value;
        }
      });
    }

    logger.info('🔧 CollectionDataBuilder: dynamicFieldsByName created:', dynamicFieldsByName);
    logger.info('🔧 CollectionDataBuilder: Field mappings:', {
      totalFields: collectionFields.length,
      mappedFields: Object.keys(dynamicFieldsByName).length
    });

    // 6. Prepare final collection data structure
    const preparedData: PreparedCollectionData = {
      id: collection.id,
      name: collection.name,
      description: collection.description || '',
      wines: wines,
      winesList: wines, // Alias for backward compatibility
      totalWines: wines.length,
      customTitle: customTitle || collection.name,
      dynamicFields: collection.dynamicFields || {},
      dynamicFieldsByName: dynamicFieldsByName,
      // Additional metadata
      createdAt: collection.createdAt,
      updatedAt: collection.updatedAt,
      tags: collection.tags || [],
      status: collection.status,
      // pdfBackground not available in Collection model - omitted
      wineCount: wines.length
    };

    logger.info('✅ CollectionDataBuilder: Collection data prepared successfully', {
      collectionId: preparedData.id,
      wineCount: preparedData.totalWines,
      dynamicFieldsCount: Object.keys(preparedData.dynamicFields).length,
      dynamicFieldsByNameCount: Object.keys(preparedData.dynamicFieldsByName).length
    });

    return preparedData;
  }

  /**
   * Prepare collection data with formatted dates for display
   * Used in preview contexts where user-friendly dates are needed
   */
  async prepareCollectionDataWithFormattedDates(
    collectionId: string,
    customTitle?: string
  ): Promise<PreparedCollectionData> {
    const data = await this.prepareCollectionData(collectionId, customTitle);
    
    // Format dates for display
    if (data.createdAt) {
      data.createdAt = new Date(data.createdAt).toLocaleDateString('pl-PL');
    }
    if (data.updatedAt) {
      data.updatedAt = new Date(data.updatedAt).toLocaleDateString('pl-PL');
    }

    return data;
  }
}
