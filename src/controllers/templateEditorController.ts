import { Request, Response } from 'express';
import { DataStore } from '../services/dataStore';
import { PDFService } from '../services/pdfService';
import { CollectionDataBuilder } from '../services/collectionDataBuilder';
import logger from '../utils/logger';
import {
  HTMLTemplate,
  HTMLTemplateCreate,
  HTMLTemplateUpdate,
  HTMLTemplatePreview,
  TemplateCategory,
  Wine,
  CollectionField
} from '../types';
import { v4 as uuidv4 } from 'uuid';

export class TemplateEditorController {
  private collectionDataBuilder: CollectionDataBuilder;

  constructor(
    private dataStore: DataStore,
    private pdfService: PDFService
  ) {
    this.collectionDataBuilder = new CollectionDataBuilder(dataStore);
  }

  /**
   * Get all HTML templates
   */
  getTemplates = async (req: Request, res: Response): Promise<void> => {
    try {
      const { category, status, search, limit, offset } = req.query;
      
      logger.info('TemplateEditorController: Getting HTML templates', { 
        category, status, search, limit, offset 
      });

      const templates = await this.dataStore.getHTMLTemplates();
      let filteredTemplates = templates;

      // Filter by category
      if (category && typeof category === 'string') {
        filteredTemplates = filteredTemplates.filter((t: HTMLTemplate) => t.category === category);
      }

      // Filter by status
      if (status && typeof status === 'string') {
        filteredTemplates = filteredTemplates.filter((t: HTMLTemplate) => t.status === status);
      }

      // Search filter
      if (search && typeof search === 'string') {
        const searchLower = search.toLowerCase();
        filteredTemplates = filteredTemplates.filter((t: HTMLTemplate) => 
          t.name.toLowerCase().includes(searchLower) ||
          t.description?.toLowerCase().includes(searchLower) ||
          t.tags.some((tag: string) => tag.toLowerCase().includes(searchLower))
        );
      }

      // Pagination
      const limitNum = limit ? parseInt(limit as string, 10) : 50;
      const offsetNum = offset ? parseInt(offset as string, 10) : 0;
      const paginatedTemplates = filteredTemplates.slice(offsetNum, offsetNum + limitNum);

      res.json({
        success: true,
        data: paginatedTemplates,
        pagination: {
          total: filteredTemplates.length,
          limit: limitNum,
          offset: offsetNum,
          hasMore: offsetNum + limitNum < filteredTemplates.length
        }
      });

    } catch (error) {
      logger.error('TemplateEditorController: Error getting templates:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error'
      });
    }
  };

  /**
   * Get specific HTML template
   */
  getTemplate = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      
      if (!id) {
        res.status(400).json({
          success: false,
          error: 'Template ID is required'
        });
        return;
      }

      logger.info(`TemplateEditorController: Getting template ${id}`);

      const template = await this.dataStore.getHTMLTemplate(id);
      
      if (!template) {
        res.status(404).json({
          success: false,
          error: 'Template not found'
        });
        return;
      }

      res.json({
        success: true,
        data: template
      });

    } catch (error) {
      logger.error('TemplateEditorController: Error getting template:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error'
      });
    }
  };

  /**
   * Create new HTML template
   */
  createTemplate = async (req: Request, res: Response): Promise<void> => {
    try {
      const templateData: HTMLTemplateCreate = req.body;
      
      logger.info('TemplateEditorController: Creating HTML template', { 
        name: templateData.name,
        category: templateData.category 
      });

      // Validate required fields
      if (!templateData.name || !templateData.htmlContent) {
        res.status(400).json({
          success: false,
          error: 'Template name and HTML content are required'
        });
        return;
      }

      // Create new template
      const newTemplate: HTMLTemplate = {
        id: uuidv4(),
        name: templateData.name,
        description: templateData.description || '',
        category: templateData.category || 'general',
        htmlContent: templateData.htmlContent,
        cssContent: templateData.cssContent || '',
        jsContent: templateData.jsContent || '',
        thumbnailUrl: templateData.thumbnailUrl || '',
        placeholders: this.extractPlaceholders(templateData.htmlContent),
        sampleData: templateData.sampleData || {},
        isPublic: templateData.isPublic || false,
        tags: templateData.tags || [],
        version: '1.0.0',
        status: templateData.status || 'draft',
        metadata: templateData.metadata || {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const savedTemplate = await this.dataStore.createHTMLTemplate(newTemplate);

      logger.info(`TemplateEditorController: Template created successfully: ${savedTemplate.id}`);

      res.status(201).json({
        success: true,
        data: savedTemplate
      });

    } catch (error) {
      logger.error('TemplateEditorController: Error creating template:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error'
      });
    }
  };

  /**
   * Update HTML template
   */
  updateTemplate = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const updateData: HTMLTemplateUpdate = req.body;
      
      if (!id) {
        res.status(400).json({
          success: false,
          error: 'Template ID is required'
        });
        return;
      }

      logger.info(`TemplateEditorController: Updating template ${id}`);

      // Check if template exists
      const existingTemplate = await this.dataStore.getHTMLTemplate(id);
      if (!existingTemplate) {
        res.status(404).json({
          success: false,
          error: 'Template not found'
        });
        return;
      }

      // Update placeholders if HTML content changed
      if (updateData.htmlContent) {
        updateData.placeholders = this.extractPlaceholders(updateData.htmlContent);
      }

      const updatedTemplate = await this.dataStore.updateHTMLTemplate(id, {
        ...updateData,
        updatedAt: new Date().toISOString()
      });

      logger.info(`TemplateEditorController: Template updated successfully: ${id}`);

      res.json({
        success: true,
        data: updatedTemplate
      });

    } catch (error) {
      logger.error('TemplateEditorController: Error updating template:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error'
      });
    }
  };

  /**
   * Delete HTML template
   */
  deleteTemplate = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      
      if (!id) {
        res.status(400).json({
          success: false,
          error: 'Template ID is required'
        });
        return;
      }

      logger.info(`TemplateEditorController: Deleting template ${id}`);

      const success = await this.dataStore.deleteHTMLTemplate(id);
      
      if (!success) {
        res.status(404).json({
          success: false,
          error: 'Template not found'
        });
        return;
      }

      logger.info(`TemplateEditorController: Template deleted successfully: ${id}`);

      res.json({
        success: true,
        data: { id }
      });

    } catch (error) {
      logger.error('TemplateEditorController: Error deleting template:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error'
      });
    }
  };

  /**
   * Preview HTML template as PDF
   */
  previewTemplate = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const previewData: Omit<HTMLTemplatePreview, 'templateId'> = req.body;
      
      if (!id) {
        res.status(400).json({
          success: false,
          error: 'Template ID is required'
        });
        return;
      }

      logger.info(`TemplateEditorController: Previewing template ${id}`);

      // Get template
      const template = await this.dataStore.getHTMLTemplate(id);
      if (!template) {
        res.status(404).json({
          success: false,
          error: 'Template not found'
        });
        return;
      }

      // Get wine data if specified
      let wineData: Wine | undefined;
      if (previewData.wineData) {
        wineData = previewData.wineData;
      } else {
        // Use sample data from template or get random wine
        const wines = this.dataStore.getWines();
        if (wines.length > 0) {
          wineData = wines[Math.floor(Math.random() * wines.length)];
        }
      }

      // Handle custom format or use standard format
      let pdfOptions: any = {
        printBackground: previewData.options?.printBackground !== false
      };

      const formatValue = previewData.format || 'A4';
      
      logger.info('=== BACKEND PREVIEW DEBUG ===');
      logger.info(`Format value: ${formatValue}`);
      logger.info(`Is custom format: ${formatValue.startsWith('custom:')}`);
      logger.info(`Preview options received:`, previewData.options);
      
      // Check if format is custom format (starts with 'custom:')
      if (formatValue.startsWith('custom:')) {
        const customFormatId = formatValue.replace('custom:', '');
        
        try {
          // Get custom format from dataStore
          const customFormats = await this.dataStore.getCustomFormats();
          const customFormat = customFormats.find(f => f.id === customFormatId);
          
          if (customFormat) {
            pdfOptions.customFormat = customFormat;
            // Only use provided margins if explicitly set, otherwise custom format margins will be used
            if (previewData.options?.margin) {
              logger.warn(`⚠️ MARGIN OVERRIDE: Frontend sent margin, will override custom format margins!`);
              logger.warn(`Custom format margins: ${JSON.stringify(customFormat.margins)}`);
              logger.warn(`Received margins: ${JSON.stringify(previewData.options.margin)}`);
              pdfOptions.margin = previewData.options.margin;
            } else {
              logger.info(`✅ NO margin in request - will use custom format margins: ${customFormat.margins.top}/${customFormat.margins.right}/${customFormat.margins.bottom}/${customFormat.margins.left}${customFormat.unit}`);
            }
            logger.info(`TemplateEditorController: Using custom format: ${customFormat.name}`);
          } else {
            logger.warn(`TemplateEditorController: Custom format not found: ${customFormatId}, fallback to A4`);
            pdfOptions.format = 'A4';
            pdfOptions.margin = previewData.options?.margin || {
              top: '10mm',
              right: '10mm',
              bottom: '10mm',
              left: '10mm'
            };
          }
        } catch (error) {
          logger.error(`TemplateEditorController: Error loading custom format: ${customFormatId}`, error);
          pdfOptions.format = 'A4';
          pdfOptions.margin = previewData.options?.margin || {
            top: '10mm',
            right: '10mm',
            bottom: '10mm',
            left: '10mm'
          };
        }
      } else {
        // Standard format - use default or provided margins
        pdfOptions.format = formatValue;
        pdfOptions.margin = previewData.options?.margin || {
          top: '10mm',
          right: '10mm',
          bottom: '10mm',
          left: '10mm'
        };
      }
      
      logger.info(`Final pdfOptions:`, pdfOptions);
      logger.info('===========================');

      // Generate PDF preview
      const pdfBuffer = await this.pdfService.generatePDFFromHTML(
        template.htmlContent,
        wineData,
        pdfOptions
      );

      // Set response headers for PDF
      const filename = `template-${template.name.replace(/[^a-zA-Z0-9]/g, '-')}-preview.pdf`;
      
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
      res.setHeader('Content-Length', pdfBuffer.length);

      res.send(pdfBuffer);

      logger.info(`TemplateEditorController: Template preview generated: ${id}`);

    } catch (error) {
      logger.error('TemplateEditorController: Error previewing template:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error'
      });
    }
  };

  /**
   * Get template categories
   */
  getCategories = async (req: Request, res: Response): Promise<void> => {
    try {
      logger.info('TemplateEditorController: Getting template categories');

      const categories = await this.dataStore.getTemplateCategories();

      res.json({
        success: true,
        data: categories
      });

    } catch (error) {
      logger.error('TemplateEditorController: Error getting categories:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error'
      });
    }
  };

  /**
   * Get available wine fields for data binding
   */
  getWineFields = async (req: Request, res: Response): Promise<void> => {
    try {
      logger.info('TemplateEditorController: Getting wine fields for data binding');

      const fieldsConfig = this.dataStore.getFieldsConfig();
      
      const wineFields = fieldsConfig.map(field => ({
        key: field.key,
        label: field.label,
        type: field.type,
        placeholder: `{{wine.${field.key}}}`,
        description: `Pole: ${field.label}`,
        group: field.group || 'general',
        required: field.required || false
      }));

      res.json({
        success: true,
        data: wineFields
      });

    } catch (error) {
      logger.error('TemplateEditorController: Error getting wine fields:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error'
      });
    }
  };

  /**
   * Get available collection fields for data binding
   */
  getCollectionFields = async (req: Request, res: Response): Promise<void> => {
    try {
      logger.info('TemplateEditorController: Getting collection fields for data binding');

      const collectionFieldsConfig = this.dataStore.getCollectionFields();
      
      // Basic collection fields
      const basicCollectionFields = [
        {
          key: 'id',
          label: 'ID Kolekcji',
          type: 'text',
          placeholder: '{{collection.id}}',
          description: 'Unikalny identyfikator kolekcji',
          group: 'basic',
          required: false
        },
        {
          key: 'name',
          label: 'Nazwa kolekcji',
          type: 'text',
          placeholder: '{{collection.name}}',
          description: 'Nazwa kolekcji',
          group: 'basic',
          required: true
        },
        {
          key: 'description',
          label: 'Opis kolekcji',
          type: 'textarea',
          placeholder: '{{collection.description}}',
          description: 'Opis kolekcji',
          group: 'basic',
          required: false
        },
        {
          key: 'status',
          label: 'Status',
          type: 'select',
          placeholder: '{{collection.status}}',
          description: 'Status kolekcji (active, archived, draft)',
          group: 'basic',
          required: true
        },
        {
          key: 'wineCount',
          label: 'Liczba win',
          type: 'number',
          placeholder: '{{collection.wineCount}}',
          description: 'Liczba win w kolekcji',
          group: 'basic',
          required: false
        },
        {
          key: 'createdAt',
          label: 'Data utworzenia',
          type: 'text',
          placeholder: '{{collection.createdAt}}',
          description: 'Data utworzenia kolekcji',
          group: 'basic',
          required: false
        },
        {
          key: 'updatedAt',
          label: 'Data aktualizacji',
          type: 'text',
          placeholder: '{{collection.updatedAt}}',
          description: 'Data ostatniej aktualizacji',
          group: 'basic',
          required: false
        }
      ];

      // Dynamic collection fields
      const dynamicCollectionFields = collectionFieldsConfig.map((field: CollectionField) => ({
        key: field.name,
        label: field.name,
        type: field.type,
        placeholder: `{{collection.${field.name}}}`,
        description: `Dynamiczne pole kolekcji: ${field.name}`,
        group: 'dynamic',
        required: field.required || false
      }));

      // Wine list fields
      const wineListFields = [
        {
          key: 'wines',
          label: 'Lista win (foreach)',
          type: 'array',
          placeholder: '{{#each collection.wines}}{{wine.name}}{{/each}}',
          description: 'Iteracja przez wszystkie wina w kolekcji',
          group: 'wines',
          required: false
        },
        {
          key: 'winesList',
          label: 'Lista win - alias (foreach)',
          type: 'array',
          placeholder: '{{#each winesList}}{{this.name}}{{/each}}',
          description: 'Alternatywny token dla listy win (używa {{this.field}} zamiast {{wine.field}})',
          group: 'wines',
          required: false
        },
        {
          key: 'winesByCategory',
          label: 'Wina pogrupowane po kategorii (foreach)',
          type: 'array',
          placeholder: '{{#each collection.winesByCategory}}{{category}} ({{categoryWineCount}}){{#each wines}}{{wine.name}}{{/each}}{{/each}}',
          description: 'Iteracja przez wina pogrupowane według kategorii. Dostępne tokeny: {{category}}, {{categoryWineCount}}, {{#each wines}}',
          group: 'wines',
          required: false
        },
        {
          key: 'wines.length',
          label: 'Liczba win',
          type: 'number',
          placeholder: '{{collection.wines.length}}',
          description: 'Liczba win w kolekcji',
          group: 'wines',
          required: false
        }
      ];

      // Category-specific fields (used inside {{#each collection.winesByCategory}} loop)
      const categoryFields = [
        {
          key: 'category',
          label: 'Nazwa kategorii (w pętli winesByCategory)',
          type: 'text',
          placeholder: '{{category}}',
          description: 'Nazwa aktualnej kategorii (tylko wewnątrz {{#each collection.winesByCategory}})',
          group: 'category-loop',
          required: false
        },
        {
          key: 'categoryWineCount',
          label: 'Liczba win w kategorii (w pętli)',
          type: 'number',
          placeholder: '{{categoryWineCount}}',
          description: 'Liczba win w aktualnej kategorii (tylko wewnątrz {{#each collection.winesByCategory}})',
          group: 'category-loop',
          required: false
        },
        {
          key: 'wines-nested',
          label: 'Pętla win w kategorii (zagnieżdżona)',
          type: 'array',
          placeholder: '{{#each wines}}{{wine.name}}{{/each}}',
          description: 'Iteracja przez wina w aktualnej kategorii (tylko wewnątrz {{#each collection.winesByCategory}})',
          group: 'category-loop',
          required: false
        }
      ];

      const allFields = [
        ...basicCollectionFields,
        ...dynamicCollectionFields,
        ...wineListFields,
        ...categoryFields
      ];

      res.json({
        success: true,
        data: allFields
      });

    } catch (error) {
      logger.error('TemplateEditorController: Error getting collection fields:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error'
      });
    }
  };

  /**
   * Get collection data with wines for template preview
   * REFACTORED: Now uses CollectionDataBuilder for unified data preparation
   */
  getCollectionData = async (req: Request, res: Response): Promise<void> => {
    try {
      const { collectionId } = req.params;
      
      logger.info('TemplateEditorController: Getting collection data for preview', { collectionId });

      if (!collectionId) {
        res.status(400).json({
          success: false,
          error: 'Collection ID is required'
        });
        return;
      }

      // Use CollectionDataBuilder for unified data preparation
      const collectionData = await this.collectionDataBuilder.prepareCollectionDataWithFormattedDates(
        collectionId
      );

      res.json({
        success: true,
        data: collectionData
      });

    } catch (error) {
      logger.error('TemplateEditorController: Error getting collection data:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error'
      });
    }
  };

  /**
   * Preview collection template with collection data
   * REFACTORED: Now uses CollectionDataBuilder for unified data preparation
   */
  previewCollectionTemplate = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      
      // Extract format - support both req.body.format and req.body.options.format
      const { collectionId, customTitle, format: topLevelFormat, options = {} } = req.body;
      const { format: optionsFormat = 'A4', orientation = 'portrait', margin } = options;
      
      // Use format from either location (prioritize top-level format)
      const format = topLevelFormat || optionsFormat;
      
      logger.info('🔍 TemplateEditorController: Preview collection request body:', JSON.stringify(req.body, null, 2));
      logger.info('🔍 Extracted format:', format, 'Is custom:', format?.startsWith('custom:'));
      
      if (!id) {
        res.status(400).json({
          success: false,
          error: 'Template ID is required'
        });
        return;
      }
      
      logger.info('TemplateEditorController: Previewing collection template', { 
        templateId: id, collectionId, format, orientation 
      });

      const template = await this.dataStore.getHTMLTemplate(id);
      if (!template) {
        res.status(404).json({
          success: false,
          error: 'Template not found'
        });
        return;
      }

      let collectionData = null;
      if (collectionId) {
        // Use CollectionDataBuilder for unified data preparation
        collectionData = await this.collectionDataBuilder.prepareCollectionDataWithFormattedDates(
          collectionId
        );
      } else {
        // Use sample collection data
        const sampleWines = Array.from(this.dataStore.getWines().values()).slice(0, 3);
        collectionData = {
          id: 'sample-collection',
          name: 'Przykładowa Kolekcja',
          description: 'To jest przykładowa kolekcja do podglądu szablonu',
          status: 'active',
          wineCount: sampleWines.length,
          wines: sampleWines,      // Full wine objects for {{#each collection.wines}} and grouping
          winesList: sampleWines,  // Alias for backward compatibility with {{#each winesList}}
          totalWines: sampleWines.length,
          createdAt: new Date().toLocaleDateString('pl-PL'),
          updatedAt: new Date().toLocaleDateString('pl-PL'),
          dynamicFields: {},
          dynamicFieldsByName: {}
        };
      }

      // Handle custom format or use standard format
      let pdfOptions: any = {
        printBackground: true,
        displayHeaderFooter: false
      };

      const formatValue = format || 'A4';
      
      // Check if format is custom format (starts with 'custom:')
      if (formatValue.startsWith('custom:')) {
        const customFormatId = formatValue.replace('custom:', '');
        
        try {
          // Get custom format from dataStore
          const customFormats = await this.dataStore.getCustomFormats();
          const customFormat = customFormats.find(f => f.id === customFormatId);
          
          if (customFormat) {
            pdfOptions.customFormat = customFormat;
            // Custom format margins will be used from customFormat.margins - DON'T override
            logger.info(`TemplateEditorController: Using custom format for collection: ${customFormat.name} with margins: ${customFormat.margins.top}/${customFormat.margins.right}/${customFormat.margins.bottom}/${customFormat.margins.left}${customFormat.unit}`);
          } else {
            logger.warn(`TemplateEditorController: Custom format not found for collection: ${customFormatId}, fallback to A4`);
            pdfOptions.format = 'A4';
            // No margin specified - PDFService will use format's default
          }
        } catch (error) {
          logger.error(`TemplateEditorController: Error loading custom format for collection: ${customFormatId}`, error);
          pdfOptions.format = 'A4';
          // No margin specified - PDFService will use format's default
        }
      } else {
        // Standard format - no margin override, let PDFService decide
        pdfOptions.format = formatValue;
      }

      // Generate PDF with collection data
      const pdfBuffer = await this.pdfService.generatePDFFromHTMLWithCollection(
        template.htmlContent,
        collectionData,
        pdfOptions
      );

      logger.info('TemplateEditorController: Collection template preview generated', { templateId: id });

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `inline; filename="collection-template-preview-${id}.pdf"`);
      res.send(pdfBuffer);

    } catch (error) {
      logger.error('TemplateEditorController: Error previewing collection template:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error'
      });
    }
  };

  /**
   * Generate final PDF from template with collection data
   * REFACTORED: Now uses CollectionDataBuilder for unified data preparation
   */
  generateCollectionPDF = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { collectionId, customTitle, format: topLevelFormat, options = {} } = req.body;
      const { format: optionsFormat = 'A4', orientation = 'portrait', margin, flatten = false } = options;
      
      // Use format from either location (prioritize top-level format)
      const format = topLevelFormat || optionsFormat;

      logger.info('🔍 TemplateEditorController: Generate collection request body:', JSON.stringify(req.body, null, 2));
      logger.info('🔍 Extracted format:', format, 'Is custom:', format?.startsWith('custom:'));
      logger.info('🔍 Flatten PDF option:', flatten);

      if (!id || !collectionId) {
        res.status(400).json({
          success: false,
          error: 'Template ID and collection ID are required'
        });
        return;
      }

      logger.info('TemplateEditorController: Generating collection PDF', { 
        templateId: id, 
        collectionId,
        customTitle,
        format 
      });

      // Get template
      const template = await this.dataStore.getHTMLTemplate(id);
      if (!template) {
        res.status(404).json({
          success: false,
          error: 'Template not found'
        });
        return;
      }

      // Use CollectionDataBuilder for unified data preparation
      const collectionData = await this.collectionDataBuilder.prepareCollectionData(
        collectionId,
        customTitle
      );

      // Handle custom format or use standard format
      let pdfOptions: any = {
        printBackground: true,
        displayHeaderFooter: false
      };

      const formatValue = format || 'A4';
      
      // Check if format is custom format (starts with 'custom:')
      if (formatValue.startsWith('custom:')) {
        const customFormatId = formatValue.replace('custom:', '');
        
        try {
          // Get custom format from dataStore
          const customFormats = await this.dataStore.getCustomFormats();
          const customFormat = customFormats.find(f => f.id === customFormatId);
          
          if (customFormat) {
            pdfOptions.customFormat = customFormat;
            // Custom format margins will be used from customFormat.margins - DON'T override
            logger.info(`📄 Using custom format: ${customFormat.name} with margins: ${customFormat.margins.top}/${customFormat.margins.right}/${customFormat.margins.bottom}/${customFormat.margins.left}${customFormat.unit}`);
          } else {
            logger.warn(`⚠️ Custom format not found: ${customFormatId}, fallback to A4`);
            pdfOptions.format = 'A4';
            // No margin specified - PDFService will use format's default
          }
        } catch (error) {
          logger.error(`❌ Error loading custom format: ${customFormatId}`, error);
          pdfOptions.format = 'A4';
          // No margin specified - PDFService will use format's default
        }
      } else {
        // Standard format - no margin override, let PDFService decide
        logger.info(`📄 Using standard format: ${formatValue}`);
        pdfOptions.format = formatValue;
      }

      // Add flatten option if requested
      if (flatten) {
        pdfOptions.flatten = true;
        logger.info('🔨 PDF flattening enabled');
      }

      // Generate PDF with collection data
      const pdfBuffer = await this.pdfService.generatePDFFromHTMLWithCollection(
        template.htmlContent,
        collectionData,
        pdfOptions
      );

      logger.info('TemplateEditorController: Collection PDF generated successfully', { 
        templateId: id,
        collectionId,
        winesCount: collectionData.wines.length 
      });

      // Generate filename
      const sanitizedCollectionName = collectionData.name.replace(/[^a-zA-Z0-9]/g, '_');
      const sanitizedTemplateName = template.name.replace(/[^a-zA-Z0-9]/g, '_');
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `${sanitizedCollectionName}_${sanitizedTemplateName}_${timestamp}.pdf`;

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `inline; filename="${filename}"`); // zmieniono z 'attachment' na 'inline' - PDF otworzy się w przeglądarce
      res.send(pdfBuffer);

    } catch (error) {
      logger.error('TemplateEditorController: Error generating collection PDF:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error'
      });
    }
  };

  /**
   * Extract placeholders from HTML content
   */
  private extractPlaceholders(htmlContent: string): any[] {
    const placeholderRegex = /\{\{wine\.(\w+)\}\}/g;
    const placeholders: any[] = [];
    const found = new Set<string>();
    
    let match;
    while ((match = placeholderRegex.exec(htmlContent)) !== null) {
      const fieldName = match[1];
      if (fieldName && !found.has(fieldName)) {
        found.add(fieldName);
        placeholders.push({
          id: uuidv4(),
          name: `wine.${fieldName}`,
          label: this.getFieldLabel(fieldName),
          type: this.getFieldType(fieldName),
          required: false,
          group: 'wine'
        });
      }
    }

    return placeholders;
  }

  /**
   * Get field label for wine field
   */
  private getFieldLabel(fieldName: string): string {
    const fieldsConfig = this.dataStore.getFieldsConfig();
    const field = fieldsConfig.find(f => f.key === fieldName);
    return field?.label || fieldName;
  }

  /**
   * Get field type for wine field
   */
  private getFieldType(fieldName: string): string {
    const fieldsConfig = this.dataStore.getFieldsConfig();
    const field = fieldsConfig.find(f => f.key === fieldName);
    
    switch (field?.type) {
      case 'number':
        return 'number';
      case 'url':
        return 'image';
      case 'textarea':
        return 'html';
      default:
        return 'text';
    }
  }
}