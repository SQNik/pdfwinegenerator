import fs from 'fs/promises';
import path from 'path';
import {
  Wine,
  Collection,
  CollectionField,
  CollectionCreate,
  CollectionUpdate,
  PDFTemplate,
  PDFProductLayout,
  PDFGenerationJob,
  FieldConfig,
  HTMLTemplate,
  HTMLTemplateCreate,
  HTMLTemplateUpdate,
  TemplateCategory,
  CustomPDFFormat,
  CustomPDFFormatCreate,
  CustomPDFFormatUpdate
} from '../types';
import logger from '../utils/logger';export class DataStore {
  private wines: Map<string, Wine> = new Map();
  private collections: Map<string, Collection> = new Map();
  private collectionFields: Map<string, CollectionField> = new Map();
  private pdfTemplates: Map<string, PDFTemplate> = new Map();
  private pdfProductLayouts: Map<string, PDFProductLayout> = new Map();
  private pdfGenerationJobs: Map<string, PDFGenerationJob> = new Map();
  private fieldsConfig: FieldConfig[] = [];
  private htmlTemplates: Map<string, HTMLTemplate> = new Map();
  private templateCategories: Map<string, TemplateCategory> = new Map();
  private customFormats: Map<string, CustomPDFFormat> = new Map();
  private dataDir: string;
  private saveQueue: Promise<void> = Promise.resolve(); // Queue for sequential saves

  constructor(dataDir = 'data') {
    this.dataDir = dataDir;
  }

  async initialize(): Promise<void> {
    try {
      await this.ensureDataDirectory();
      await this.loadWines();
      await this.loadCollections();
      await this.loadCollectionFields();
      await this.loadFieldsConfig();
      await this.loadHTMLTemplates();
      await this.loadTemplateCategories();
      await this.loadCustomFormats();
      logger.info('DataStore initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize DataStore:', error);
      throw error;
    }
  }

  private async ensureDataDirectory(): Promise<void> {
    try {
      await fs.access(this.dataDir);
    } catch {
      await fs.mkdir(this.dataDir, { recursive: true });
    }
  }

  private async loadWines(): Promise<void> {
    const winesPath = path.join(this.dataDir, 'wines.json');
    try {
      const data = await fs.readFile(winesPath, 'utf-8');
      const wines: Wine[] = JSON.parse(data);
      this.wines.clear();
      wines.forEach(wine => this.wines.set(wine.id, wine));
      logger.info(`Loaded ${wines.length} wines`);
    } catch (error) {
      logger.warn('No wines file found, starting with empty collection');
      await this.saveWines();
    }
  }

  private async loadFieldsConfig(): Promise<void> {
    const fieldsPath = path.join(this.dataDir, 'fields-config.json');
    try {
      const data = await fs.readFile(fieldsPath, 'utf-8');
      this.fieldsConfig = JSON.parse(data);
      logger.info(`Loaded fields configuration with ${this.fieldsConfig.length} fields`);
    } catch (error) {
      logger.warn('No fields configuration file found, starting with default configuration');
      this.fieldsConfig = []; // Will be loaded from default config
    }
  }

  private async saveFieldsConfig(): Promise<void> {
    const fieldsPath = path.join(this.dataDir, 'fields-config.json');
    await fs.writeFile(fieldsPath, JSON.stringify(this.fieldsConfig, null, 2));
  }

  private async saveWines(): Promise<void> {
    const winesPath = path.join(this.dataDir, 'wines.json');
    const wines = Array.from(this.wines.values());
    await fs.writeFile(winesPath, JSON.stringify(wines, null, 2));
  }

  // Wine operations
  getWines(): Wine[] {
    return Array.from(this.wines.values());
  }

  getWine(id: string): Wine | undefined {
    return this.wines.get(id);
  }

  getWinesByIds(ids: string[]): Wine[] {
    return ids.map(id => this.wines.get(id)).filter((wine): wine is Wine => wine !== undefined);
  }

  /**
   * 🏷️ Find wine by catalog number (business identifier)
   */
  getWineByCatalogNumber(catalogNumber: string): Wine | undefined {
    return Array.from(this.wines.values()).find(wine => wine.catalogNumber === catalogNumber);
  }

  /**
   * 🏷️ Get wines by catalog numbers (business identifiers)
   */
  getWinesByCatalogNumbers(catalogNumbers: string[]): Wine[] {
    return catalogNumbers
      .map(catalogNumber => this.getWineByCatalogNumber(catalogNumber))
      .filter((wine): wine is Wine => wine !== undefined);
  }

  async addWine(wine: Wine): Promise<void> {
    this.wines.set(wine.id, wine);
    await this.saveWines();
  }

  /**
   * Create a new wine with auto-generated ID
   */
  async createWine(wine: Omit<Wine, 'id' | 'createdAt' | 'updatedAt'>): Promise<Wine> {
    // 🏷️ WALIDACJA UNIKALNOŚCI catalogNumber (biznesowy identyfikator)
    if (wine.catalogNumber) {
      const existingWine = this.getWineByCatalogNumber(wine.catalogNumber);
      if (existingWine) {
        throw new Error(`Wine with catalog number "${wine.catalogNumber}" already exists`);
      }
    }
    
    // Normalize and standardize the wine data
    const normalizedWine = this.normalizeWineData(wine);
    
    const newWine: Wine = {
      ...normalizedWine,
      id: crypto.randomUUID(), // 🔧 Techniczny identyfikator systemowy
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    this.wines.set(newWine.id, newWine);
    await this.saveWines();
    return newWine;
  }

  /**
   * Normalize wine data to ensure consistent structure
   */
  private normalizeWineData(wine: any): any {
    const normalized = { ...wine };
    
    // Auto-generate image URL if catalogNumber exists but image is empty
    if (normalized.catalogNumber && !normalized.image) {
      normalized.image = `/images/${normalized.catalogNumber}.jpg`;
    }
    
    // Ensure all string fields are strings, not null/undefined
    const stringFields = ['name', 'region', 'type', 'description', 'image', 'szczepy', 'category', 'alcohol'];
    stringFields.forEach(field => {
      if (normalized[field] === null || normalized[field] === undefined) {
        normalized[field] = '';
      }
    });
    
    // Standardize alcohol format
    if (normalized.alcohol && !normalized.alcohol.includes('%') && normalized.alcohol.trim() !== '') {
      normalized.alcohol = `${normalized.alcohol}%`;
    }
    
    return normalized;
  }

  async updateWine(id: string, wine: Partial<Wine>): Promise<Wine | null> {
    const existing = this.wines.get(id);
    if (!existing) return null;
    
    // 🏷️ WALIDACJA UNIKALNOŚCI catalogNumber (jeśli jest aktualizowany)
    if (wine.catalogNumber && wine.catalogNumber !== existing.catalogNumber) {
      const existingWine = this.getWineByCatalogNumber(wine.catalogNumber);
      if (existingWine && existingWine.id !== id) {
        throw new Error(`Wine with catalog number "${wine.catalogNumber}" already exists`);
      }
    }
    
    // Create update object without normalization to preserve existing values
    const updateData = { ...wine };
    
    // Only normalize fields that are actually being updated
    if (updateData.catalogNumber && !updateData.image) {
      updateData.image = `/images/${updateData.catalogNumber}.jpg`;
    }
    
    // Standardize alcohol format if being updated
    if (updateData.alcohol && !updateData.alcohol.includes('%') && updateData.alcohol.trim() !== '') {
      updateData.alcohol = `${updateData.alcohol}%`;
    }
    
    const updated = { ...existing, ...updateData, updatedAt: new Date().toISOString() };
    this.wines.set(id, updated);
    await this.saveWines();
    return updated;
  }

  async deleteWine(id: string): Promise<boolean> {
    const deleted = this.wines.delete(id);
    if (deleted) {
      await this.saveWines();
    }
    return deleted;
  }

  /**
   * Clear all wines from the database
   */
  async clearAllWines(): Promise<void> {
    this.wines.clear();
    await this.saveWines();
  }

  /**
   * Check if wine exists by ID
   */
  wineExists(id: string): boolean {
    return this.wines.has(id);
  }

  // Fields configuration operations
  getFieldsConfig(): FieldConfig[] {
    return [...this.fieldsConfig];
  }

  async setFieldsConfig(config: FieldConfig[]): Promise<void> {
    this.fieldsConfig = [...config];
    await this.saveFieldsConfig();
  }

  async updateFieldsConfig(config: FieldConfig[]): Promise<FieldConfig[]> {
    this.fieldsConfig = [...config];
    await this.saveFieldsConfig();
    return this.getFieldsConfig();
  }

  // Collections operations
  private async loadCollections(): Promise<void> {
    try {
      const filePath = path.join(this.dataDir, 'collections.json');
      const data = await fs.readFile(filePath, 'utf-8');
      const collections: Collection[] = JSON.parse(data);
      
      this.collections.clear();
      collections.forEach(collection => {
        this.collections.set(collection.id, collection);
      });
      
      logger.info(`Loaded ${collections.length} collections`);
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        logger.info('Collections file not found, starting with empty collections');
        await this.saveCollections();
      } else {
        logger.error('Error loading collections:', error);
        throw error;
      }
    }
  }

  private async saveCollections(): Promise<void> {
    try {
      const filePath = path.join(this.dataDir, 'collections.json');
      const collections = Array.from(this.collections.values());
      await fs.writeFile(filePath, JSON.stringify(collections, null, 2));
    } catch (error) {
      logger.error('Error saving collections:', error);
      throw error;
    }
  }

  private async loadCollectionFields(): Promise<void> {
    try {
      const filePath = path.join(this.dataDir, 'collection-fields-config.json');
      const data = await fs.readFile(filePath, 'utf-8');
      const fields: CollectionField[] = JSON.parse(data);
      
      this.collectionFields.clear();
      fields.forEach(field => {
        this.collectionFields.set(field.id, field);
      });
      
      logger.info(`Loaded collection fields configuration with ${fields.length} fields`);
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        logger.info('Collection fields config file not found, starting with empty configuration');
        await this.saveCollectionFields();
      } else {
        logger.error('Error loading collection fields config:', error);
        throw error;
      }
    }
  }

  private async saveCollectionFields(): Promise<void> {
    try {
      const filePath = path.join(this.dataDir, 'collection-fields-config.json');
      const fields = Array.from(this.collectionFields.values());
      await fs.writeFile(filePath, JSON.stringify(fields, null, 2));
    } catch (error) {
      logger.error('Error saving collection fields config:', error);
      throw error;
    }
  }

  getCollections(): Collection[] {
    return Array.from(this.collections.values());
  }

  getCollection(id: string): Collection | undefined {
    return this.collections.get(id);
  }

  async createCollection(data: CollectionCreate): Promise<Collection> {
    const now = new Date().toISOString();
    const id = `collection_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const collection: Collection = {
      id,
      name: data.name,
      description: data.description || '',
      wines: data.wines || [],
      tags: data.tags || [],
      status: data.status || 'active',
      coverImage: data.coverImage || '', // ✅ FIX: Include coverImage from wizard (empty string if undefined)
      dynamicFields: data.dynamicFields || {},
      metadata: data.metadata || {},
      createdAt: now,
      updatedAt: now
    };

    this.collections.set(id, collection);
    await this.saveCollections();
    
    return collection;
  }

  async updateCollection(id: string, data: CollectionUpdate): Promise<Collection | null> {
    const collection = this.collections.get(id);
    if (!collection) {
      return null;
    }

    const updatedCollection: Collection = {
      ...collection,
      ...data,
      id: collection.id, // Preserve original ID
      createdAt: collection.createdAt, // Preserve creation date
      updatedAt: new Date().toISOString()
    };

    this.collections.set(id, updatedCollection);
    await this.saveCollections();
    
    return updatedCollection;
  }

  async deleteCollection(id: string): Promise<boolean> {
    const deleted = this.collections.delete(id);
    if (deleted) {
      await this.saveCollections();
    }
    return deleted;
  }

  collectionExists(id: string): boolean {
    return this.collections.has(id);
  }

  async addWineToCollection(collectionId: string, wineId: string): Promise<boolean> {
    const collection = this.collections.get(collectionId);
    if (!collection || !this.wines.has(wineId)) {
      return false;
    }

    if (!collection.wines.includes(wineId)) {
      collection.wines.push(wineId);
      collection.updatedAt = new Date().toISOString();
      this.collections.set(collectionId, collection);
      await this.saveCollections();
    }
    
    return true;
  }

  async removeWineFromCollection(collectionId: string, wineId: string): Promise<boolean> {
    const collection = this.collections.get(collectionId);
    if (!collection) {
      return false;
    }

    const index = collection.wines.indexOf(wineId);
    if (index > -1) {
      collection.wines.splice(index, 1);
      collection.updatedAt = new Date().toISOString();
      this.collections.set(collectionId, collection);
      await this.saveCollections();
      return true;
    }
    
    return false;
  }

  // Collection fields configuration operations
  getCollectionFields(): CollectionField[] {
    return Array.from(this.collectionFields.values());
  }

  getCollectionField(id: string): CollectionField | undefined {
    return this.collectionFields.get(id);
  }

  async createCollectionField(data: CollectionField | Omit<CollectionField, 'createdAt' | 'updatedAt'>): Promise<CollectionField> {
    const now = new Date().toISOString();
    
    const field: CollectionField = {
      id: 'id' in data ? data.id : `field_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: data.name,
      type: data.type,
      required: data.required || false,
      defaultValue: data.defaultValue,
      ...(data.options && { options: data.options }),
      ...(data.validation && { validation: data.validation }),
      createdAt: 'createdAt' in data ? data.createdAt : now,
      updatedAt: 'updatedAt' in data ? data.updatedAt : now
    };

    this.collectionFields.set(field.id, field);
    await this.saveCollectionFields();
    
    return field;
  }

  async updateCollectionField(id: string, data: Partial<Omit<CollectionField, 'id' | 'createdAt' | 'updatedAt'>>): Promise<CollectionField | null> {
    const field = this.collectionFields.get(id);
    if (!field) {
      return null;
    }

    const updatedField: CollectionField = {
      ...field,
      ...data,
      id: field.id,
      createdAt: field.createdAt,
      updatedAt: new Date().toISOString()
    };

    this.collectionFields.set(id, updatedField);
    await this.saveCollectionFields();
    
    return updatedField;
  }

  async deleteCollectionField(id: string): Promise<boolean> {
    const deleted = this.collectionFields.delete(id);
    if (deleted) {
      await this.saveCollectionFields();
    }
    return deleted;
  }

  // Alias for getCollectionField for compatibility
  getCollectionFieldById(id: string): CollectionField | undefined {
    return this.getCollectionField(id);
  }

  // Update fields order with display order
  async updateCollectionFieldsOrder(fieldIds: string[]): Promise<void> {
    const fields = this.getCollectionFields();
    
    fieldIds.forEach((fieldId, index) => {
      const field = this.collectionFields.get(fieldId);
      if (field) {
        const updatedField = {
          ...field,
          displayOrder: index + 1,
          updatedAt: new Date().toISOString()
        } as CollectionField & { displayOrder: number };
        
        this.collectionFields.set(fieldId, updatedField);
      }
    });

    await this.saveCollectionFields();
  }

  // HTML Templates operations
  private async loadHTMLTemplates(): Promise<void> {
    try {
      const filePath = path.join(this.dataDir, 'html-templates.json');
      const data = await fs.readFile(filePath, 'utf-8');
      const templates: HTMLTemplate[] = JSON.parse(data);
      
      this.htmlTemplates.clear();
      templates.forEach(template => {
        this.htmlTemplates.set(template.id, template);
      });
      
      logger.info(`Loaded ${this.htmlTemplates.size} HTML templates`);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        logger.info('HTML templates file not found, starting with empty collection');
        await this.saveHTMLTemplates();
      } else {
        logger.error('Error loading HTML templates:', error);
        throw error;
      }
    }
  }

  private async saveHTMLTemplates(): Promise<void> {
    // Queue saves to prevent concurrent file access
    this.saveQueue = this.saveQueue.then(async () => {
      const maxRetries = 3;
      let attempt = 0;
      
      while (attempt < maxRetries) {
        try {
          const filePath = path.join(this.dataDir, 'html-templates.json');
          const templates = Array.from(this.htmlTemplates.values());
          
          // Write to temporary file first
          const tempPath = path.join(this.dataDir, 'html-templates.json.tmp');
          await fs.writeFile(tempPath, JSON.stringify(templates, null, 2), 'utf-8');
          
          // Atomic rename (much safer than direct write)
          await fs.rename(tempPath, filePath);
          
          // Create backup after successful write
          const backupPath = path.join(this.dataDir, 'html-templates.json.backup');
          try {
            await fs.copyFile(filePath, backupPath);
          } catch (backupError) {
            logger.warn('Failed to create backup, but main save succeeded:', backupError);
          }
          
          logger.info('HTML templates saved successfully');
          return; // Success, exit retry loop
          
        } catch (error) {
          attempt++;
          logger.warn(`Error saving HTML templates (attempt ${attempt}/${maxRetries}):`, error);
          
          if (attempt >= maxRetries) {
            logger.error('Failed to save HTML templates after all retries:', error);
            throw error;
          }
          
          // Wait before retry (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, 100 * attempt));
        }
      }
    });
    
    return this.saveQueue;
  }

  getHTMLTemplates(): HTMLTemplate[] {
    return Array.from(this.htmlTemplates.values());
  }

  getHTMLTemplate(id: string): HTMLTemplate | undefined {
    return this.htmlTemplates.get(id);
  }

  async createHTMLTemplate(template: HTMLTemplate): Promise<HTMLTemplate> {
    this.htmlTemplates.set(template.id, template);
    await this.saveHTMLTemplates();
    return template;
  }

  async updateHTMLTemplate(id: string, updateData: Partial<HTMLTemplate>): Promise<HTMLTemplate | undefined> {
    const existingTemplate = this.htmlTemplates.get(id);
    if (!existingTemplate) {
      return undefined;
    }

    const updatedTemplate = {
      ...existingTemplate,
      ...updateData,
      id, // Ensure ID doesn't change
      updatedAt: new Date().toISOString()
    };

    this.htmlTemplates.set(id, updatedTemplate);
    await this.saveHTMLTemplates();
    return updatedTemplate;
  }

  async deleteHTMLTemplate(id: string): Promise<boolean> {
    const deleted = this.htmlTemplates.delete(id);
    if (deleted) {
      await this.saveHTMLTemplates();
    }
    return deleted;
  }

  // Template Categories operations
  private async loadTemplateCategories(): Promise<void> {
    try {
      const filePath = path.join(this.dataDir, 'template-categories.json');
      const data = await fs.readFile(filePath, 'utf-8');
      const categories: TemplateCategory[] = JSON.parse(data);
      
      this.templateCategories.clear();
      categories.forEach(category => {
        this.templateCategories.set(category.id, category);
      });
      
      logger.info(`Loaded ${this.templateCategories.size} template categories`);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        logger.info('Template categories file not found, initializing with defaults');
        await this.initializeDefaultCategories();
      } else {
        logger.error('Error loading template categories:', error);
        throw error;
      }
    }
  }

  private async saveTemplateCategories(): Promise<void> {
    try {
      const filePath = path.join(this.dataDir, 'template-categories.json');
      const categories = Array.from(this.templateCategories.values());
      await fs.writeFile(filePath, JSON.stringify(categories, null, 2), 'utf-8');
    } catch (error) {
      logger.error('Error saving template categories:', error);
      throw error;
    }
  }

  private async initializeDefaultCategories(): Promise<void> {
    const defaultCategories: TemplateCategory[] = [
      {
        id: 'wine-cards',
        name: 'Karty win',
        description: 'Pojedyncze karty z danymi win',
        icon: 'wine-glass',
        color: '#8B0000',
        displayOrder: 1,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'labels',
        name: 'Etykiety',
        description: 'Etykiety dla butelek i opakowań',
        icon: 'tag',
        color: '#228B22',
        displayOrder: 2,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'catalogs',
        name: 'Katalogi',
        description: 'Katalogi i broszury z winami',
        icon: 'book',
        color: '#4169E1',
        displayOrder: 3,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'invoices',
        name: 'Faktury',
        description: 'Faktury i dokumenty sprzedaży',
        icon: 'file-text',
        color: '#FF8C00',
        displayOrder: 4,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'general',
        name: 'Ogólne',
        description: 'Ogólne szablony dokumentów',
        icon: 'file',
        color: '#708090',
        displayOrder: 5,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    defaultCategories.forEach(category => {
      this.templateCategories.set(category.id, category);
    });

    await this.saveTemplateCategories();
    logger.info('Initialized default template categories');
  }

  getTemplateCategories(): TemplateCategory[] {
    return Array.from(this.templateCategories.values())
      .sort((a, b) => a.displayOrder - b.displayOrder);
  }

  getTemplateCategory(id: string): TemplateCategory | undefined {
    return this.templateCategories.get(id);
  }

  // Custom PDF Formats Management
  private async loadCustomFormats(): Promise<void> {
    try {
      const filePath = path.join(this.dataDir, 'custom-pdf-formats.json');
      
      try {
        const data = await fs.readFile(filePath, 'utf-8');
        const parsedData = JSON.parse(data);
        this.customFormats.clear();
        
        if (Array.isArray(parsedData)) {
          parsedData.forEach((format: CustomPDFFormat) => {
            this.customFormats.set(format.id, format);
          });
        }
        
        console.log(`Loaded ${this.customFormats.size} custom PDF formats`);
      } catch (fileError: any) {
        if (fileError.code === 'ENOENT') {
          console.log('No custom PDF formats file found, starting with empty collection');
        } else {
          throw fileError;
        }
      }
    } catch (error) {
      console.error('Error loading custom PDF formats:', error);
      this.customFormats.clear();
    }
  }

  private async saveCustomFormats(): Promise<void> {
    try {
      const filePath = path.join(this.dataDir, 'custom-pdf-formats.json');
      const formats = Array.from(this.customFormats.values());
      
      // Create backup if file exists
      try {
        await fs.access(filePath);
        await fs.copyFile(filePath, `${filePath}.backup`);
      } catch (error: any) {
        if (error.code !== 'ENOENT') {
          console.warn('Could not create backup for custom formats:', error.message);
        }
      }
      
      await fs.writeFile(filePath, JSON.stringify(formats, null, 2));
      console.log(`Saved ${formats.length} custom PDF formats`);
    } catch (error) {
      console.error('Error saving custom PDF formats:', error);
      throw error;
    }
  }

  async createCustomFormat(formatData: CustomPDFFormatCreate): Promise<CustomPDFFormat> {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    
    const customFormat: CustomPDFFormat = {
      id,
      ...formatData,
      createdAt: now,
      updatedAt: now
    };

    this.customFormats.set(id, customFormat);
    await this.saveCustomFormats();
    
    return customFormat;
  }

  async updateCustomFormat(id: string, updates: CustomPDFFormatUpdate): Promise<CustomPDFFormat> {
    const existingFormat = this.customFormats.get(id);
    if (!existingFormat) {
      throw new Error(`Custom PDF format with ID ${id} not found`);
    }

    // Handle margins update carefully - merge with existing margins if partial update
    const updatedMargins = updates.margins ? {
      ...existingFormat.margins,
      ...updates.margins
    } : existingFormat.margins;

    const updatedFormat: CustomPDFFormat = {
      ...existingFormat,
      ...updates,
      margins: updatedMargins,
      id, // Ensure ID cannot be changed
      updatedAt: new Date().toISOString()
    };

    this.customFormats.set(id, updatedFormat);
    await this.saveCustomFormats();
    
    return updatedFormat;
  }

  async deleteCustomFormat(id: string): Promise<boolean> {
    const deleted = this.customFormats.delete(id);
    if (deleted) {
      await this.saveCustomFormats();
    }
    return deleted;
  }

  getCustomFormats(): CustomPDFFormat[] {
    return Array.from(this.customFormats.values())
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  getCustomFormat(id: string): CustomPDFFormat | undefined {
    return this.customFormats.get(id);
  }

  async getCustomFormatByName(name: string): Promise<CustomPDFFormat | undefined> {
    return Array.from(this.customFormats.values())
      .find(format => format.name.toLowerCase() === name.toLowerCase());
  }
}