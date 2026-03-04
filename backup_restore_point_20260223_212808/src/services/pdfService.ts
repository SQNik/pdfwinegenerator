import fs from 'fs/promises';
import fsSync from 'fs';
import path from 'path';
import https from 'https';
import http from 'http';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import puppeteer from 'puppeteer';
import { 
  PDFTemplate, 
  PDFGenerationJob,
  Wine,
  ProductListLayoutConfig
} from '../types';
import { DataStore } from './dataStore';
import logger from '../utils/logger';
import { v4 as uuidv4 } from 'uuid';
import { 
  mergeProductListConfig, 
  validateProductListConfig 
} from '../config/productListDefaults';

export class PDFService {
  private dataDir: string;
  private templatesFile: string;
  private jobsFile: string;
  private outputDir: string;
  private dataStore: DataStore;

  constructor(dataStore: DataStore, dataDir = 'data') {
    this.dataStore = dataStore;
    this.dataDir = dataDir;
    this.templatesFile = path.join(dataDir, 'pdf-templates.json');
    this.jobsFile = path.join(dataDir, 'pdf-jobs.json');
    this.outputDir = path.join('public', 'pdf-output');
  }

  async initialize(): Promise<void> {
    try {
      // Ensure directories exist
      await fs.mkdir(this.dataDir, { recursive: true });
      await fs.mkdir(this.outputDir, { recursive: true });

      // Initialize templates file if it doesn't exist
      try {
        await fs.access(this.templatesFile);
      } catch {
        await this.initializeTemplatesFile();
      }

      // Initialize jobs file if it doesn't exist
      try {
        await fs.access(this.jobsFile);
      } catch {
        await fs.writeFile(this.jobsFile, JSON.stringify([], null, 2));
      }

      logger.info('PDFService initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize PDFService:', error);
      throw error;
    }
  }

  private async initializeTemplatesFile(): Promise<void> {
    const defaultTemplate: PDFTemplate = {
      id: uuidv4(),
      name: 'Katalog Win - Szablon Podstawowy',
      description: 'Podstawowy szablon dla katalogu win z okładką, zawartością i rewersem',
      printSettings: {
        margins: {
          top: 20,
          right: 20,
          bottom: 20,
          left: 20,
          unit: 'mm'
        },
        bleed: 3,
        colorMode: 'cmyk',
        dpi: 300,
        format: {
          name: 'A4',
          width: 210,
          height: 297,
          unit: 'mm'
        }
      },
      sections: {
        front: {
          enabled: true,
          backgroundColor: '#8B0000',
          elements: [
            {
              id: uuidv4(),
              type: 'text',
              x: 50,
              y: 100,
              width: 500,
              height: 60,
              zIndex: 1,
              visible: true,
              locked: false,
              properties: {
                content: 'KATALOG WIN',
                fontSize: 48,
                fontFamily: 'Helvetica',
                fontWeight: 'bold',
                fontStyle: 'normal',
                color: '#FFFFFF',
                textAlign: 'center',
                lineHeight: 1.2,
                letterSpacing: 0
              }
            }
          ]
        },
        content: {
          enabled: true,
          backgroundColor: '#FFFFFF',
          elements: [],
          productLayout: {
            id: uuidv4(),
            name: 'Default Grid Layout',
            width: 555,
            height: 700,
            elements: [
              {
                id: uuidv4(),
                type: 'product-field',
                x: 10,
                y: 10,
                width: 200,
                height: 30,
                zIndex: 1,
                visible: true,
                locked: false,
                properties: {
                  fieldName: 'name',
                  fontSize: 14,
                  fontFamily: 'Helvetica',
                  color: '#000000',
                  textAlign: 'left'
                }
              }
            ],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          // ✅ USUNIĘTO: productsPerPage - właściwość przeniesiona do elementów product-list
          groupByCategory: false,
          categoryHeaderEnabled: false,
          categoryHeaderStyle: {
            content: '',
            fontSize: 16,
            fontFamily: 'Helvetica',
            fontWeight: 'bold',
            fontStyle: 'normal',
            color: '#8B0000',
            textAlign: 'left',
            lineHeight: 1.2,
            letterSpacing: 0
          },
          // ✅ USUNIĘTO: Duplikujące się właściwości layoutu produktów
          // Te właściwości są teraz zarządzane przez ProductListLayoutConfig
          // w elementach product-list i domyślnych wartościach systemowych
        },
        back: {
          enabled: true,
          backgroundColor: '#F5F5F5',
          elements: [
            {
              id: uuidv4(),
              type: 'text',
              x: 50,
              y: 300,
              width: 500,
              height: 200,
              zIndex: 1,
              visible: true,
              locked: false,
              properties: {
                content: 'Dziękujemy za zainteresowanie naszymi winami!',
                fontSize: 16,
                fontFamily: 'Helvetica',
                fontWeight: 'normal',
                fontStyle: 'normal',
                color: '#333333',
                textAlign: 'center',
                lineHeight: 1.4,
                letterSpacing: 0
              }
            }
          ]
        }
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await fs.writeFile(this.templatesFile, JSON.stringify([defaultTemplate], null, 2));
  }

  // Template management
  async getTemplates(): Promise<PDFTemplate[]> {
    try {
      const data = await fs.readFile(this.templatesFile, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      logger.error('Error reading templates:', error);
      return [];
    }
  }

  async getTemplate(id: string): Promise<PDFTemplate | null> {
    const templates = await this.getTemplates();
    return templates.find(t => t.id === id) || null;
  }

  async createTemplate(template: Omit<PDFTemplate, 'id' | 'createdAt' | 'updatedAt'>): Promise<PDFTemplate> {
    const newTemplate: PDFTemplate = {
      ...template,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const templates = await this.getTemplates();
    templates.push(newTemplate);
    await fs.writeFile(this.templatesFile, JSON.stringify(templates, null, 2));

    logger.info(`Created new PDF template: ${newTemplate.name}`);
    return newTemplate;
  }

  async updateTemplate(id: string, updates: Partial<PDFTemplate>): Promise<PDFTemplate | null> {
    logger.info(`PDFService: updateTemplate called for ID: ${id}`);
    logger.info(`PDFService: Updates received:`, JSON.stringify(updates, null, 2));
    
    const templates = await this.getTemplates();
    const index = templates.findIndex(t => t.id === id);

    if (index === -1) {
      logger.warn(`PDFService: Template not found: ${id}`);
      return null;
    }

    const originalTemplate = templates[index]!; // Non-null assertion since we checked index
    
    // Create updated template with all required fields
    const updatedTemplate: PDFTemplate = {
      id: originalTemplate.id,
      name: updates.name ?? originalTemplate.name,
      printSettings: updates.printSettings ?? originalTemplate.printSettings,
      sections: updates.sections ?? originalTemplate.sections,
      createdAt: originalTemplate.createdAt,
      updatedAt: new Date().toISOString()
    };

    // Handle optional description field
    if (updates.description !== undefined) {
      updatedTemplate.description = updates.description;
    } else if (originalTemplate.description !== undefined) {
      updatedTemplate.description = originalTemplate.description;
    }

    templates[index] = updatedTemplate;
    await fs.writeFile(this.templatesFile, JSON.stringify(templates, null, 2));
    logger.info(`PDFService: Updated PDF template: ${id}`);
    logger.info(`PDFService: Final template sections:`, JSON.stringify(updatedTemplate.sections, null, 2));

    return updatedTemplate;
  }

  async deleteTemplate(id: string): Promise<boolean> {
    const templates = await this.getTemplates();
    const filteredTemplates = templates.filter(t => t.id !== id);

    if (filteredTemplates.length === templates.length) {
      return false;
    }

    await fs.writeFile(this.templatesFile, JSON.stringify(filteredTemplates, null, 2));
    logger.info(`Deleted PDF template: ${id}`);

    return true;
  }

  // Job management
  async getJobs(): Promise<PDFGenerationJob[]> {
    try {
      const data = await fs.readFile(this.jobsFile, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      logger.error('Error reading jobs:', error);
      return [];
    }
  }

  async getJob(id: string): Promise<PDFGenerationJob | null> {
    const jobs = await this.getJobs();
    return jobs.find(j => j.id === id) || null;
  }

  // PDF Generation
  async generatePDF(templateId: string, collectionId: string, dataStore: DataStore): Promise<string> {
    try {
      // Try to get template from PDF templates first
      let template = await this.getTemplate(templateId);
      
      // If not found in PDF templates, try HTML templates
      if (!template) {
        const htmlTemplates = await dataStore.getHTMLTemplates();
        const htmlTemplate = htmlTemplates.find(t => t.id === templateId);
        if (htmlTemplate) {
          // Convert HTML template to PDFTemplate format for compatibility
          template = {
            id: htmlTemplate.id,
            name: htmlTemplate.name,
            htmlContent: htmlTemplate.htmlContent,
            metadata: htmlTemplate.metadata || {},
            status: htmlTemplate.status,
            createdAt: htmlTemplate.createdAt || new Date().toISOString(),
            updatedAt: htmlTemplate.updatedAt || new Date().toISOString()
          } as any;
        }
      }
      
      if (!template) {
        throw new Error(`Template not found in PDF or HTML templates: ${templateId}`);
      }

      const collection = dataStore.getCollection(collectionId);
      if (!collection) {
        throw new Error(`Collection not found: ${collectionId}`);
      }

      const wines = dataStore.getWinesByCatalogNumbers(collection.wines);
      
      // Get collection field definitions for name-to-ID mapping
      const collectionFields = dataStore.getCollectionFields();

      // Check if template has HTML content (new system) or uses old component system
      if (template.htmlContent) {
        logger.info(`Using HTML template system for template: ${template.name}`);
        
        // Create a map of field names (lowercase) to field IDs for easier access
        const fieldNameToId: { [key: string]: string } = {};
        collectionFields.forEach(field => {
          fieldNameToId[field.name.toLowerCase()] = field.id;
        });
        
        // Create dynamicFieldsByName object for template access
        const dynamicFieldsByName: { [key: string]: any } = {};
        if (collection.dynamicFields) {
          Object.entries(collection.dynamicFields).forEach(([fieldId, value]) => {
            const field = collectionFields.find(f => f.id === fieldId);
            if (field) {
              dynamicFieldsByName[field.name.toLowerCase()] = value;
            }
          });
        }
        
        // Prepare collection data with wines list
        const collectionData = {
          ...collection,
          winesList: wines,
          wines: wines,  // Also add as 'wines' for compatibility
          dynamicFieldsByName  // Add name-based access
        };
        
        // Build PDF options from template settings
        const pdfOptions: any = {
          printBackground: true // Default
        };
        
        // Apply template PDF settings if they exist
        if (template.pdfSettings) {
          const settings = template.pdfSettings;
          
          // Handle custom format
          if (settings.customFormat) {
            pdfOptions.customFormat = settings.customFormat;
          } else if (settings.format) {
            pdfOptions.format = settings.format;
          } else {
            pdfOptions.format = 'A4'; // Fallback
          }
          
          // Apply margins if specified
          if (settings.margins) {
            pdfOptions.margin = settings.margins;
          }
          
          // Apply orientation if specified
          if (settings.orientation) {
            pdfOptions.orientation = settings.orientation;
          }
          
          // Apply printBackground setting
          if (settings.printBackground !== undefined) {
            pdfOptions.printBackground = settings.printBackground;
          }
        } else {
          // No template settings, use defaults
          pdfOptions.format = 'A4';
        }
        
        logger.info(`PDFService: Using PDF settings from template:`, pdfOptions);
        
        // Generate PDF using HTML system
        const pdfBuffer = await this.generatePDFFromHTMLWithCollection(
          template.htmlContent,
          collectionData,
          pdfOptions
        );
        
        // Save PDF
        const filename = `catalog_${collection.name.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}.pdf`;
        const filepath = path.join(this.outputDir, filename);
        await fs.writeFile(filepath, pdfBuffer);
        
        logger.info(`Generated PDF successfully: ${filename}`);
        return filename;
      } else {
        // Use old component-based system
        logger.info(`Using component-based template system for template: ${template.name}`);
        const filename = await this.generatePDFFromTemplate(template, wines, collection.name, dataStore);
        logger.info(`Generated PDF successfully: ${filename}`);
        return filename;
      }

    } catch (error) {
      logger.error('PDF generation failed:', error);
      throw error;
    }
  }

  async generatePreviewPDF(template: PDFTemplate, sampleWines: Wine[], dataStore: DataStore): Promise<string> {
    logger.info(`PDFService: generatePreviewPDF called for template: ${template.name}`);
    logger.info(`PDFService: Template sections for preview:`, JSON.stringify(template.sections, null, 2));
    try {
      const result = await this.generatePDFFromTemplate(template, sampleWines, 'Podgląd Szablonu', dataStore);
      logger.info(`PDFService: generatePreviewPDF completed successfully: ${result}`);
      return result;
    } catch (error) {
      logger.error('PDFService: Error in generatePreviewPDF:', error);
      throw error;
    }
  }

  private async generatePDFFromTemplate(template: PDFTemplate, wines: Wine[], title: string, dataStore: DataStore): Promise<string> {
    logger.info(`PDFService: generatePDFFromTemplate called with title: ${title}`);
    
    try {
      // Create PDF document
      logger.info('PDFService: Creating PDF document...');
      const pdfDoc = await PDFDocument.create();
      
      // Set document metadata
      pdfDoc.setTitle(title);
      pdfDoc.setSubject('Wine Catalog');
      pdfDoc.setCreator('Wine Management System');

      // Get page dimensions based on template format
      logger.info('PDFService: Getting page dimensions...');
      const { width, height } = this.getPageDimensions(template.printSettings.format);
      logger.info(`PDFService: Page dimensions: ${width}x${height}`);

      // Generate front page
      if (template.sections.front.enabled) {
        logger.info('PDFService: Generating front page...');
        await this.generateFrontPage(pdfDoc, template, title, width, height, dataStore);
        logger.info('PDFService: Front page generated successfully');
      }

      // Generate content pages
      if (template.sections.content.enabled && wines.length > 0) {
        logger.info('PDFService: Generating content pages...');
        await this.generateContentPages(pdfDoc, template, wines, width, height, dataStore);
        logger.info('PDFService: Content pages generated successfully');
      }

      // Generate back page
      if (template.sections.back.enabled) {
        logger.info('PDFService: Generating back page...');
        await this.generateBackPage(pdfDoc, template, title, width, height, dataStore);
        logger.info('PDFService: Back page generated successfully');
      }

      // Save PDF
      logger.info('PDFService: Saving PDF...');
      const pdfBytes = await pdfDoc.save();
      const filename = `catalog_${title.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}.pdf`;
      const filepath = path.join(this.outputDir, filename);

      await fs.writeFile(filepath, pdfBytes);
      logger.info(`PDFService: PDF saved successfully: ${filename}`);
      return filename;
    } catch (error) {
      logger.error('PDFService: Error in generatePDFFromTemplate:', error);
      throw error;
    }
  }

  private getPageDimensions(format: { width: number; height: number; unit: string }): { width: number; height: number } {
    // Convert to points (PDF standard unit)
    let width = format.width;
    let height = format.height;

    if (format.unit === 'mm') {
      width = width * 2.834645669; // mm to points
      height = height * 2.834645669;
    } else if (format.unit === 'in') {
      width = width * 72; // inches to points
      height = height * 72;
    }

    return { width, height };
  }

  private async generateFrontPage(
    pdfDoc: any, 
    template: PDFTemplate, 
    title: string,
    width: number, 
    height: number,
    dataStore: DataStore
  ): Promise<void> {
    const page = pdfDoc.addPage([width, height]);
    
    // Set background based on type
    const bgType = template.sections.front.backgroundType || 'color';
    logger.info(`PDFService: Front page background type: ${bgType}`);
    
    if (bgType === 'color' && template.sections.front.backgroundColor) {
      logger.info(`PDFService: Rendering color background: ${template.sections.front.backgroundColor}`);
      const color = this.hexToRgb(template.sections.front.backgroundColor);
      page.drawRectangle({
        x: 0,
        y: 0,
        width,
        height,
        color: rgb(color.r / 255, color.g / 255, color.b / 255)
      });
      logger.info(`PDFService: Color background rendered successfully`);
    } else if (bgType === 'image' && template.sections.front.backgroundImage) {
      try {
        logger.info(`PDFService: Background image requested for front page: ${template.sections.front.backgroundImage}`);
        await this.renderBackgroundImage(page, template.sections.front.backgroundImage, width, height, pdfDoc);
        logger.info(`PDFService: Background image rendered successfully for front page`);
      } catch (error) {
        logger.warn(`PDFService: Failed to load background image for front page: ${error}`);
      }
    } else if (bgType === 'none') {
      logger.info(`PDFService: Rendering transparent background for front page`);
      // Create transparent background by drawing a rectangle with 0 opacity
      page.drawRectangle({
        x: 0,
        y: 0,
        width,
        height,
        color: rgb(1, 1, 1), // White color
        opacity: 0 // Fully transparent
      });
      logger.info(`PDFService: Transparent background rendered successfully for front page`);
    } else {
      logger.info(`PDFService: Default white background applied for front page (type: ${bgType})`);
    }
    // If bgType === 'none', no background is applied

    // Add elements
    logger.info(`PDFService: About to render ${template.sections.front.elements.length} front elements`);
    for (const element of template.sections.front.elements) {
      logger.info(`PDFService: Processing element ${element.id} of type ${element.type}`);
      await this.renderElement(page, element, { title }, pdfDoc, template, dataStore);
    }
  }

  private async generateContentPages(
    pdfDoc: any,
    template: PDFTemplate,
    wines: Wine[],
    width: number,
    height: number,
    dataStore: DataStore
  ): Promise<void> {
    const productsPerPage = 12; // ✅ Używa domyślnej wartości, element product-list ma własną konfigurację
    const pageCount = Math.ceil(wines.length / productsPerPage);

    for (let pageNum = 0; pageNum < pageCount; pageNum++) {
      const page = pdfDoc.addPage([width, height]);
      
      // Set background based on type
      const bgType = template.sections.content.backgroundType || 'color';
      logger.info(`PDFService: Content page ${pageNum + 1} background type: ${bgType}`);
      
      if (bgType === 'color' && template.sections.content.backgroundColor) {
        logger.info(`PDFService: Rendering color background for content page ${pageNum + 1}: ${template.sections.content.backgroundColor}`);
        const color = this.hexToRgb(template.sections.content.backgroundColor);
        page.drawRectangle({
          x: 0,
          y: 0,
          width,
          height,
          color: rgb(color.r / 255, color.g / 255, color.b / 255)
        });
        logger.info(`PDFService: Color background rendered successfully for content page ${pageNum + 1}`);
      } else if (bgType === 'image' && template.sections.content.backgroundImage) {
        try {
          logger.info(`PDFService: Background image requested for content page ${pageNum + 1}: ${template.sections.content.backgroundImage}`);
          await this.renderBackgroundImage(page, template.sections.content.backgroundImage, width, height, pdfDoc);
          logger.info(`PDFService: Background image rendered successfully for content page ${pageNum + 1}`);
        } catch (error) {
          logger.warn(`PDFService: Failed to load background image for content page ${pageNum + 1}: ${error}`);
        }
      } else if (bgType === 'none') {
        logger.info(`PDFService: Rendering transparent background for content page ${pageNum + 1}`);
        // Create transparent background by drawing a rectangle with 0 opacity
        page.drawRectangle({
          x: 0,
          y: 0,
          width,
          height,
          color: rgb(1, 1, 1), // White color
          opacity: 0 // Fully transparent
        });
        logger.info(`PDFService: Transparent background rendered successfully for content page ${pageNum + 1}`);
      } else {
        logger.info(`PDFService: Default white background applied for content page ${pageNum + 1} (type: ${bgType})`);
      }

      // Add elements from content section
      logger.info(`PDFService: About to render ${template.sections.content.elements.length} content elements`);
      for (const element of template.sections.content.elements) {
        await this.renderElement(page, element, { pageNum, wines }, pdfDoc, template, dataStore);
      }

      // ✅ Fallback: Jeśli szablon nie ma elementów, dodaj komunikat
      if (template.sections.content.elements.length === 0) {
        logger.warn('PDFService: Template has no content elements. Add product-list element to display wines.');
        // Proste informacje o pustej stronie zamiast legacy renderWineGrid
        const textProps = {
          content: 'Brak elementów zawartości. Dodaj element "Lista produktów" w edytorze szablonu.',
          fontSize: 14,
          fontFamily: 'Arial',
          color: '#666666',
          textAlign: 'center',
          lineHeight: 1.4
        };
        await this.renderText(page, 50, height / 2, width - 100, 50, textProps, {}, pdfDoc);
      }
    }
  }

  private async generateBackPage(
    pdfDoc: any,
    template: PDFTemplate,
    title: string,
    width: number,
    height: number,
    dataStore: DataStore
  ): Promise<void> {
    const page = pdfDoc.addPage([width, height]);
    
    // Set background based on type
    const bgType = template.sections.back.backgroundType || 'color';
    logger.info(`PDFService: Back page background type: ${bgType}`);
    
    if (bgType === 'color' && template.sections.back.backgroundColor) {
      logger.info(`PDFService: Rendering color background for back page: ${template.sections.back.backgroundColor}`);
      const color = this.hexToRgb(template.sections.back.backgroundColor);
      page.drawRectangle({
        x: 0,
        y: 0,
        width,
        height,
        color: rgb(color.r / 255, color.g / 255, color.b / 255)
      });
      logger.info(`PDFService: Color background rendered successfully for back page`);
    } else if (bgType === 'image' && template.sections.back.backgroundImage) {
      try {
        logger.info(`PDFService: Background image requested for back page: ${template.sections.back.backgroundImage}`);
        await this.renderBackgroundImage(page, template.sections.back.backgroundImage, width, height, pdfDoc);
        logger.info(`PDFService: Background image rendered successfully for back page`);
      } catch (error) {
        logger.warn(`PDFService: Failed to load background image for back page: ${error}`);
      }
    } else if (bgType === 'none') {
      logger.info(`PDFService: Rendering transparent background for back page`);
      // Create transparent background by drawing a rectangle with 0 opacity
      page.drawRectangle({
        x: 0,
        y: 0,
        width,
        height,
        color: rgb(1, 1, 1), // White color
        opacity: 0 // Fully transparent
      });
      logger.info(`PDFService: Transparent background rendered successfully for back page`);
    } else {
      logger.info(`PDFService: Default white background applied for back page (type: ${bgType})`);
    }

    // Add elements
    for (const element of template.sections.back.elements) {
      await this.renderElement(page, element, { title }, pdfDoc, template, dataStore);
    }
  }

  private async renderElement(
    page: any,
    element: any,
    context: any,
    pdfDoc: any,
    template: PDFTemplate,
    dataStore: DataStore
  ): Promise<void> {
    logger.info(`PDFService: ==> renderElement called for element type: ${element.type}, id: ${element.id}`);
    logger.info(`PDFService: element data:`, element);
    logger.info(`PDFService: element keys:`, Object.keys(element));
    logger.info(`PDFService: element JSON:`, JSON.stringify(element, null, 2));
    
    // Convert canvas pixel coordinates to PDF points
    const pdfCoords = this.convertCanvasCoordinatesToPDF(element, template);
    logger.info(`PDFService: Original coordinates: x=${element.x}, y=${element.y}, width=${element.width}, height=${element.height}`);
    logger.info(`PDFService: Converted PDF coordinates: x=${pdfCoords.x}, y=${pdfCoords.y}, width=${pdfCoords.width}, height=${pdfCoords.height}`);
    
    const { x, y, width, height } = pdfCoords;
    const properties = element.properties || element; // Fallback to element itself if no properties object
    
    logger.info(`PDFService: Final coordinates for rendering: x=${x}, y=${y}, width=${width}, height=${height}`);
    logger.info(`PDFService: Properties object:`, properties);

    try {
      switch (element.type) {
        case 'text':
          logger.info('PDFService: Rendering text element...');
          // Extract only the properties we need for text rendering
          const textProps = {
            content: element.content,
            fontSize: element.fontSize,
            fontFamily: element.fontFamily,
            fontWeight: element.fontWeight,
            color: element.color,
            textAlign: element.textAlign,
            lineHeight: element.lineHeight
          };
          logger.info('PDFService: About to call renderText with textProps:', textProps);
          await this.renderText(page, x, y, width, height, textProps, context, pdfDoc);
          logger.info('PDFService: Text element rendered successfully');
          break;
          
        case 'rectangle':
          logger.info('PDFService: Rendering rectangle element...');
          const rectProps = {
            backgroundColor: element.backgroundColor || '#cccccc',
            borderWidth: element.borderWidth || 0,
            borderColor: element.borderColor || '#000000'
          };
          await this.renderRectangle(page, x, y, width, height, rectProps);
          logger.info('PDFService: Rectangle element rendered successfully');
          break;
          
        case 'image':
          logger.info('PDFService: Rendering image element...');
          if (element.src && element.src.trim()) {
            const imageProps = {
              src: element.src,
              objectFit: element.objectFit || 'cover'
            };
            await this.renderImage(page, x, y, width, height, imageProps, pdfDoc);
            logger.info('PDFService: Image element rendered successfully');
          } else {
            logger.warn('PDFService: Image element has no src, skipping');
          }
          break;

        case 'product-list':
          logger.info('PDFService: Rendering product-list element...');
          const productListProps = {
            collectionId: element.collectionId,
            columns: element.columns || 2,
            rowsPerPage: element.rowsPerPage || 10,
            showImages: element.showImages || false,
            showPrices: element.showPrices || false,
            showDescriptions: element.showDescriptions || false,
            itemSpacing: element.itemSpacing || 10,
            fontSize: element.fontSize || 10,
            fontFamily: element.fontFamily || 'Arial',
            textColor: element.textColor || '#000000',
            headerText: element.headerText || 'Produkty',
            showHeader: element.showHeader || false,
            headerFontSize: element.headerFontSize || 14,
            headerColor: element.headerColor || '#000000'
          };
          await this.renderProductList(page, x, y, width, height, productListProps, context, pdfDoc, template, dataStore);
          logger.info('PDFService: Product-list element rendered successfully');
          break;
          
        // Add more element types as needed
        default:
          logger.warn(`PDFService: Unknown element type: ${element.type}`);
      }
    } catch (error) {
      logger.error(`PDFService: Error rendering element of type ${element.type}:`, error);
      throw error;
    }
  }

  private async renderText(
    page: any,
    x: number,
    y: number,
    width: number,
    height: number,
    properties: any,
    context: any,
    pdfDoc: any
  ): Promise<void> {
    logger.info(`PDFService: renderText called with properties:`, JSON.stringify(properties, null, 2));
    
    try {
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const color = this.hexToRgb(properties.color || '#000000');
      
      // Convert Polish characters to ASCII-safe equivalents
      const safeContent = this.convertPolishChars(properties.content || '');
      logger.info(`PDFService: Drawing text: "${safeContent}" at position (${x}, ${y})`);
      
      page.drawText(safeContent, {
        x,
        y: y, // Use direct Y coordinate without flipping
        size: properties.fontSize || 12,
        font,
        color: rgb(color.r / 255, color.g / 255, color.b / 255)
      });
      
      logger.info('PDFService: Text drawn successfully');
    } catch (error) {
      logger.error('PDFService: Error in renderText:', error);
      throw error;
    }
  }

  // ✅ USUNIĘTO: renderWineGrid - zastąpiona przez system elementów product-list
  // Legacy fallback został zastąpiony przez prosty komunikat o braku elementów

  private hexToRgb(hex: string): { r: number; g: number; b: number } {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1] || '0', 16),
      g: parseInt(result[2] || '0', 16),
      b: parseInt(result[3] || '0', 16)
    } : { r: 0, g: 0, b: 0 };
  }

  private async renderBackgroundImage(page: any, imagePath: string, width: number, height: number, pdfDoc: any): Promise<void> {
    try {
      logger.info(`PDFService: Loading background image from: ${imagePath}`);
      
      const absolutePath = path.join(process.cwd(), 'public', imagePath.replace(/^\//, ''));
      logger.info(`PDFService: Loading background image from absolute path: ${absolutePath}`);
      
      const imageBytes = fsSync.readFileSync(absolutePath);
      
      let pdfImage;
      if (imagePath.toLowerCase().endsWith('.jpg') || imagePath.toLowerCase().endsWith('.jpeg')) {
        pdfImage = await pdfDoc.embedJpg(imageBytes);
      } else if (imagePath.toLowerCase().endsWith('.png')) {
        pdfImage = await pdfDoc.embedPng(imageBytes);
      } else {
        throw new Error(`Unsupported image format for background: ${imagePath}`);
      }

      // Draw the background image to fill the entire page
      page.drawImage(pdfImage, {
        x: 0,
        y: 0,
        width: width,
        height: height,
      });
      
      logger.info(`PDFService: Background image drawn successfully at (0, 0) with size ${width}x${height}`);
    } catch (error) {
      logger.error(`PDFService: Failed to render background image ${imagePath}: ${error}`);
      throw error;
    }
  }

  /**
   * Convert Polish characters to ASCII-safe equivalents for PDF rendering
   */
  private convertPolishChars(text: string): string {
    const polishChars: { [key: string]: string } = {
      'ą': 'a',
      'ć': 'c', 
      'ę': 'e',
      'ł': 'l',
      'ń': 'n',
      'ó': 'o',
      'ś': 's',
      'ź': 'z',
      'ż': 'z',
      'Ą': 'A',
      'Ć': 'C',
      'Ę': 'E',
      'Ł': 'L',
      'Ń': 'N',
      'Ó': 'O',
      'Ś': 'S',
      'Ź': 'Z',
      'Ż': 'Z'
    };

    return text.replace(/[ąćęłńóśźżĄĆĘŁŃÓŚŹŻ]/g, (char) => polishChars[char] || char);
  }

  /**
   * Convert canvas pixel coordinates to PDF points
   */
  private convertCanvasCoordinatesToPDF(element: any, template: PDFTemplate) {
    const printSettings = template.printSettings;
    const format = printSettings.format;
    const dpi = printSettings.dpi;

    // Get PDF page dimensions in points
    const pdfDimensions = this.getPageDimensions(format);
    
    // Canvas dimensions in pixels at given DPI
    const mmToPx = dpi / 25.4; // Conversion factor from mm to pixels
    const canvasWidthPx = format.width * mmToPx;
    const canvasHeightPx = format.height * mmToPx;
    
    // Determine element dimensions based on sizeUnit
    let elementWidth = element.width;
    let elementHeight = element.height;
    let elementX = element.x;
    let elementY = element.y;

    if (element.sizeUnit === 'mm' && element.widthMm && element.heightMm) {
      // Convert mm dimensions to pixels for consistency
      elementWidth = element.widthMm * mmToPx;
      elementHeight = element.heightMm * mmToPx;
      logger.info(`PDFService: Using mm units - widthMm=${element.widthMm}, heightMm=${element.heightMm}`);
      logger.info(`PDFService: Converted to pixels - width=${elementWidth}, height=${elementHeight}`);
    }
    
    // Convert pixel coordinates to PDF points
    const scaleX = pdfDimensions.width / canvasWidthPx;
    const scaleY = pdfDimensions.height / canvasHeightPx;
    
    // Convert coordinates (flip Y axis for PDF coordinate system)
    const pdfX = elementX * scaleX;
    const pdfY = pdfDimensions.height - (elementY * scaleY) - (elementHeight * scaleY);
    const pdfWidth = elementWidth * scaleX;
    const pdfHeight = elementHeight * scaleY;

    logger.info(`PDFService: Coordinate conversion details:`);
    logger.info(`  - PDF dimensions: ${pdfDimensions.width} x ${pdfDimensions.height} points`);
    logger.info(`  - Canvas dimensions: ${canvasWidthPx} x ${canvasHeightPx} pixels`);
    logger.info(`  - Scale factors: ${scaleX} x ${scaleY}`);
    logger.info(`  - Original: (${element.x}, ${element.y}) ${element.width}x${element.height} px`);
    logger.info(`  - Element unit: ${element.sizeUnit || 'px'}, effective: (${elementX}, ${elementY}) ${elementWidth}x${elementHeight} px`);
    logger.info(`  - Converted: (${pdfX}, ${pdfY}) ${pdfWidth}x${pdfHeight} points`);

    return {
      x: pdfX,
      y: pdfY,
      width: pdfWidth,
      height: pdfHeight
    };
  }

  /**
   * Render a rectangle element
   */
  private async renderRectangle(
    page: any,
    x: number,
    y: number,
    width: number,
    height: number,
    properties: any
  ): Promise<void> {
    logger.info(`PDFService: renderRectangle called with properties:`, JSON.stringify(properties, null, 2));
    
    try {
      const backgroundColor = this.hexToRgb(properties.backgroundColor || '#cccccc');
      const borderColor = this.hexToRgb(properties.borderColor || '#000000');
      const borderWidth = properties.borderWidth || 0;
      
      // Draw background
      page.drawRectangle({
        x: x,
        y: y,
        width: width,
        height: height,
        color: rgb(backgroundColor.r / 255, backgroundColor.g / 255, backgroundColor.b / 255)
      });
      
      // Draw border if specified
      if (borderWidth > 0) {
        page.drawRectangle({
          x: x,
          y: y,
          width: width,
          height: height,
          borderColor: rgb(borderColor.r / 255, borderColor.g / 255, borderColor.b / 255),
          borderWidth: borderWidth
        });
      }
      
      logger.info(`PDFService: Rectangle drawn at (${x}, ${y}) with size ${width}x${height}`);
    } catch (error) {
      logger.error('PDFService: Error rendering rectangle:', error);
      throw error;
    }
  }

  /**
   * Render an image element
   */
  private async renderImage(
    page: any,
    x: number,
    y: number,
    width: number,
    height: number,
    properties: any,
    pdfDoc: any
  ): Promise<void> {
    logger.info(`PDFService: renderImage called with properties:`, JSON.stringify(properties, null, 2));
    
    try {
      const imageUrl = properties.src;
      if (!imageUrl || !imageUrl.trim()) {
        logger.warn('PDFService: No image URL provided, skipping image rendering');
        return;
      }

      logger.info(`PDFService: Loading image from: ${imageUrl}`);
      
      let imageBytes: Uint8Array;
      
      if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
        // Load image from URL
        imageBytes = await this.loadImageFromUrl(imageUrl);
      } else {
        // Load local image file
        imageBytes = await this.loadLocalImage(imageUrl);
      }

      if (!imageBytes) {
        logger.warn('PDFService: Failed to load image, drawing placeholder');
        await this.drawImagePlaceholder(page, x, y, width, height, pdfDoc);
        return;
      }

      // Embed the image in the PDF
      let embeddedImage;
      const imageExtension = this.getImageExtension(imageUrl);
      
      if (imageExtension === 'png') {
        embeddedImage = await pdfDoc.embedPng(imageBytes);
      } else if (imageExtension === 'jpg' || imageExtension === 'jpeg') {
        embeddedImage = await pdfDoc.embedJpg(imageBytes);
      } else {
        logger.warn(`PDFService: Unsupported image format: ${imageExtension}, drawing placeholder`);
        await this.drawImagePlaceholder(page, x, y, width, height, pdfDoc);
        return;
      }

      // Calculate scaling to maintain aspect ratio if objectFit is 'contain'
      const objectFit = properties.objectFit || 'cover';
      let drawWidth = width;
      let drawHeight = height;
      let drawX = x;
      let drawY = y;

      if (objectFit === 'contain') {
        const imageAspectRatio = embeddedImage.width / embeddedImage.height;
        const targetAspectRatio = width / height;

        if (imageAspectRatio > targetAspectRatio) {
          // Image is wider, fit to width
          drawHeight = width / imageAspectRatio;
          drawY = y + (height - drawHeight) / 2;
        } else {
          // Image is taller, fit to height
          drawWidth = height * imageAspectRatio;
          drawX = x + (width - drawWidth) / 2;
        }
      }

      // Draw the image
      page.drawImage(embeddedImage, {
        x: drawX,
        y: drawY,
        width: drawWidth,
        height: drawHeight
      });
      
      logger.info(`PDFService: Image rendered successfully at (${drawX}, ${drawY}) with size ${drawWidth}x${drawHeight}`);
    } catch (error) {
      logger.error('PDFService: Error rendering image:', error);
      // Draw placeholder on error
      await this.drawImagePlaceholder(page, x, y, width, height, pdfDoc);
    }
  }

  /**
   * Draws a placeholder rectangle when image loading fails
   */
  private async drawImagePlaceholder(page: any, x: number, y: number, width: number, height: number, pdfDoc: any): Promise<void> {
    const placeholderColor = this.hexToRgb('#e0e0e0');
    
    page.drawRectangle({
      x: x,
      y: y,
      width: width,
      height: height,
      color: rgb(placeholderColor.r / 255, placeholderColor.g / 255, placeholderColor.b / 255),
      borderColor: rgb(0.8, 0.8, 0.8),
      borderWidth: 1
    });
    
    // Add "IMAGE" text placeholder
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    page.drawText('IMAGE', {
      x: x + width / 2 - 15,
      y: y + height / 2 - 5,
      size: 10,
      font,
      color: rgb(0.6, 0.6, 0.6)
    });
    
    logger.info(`PDFService: Image placeholder drawn at (${x}, ${y}) with size ${width}x${height}`);
  }

  /**
   * Loads image from URL
   */
  private async loadImageFromUrl(url: string): Promise<Uint8Array> {
    return new Promise((resolve, reject) => {
      const protocol = url.startsWith('https:') ? https : http;
      
      protocol.get(url, (response) => {
        if (response.statusCode !== 200) {
          reject(new Error(`HTTP ${response.statusCode}: ${response.statusMessage}`));
          return;
        }

        const chunks: Buffer[] = [];
        response.on('data', (chunk) => chunks.push(chunk));
        response.on('end', () => {
          const buffer = Buffer.concat(chunks);
          resolve(new Uint8Array(buffer));
        });
      }).on('error', reject);
    });
  }

  /**
   * Loads local image file
   */
  private async loadLocalImage(imagePath: string): Promise<Uint8Array> {
    try {
      // Convert relative path to absolute path
      let fullPath: string;
      
      if (imagePath.startsWith('/images/')) {
        // Path from public folder
        fullPath = path.join(process.cwd(), 'public', imagePath);
      } else if (imagePath.startsWith('./') || imagePath.startsWith('../')) {
        // Relative path
        fullPath = path.resolve(imagePath);
      } else {
        // Assume it's a path relative to public folder
        fullPath = path.join(process.cwd(), 'public', imagePath);
      }

      logger.info(`PDFService: Loading local image from: ${fullPath}`);
      
      const buffer = await fs.readFile(fullPath);
      return new Uint8Array(buffer);
    } catch (error) {
      logger.error(`PDFService: Error loading local image ${imagePath}:`, error);
      throw error;
    }
  }

  /**
   * Gets file extension from image path/URL
   */
  private getImageExtension(imagePath: string): string {
    const extension = path.extname(imagePath).toLowerCase().replace('.', '');
    return extension;
  }

  /**
   * 🎯 SINGLE SOURCE OF TRUTH - Merge product list configuration
   * Hierarchia: Element Properties > Template Defaults > System Defaults
   */
  private getProductListConfig(
    elementProps: any,
    template: PDFTemplate
  ): ProductListLayoutConfig {
    // ✅ Template nie ma już duplikujących się właściwości layoutu
    // Wszystkie konfiguracje pochodzą z elementów product-list lub domyślnych wartości

    // Element properties (zunifikowane nazwy właściwości)
    const elementConfig: Partial<ProductListLayoutConfig> = {
      columns: elementProps.columns,
      rowsPerPage: elementProps.rowsPerPage,
      displayMode: elementProps.displayMode,
      itemSpacing: elementProps.itemSpacing,
      showImages: elementProps.showImages,
      showPrices: elementProps.showPrices,
      showDescriptions: elementProps.showDescriptions,
      fontSize: elementProps.fontSize,
      fontFamily: elementProps.fontFamily,
      textColor: elementProps.textColor,
      headerText: elementProps.headerText,
      showHeader: elementProps.showHeader,
      headerFontSize: elementProps.headerFontSize,
      headerColor: elementProps.headerColor
    };

    // ✅ Scalaj konfigurację według hierarchii: Element > System Defaults (bez template)
    const mergedConfig = mergeProductListConfig(elementConfig);
    return validateProductListConfig(mergedConfig);
  }

  /**
   * Render product list element
   */
  private async renderProductList(
    page: any,
    x: number,
    y: number,
    width: number,
    height: number,
    props: any,
    context: any,
    pdfDoc: any,
    template: any,
    dataStore: DataStore
  ): Promise<void> {
    logger.info('PDFService: renderProductList called with props:', props);

    try {
      // 🎯 NOWA LOGIKA: Użyj zunifikowanej konfiguracji
      const config = this.getProductListConfig(props, template);
      logger.info('PDFService: Merged product list config:', config);

      // Get wines from collection if specified
      let wines: any[] = [];
      if (props.collectionId && props.collectionId !== 'undefined' && props.collectionId !== '') {
        const collection = dataStore.getCollection(props.collectionId);
        if (collection && collection.wines && collection.wines.length > 0) {
          wines = dataStore.getWinesByCatalogNumbers(collection.wines);
          logger.info(`PDFService: Found ${wines.length} wines in collection ${props.collectionId}`);
        } else {
          logger.warn(`PDFService: Collection ${props.collectionId} not found or has no wines`);
        }
      } else {
        logger.info('PDFService: No collection specified, using sample data');
        // Use sample data for preview
        wines = [
          { name: 'Przykładowe wino 1', price1: '29.99', description: 'Opis produktu...' },
          { name: 'Przykładowe wino 2', price1: '39.99', description: 'Opis produktu...' },
          { name: 'Przykładowe wino 3', price1: '49.99', description: 'Opis produktu...' },
          { name: 'Przykładowe wino 4', price1: '59.99', description: 'Opis produktu...' }
        ];
      }

      // Render header if enabled
      let currentY = y;
      if (config.showHeader && config.headerText) {
        const headerProps = {
          content: config.headerText,
          fontSize: config.headerFontSize || 14,
          fontFamily: config.fontFamily || 'Arial',
          fontWeight: 'bold',
          color: config.headerColor || '#000000',
          textAlign: 'center',
          lineHeight: 1.2
        };
        
        const headerHeight = (config.headerFontSize || 14) + 10;
        await this.renderText(page, x, currentY, width, headerHeight, headerProps, context, pdfDoc);
        currentY += headerHeight + (config.itemSpacing || 10);
      }

      // Calculate layout with intelligent sizing
      const columns = config.columns || 2;
      let rowsPerPage = Math.min(config.rowsPerPage || 10, wines.length);
      const itemSpacing = config.itemSpacing || 10;
      const itemWidth = (width - (columns - 1) * itemSpacing) / columns;
      const remainingHeight = height - (currentY - y);
      
      // Minimum item height for readability
      const minItemHeight = 30; // minimum 30 points for readable content
      
      // Calculate maximum possible rows that fit with minimum height
      const maxPossibleRows = Math.floor((remainingHeight + itemSpacing) / (minItemHeight + itemSpacing));
      
      // Adjust rows per page if needed
      if (maxPossibleRows < rowsPerPage) {
        rowsPerPage = Math.max(1, maxPossibleRows); // At least 1 row
        logger.info(`PDFService: Adjusted rowsPerPage from ${config.rowsPerPage || 10} to ${rowsPerPage} due to space constraints`);
      }
      
      // Calculate actual item height
      const itemHeight = Math.max(minItemHeight, (remainingHeight - (rowsPerPage - 1) * itemSpacing) / rowsPerPage);

      logger.info(`PDFService: Layout calculations:
        - Total width: ${width}, height: ${height}
        - Columns: ${columns}, Rows per page: ${rowsPerPage} (requested: ${config.rowsPerPage || 10})
        - CurrentY: ${currentY}, Y start: ${y}
        - Remaining height: ${remainingHeight}
        - Item width: ${itemWidth}, Item height: ${itemHeight} (min: ${minItemHeight})
        - Item spacing: ${itemSpacing}
        - Max possible rows: ${maxPossibleRows}`);

      // Validate dimensions
      if (itemWidth <= 0 || itemHeight <= 0) {
        logger.warn(`PDFService: Invalid item dimensions - width: ${itemWidth}, height: ${itemHeight}. Skipping product list rendering.`);
        return;
      }

      // Render products
      let itemIndex = 0;
      for (let row = 0; row < rowsPerPage && itemIndex < wines.length; row++) {
        for (let col = 0; col < columns && itemIndex < wines.length; col++) {
          const wine = wines[itemIndex];
          const itemX = x + col * (itemWidth + (config.itemSpacing || 10));
          const itemY = currentY + row * (itemHeight + (config.itemSpacing || 10));

          // Render product item
          await this.renderProductItem(page, itemX, itemY, itemWidth, itemHeight, wine, config, context, pdfDoc);
          itemIndex++;
        }
      }

      logger.info(`PDFService: Rendered ${itemIndex} products in list`);
    } catch (error) {
      logger.error('PDFService: Error rendering product list:', error);
      throw error;
    }
  }

  /**
   * Render single product item
   */
  private async renderProductItem(
    page: any,
    x: number,
    y: number,
    width: number,
    height: number,
    wine: any,
    config: ProductListLayoutConfig,
    context: any,
    pdfDoc: any
  ): Promise<void> {
    try {
      // Render border
      const rectProps = {
        backgroundColor: 'transparent',
        borderWidth: 0.5,
        borderColor: '#dddddd'
      };
      await this.renderRectangle(page, x, y, width, height, rectProps);

      let currentY = y + 5;
      const contentWidth = width - 10;

      logger.info(`PDFService: renderProductItem dimensions - x=${x}, y=${y}, width=${width}, height=${height}, contentWidth=${contentWidth}`);

      // Get fields to display - use displayFields if available, otherwise fallback to old system
      const fieldsToDisplay = config.displayFields || [];
      const showOldImages = config.showImages && !fieldsToDisplay.length; // Fallback compatibility
      const showOldDescriptions = config.showDescriptions && !fieldsToDisplay.length;
      const showOldPrices = config.showPrices && !fieldsToDisplay.length;

      // LEGACY: Render image if old system is used
      if (showOldImages) {
        logger.info(`PDFService: renderProductItem - legacy showImages=${config.showImages}, wine.image=${wine.image || 'undefined'}`);
        const imageHeight = height * 0.4;
        if (wine.image) {
          try {
            const imageProps = { src: wine.image, objectFit: 'cover' };
            await this.renderImage(page, x + 5, currentY, contentWidth, imageHeight, imageProps, pdfDoc);
          } catch (error) {
            logger.warn('PDFService: Could not render wine image, using placeholder');
            const placeholderProps = {
              backgroundColor: '#f0f0f0',
              borderWidth: 1,
              borderColor: '#cccccc'
            };
            await this.renderRectangle(page, x + 5, currentY, contentWidth, imageHeight, placeholderProps);
          }
        } else {
          const placeholderProps = {
            backgroundColor: '#f0f0f0',
            borderWidth: 1,
            borderColor: '#cccccc'
          };
          await this.renderRectangle(page, x + 5, currentY, contentWidth, imageHeight, placeholderProps);
        }
        currentY += imageHeight + 5;
      }

      // NEW: Dynamic fields rendering system
      if (fieldsToDisplay.length > 0) {
        logger.info(`PDFService: renderProductItem - dynamic fields: ${fieldsToDisplay.join(', ')}`);
        
        // Special handling for image field if it's in displayFields
        if (fieldsToDisplay.includes('image') && wine.image) {
          const imageHeight = height * 0.3;
          try {
            const imageProps = { src: wine.image, objectFit: 'cover' };
            await this.renderImage(page, x + 5, currentY, contentWidth, imageHeight, imageProps, pdfDoc);
          } catch (error) {
            logger.warn('PDFService: Could not render wine image');
          }
          currentY += imageHeight + 3;
        }

        // Render all other selected fields
        for (const fieldName of fieldsToDisplay) {
          if (fieldName === 'image') continue; // Already handled above
          
          const fieldValue = wine[fieldName];
          if (!fieldValue && fieldValue !== 0) continue; // Skip empty values
          
          // Determine field styling based on field type
          let fontWeight = 'normal';
          let fontSize = (config.fontSize || 10) - 1;
          let color = config.textColor || '#000000';
          
          if (fieldName === 'name') {
            fontWeight = 'bold';
            fontSize = config.fontSize || 10;
          } else if (fieldName === 'catalogNumber') {
            color = '#666666';
            fontSize = (config.fontSize || 10) - 1;
          } else if (fieldName.includes('price')) {
            fontWeight = 'bold';
            color = '#dc3545';
            fontSize = config.fontSize || 10;
          }

          // Format field value for display
          let displayValue = fieldValue.toString();
          if (fieldName === 'description' && displayValue.length > 60) {
            displayValue = displayValue.substring(0, 60) + '...';
          }

          // Render field
          const fieldProps = {
            content: displayValue,
            fontSize: fontSize,
            fontFamily: config.fontFamily || 'Arial',
            fontWeight: fontWeight,
            color: color,
            textAlign: 'left',
            lineHeight: 1.1
          };
          
          const fieldHeight = fontSize + 1;
          await this.renderText(page, x + 5, currentY, contentWidth, fieldHeight, fieldProps, context, pdfDoc);
          currentY += fieldHeight + 1;
        }
      } else {
        // LEGACY: Old field rendering system for backward compatibility
        // Render wine name (always shown)
        if (wine.name) {
          const nameProps = {
            content: wine.name,
            fontSize: config.fontSize || 10,
            fontFamily: config.fontFamily || 'Arial',
            fontWeight: 'bold',
            color: config.textColor || '#000000',
            textAlign: 'center',
            lineHeight: 1.2
          };
          const nameHeight = (config.fontSize || 10) + 2;
          await this.renderText(page, x + 5, currentY, contentWidth, nameHeight, nameProps, context, pdfDoc);
          currentY += nameHeight + 2;
        }

        // Render description if enabled (legacy)
        if (showOldDescriptions && wine.description) {
          const descProps = {
            content: wine.description.substring(0, 50) + (wine.description.length > 50 ? '...' : ''),
            fontSize: (config.fontSize || 10) - 1,
            fontFamily: config.fontFamily || 'Arial',
            fontWeight: 'normal',
            color: '#666666',
            textAlign: 'center',
            lineHeight: 1.1
          };
          const descHeight = ((config.fontSize || 10) - 1) * 2;
          await this.renderText(page, x + 5, currentY, contentWidth, descHeight, descProps, context, pdfDoc);
          currentY += descHeight + 2;
        }

        // Render price if enabled (legacy)
        if (showOldPrices) {
          const priceText = wine.price || wine.priceText || '0,00 zł';
          const priceProps = {
            content: priceText,
            fontSize: config.fontSize || 10,
            fontFamily: config.fontFamily || 'Arial',
            fontWeight: 'bold',
            color: '#dc3545',
            textAlign: 'center',
            lineHeight: 1.2
          };
          const priceHeight = config.fontSize || 10;
          await this.renderText(page, x + 5, currentY, contentWidth, priceHeight, priceProps, context, pdfDoc);
        }
      }

    } catch (error) {
      logger.error('PDFService: Error rendering product item:', error);
      // Continue with next item instead of failing completely
    }
  }

  /**
   * Generuje PDF z szablonu HTML za pomocą Puppeteer
   * @param htmlTemplate - Ścieżka do pliku HTML lub zawartość HTML jako string
   * @param wineData - Dane wina do wstrzyknięcia w szablon
   * @param options - Opcje generowania PDF
   * @returns Buffer z wygenerowanym PDF
   */
  async generatePDFFromHTML(
    htmlTemplate: string,
    wineData?: Wine,
    options: {
      format?: string; // Now accepts custom format IDs
      customFormat?: import('../types').CustomPDFFormat;
      width?: string;
      height?: string;
      margin?: {
        top?: string;
        right?: string;
        bottom?: string;
        left?: string;
      };
      printBackground?: boolean;
      displayHeaderFooter?: boolean;
    } = {}
  ): Promise<Buffer> {
    let browser;
    
    try {
      logger.info('PDFService: Starting HTML to PDF generation with Puppeteer');
      
      // Uruchom przeglądarkę
      browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
      
      const page = await browser.newPage();
      
      // Sprawdź czy htmlTemplate to ścieżka do pliku czy bezpośrednia zawartość HTML
      let htmlContent: string;
      
      // Improved detection: Check if it's a file path or direct HTML content
      // HTML content indicators: starts with tags, DOCTYPE, or contains shortcodes
      const isDirectHTML = 
        htmlTemplate.includes('<html') || 
        htmlTemplate.includes('<!DOCTYPE') ||
        htmlTemplate.trim().startsWith('<') ||
        htmlTemplate.includes('[component') || // Shortcode indicator
        htmlTemplate.includes('{{'); // Handlebars/mustache template indicator
      
      if (isDirectHTML) {
        // To jest bezpośrednia zawartość HTML
        htmlContent = htmlTemplate;
      } else {
        // To jest ścieżka do pliku
        const templatePath = path.isAbsolute(htmlTemplate) 
          ? htmlTemplate 
          : path.join(process.cwd(), 'data', htmlTemplate);
        
        htmlContent = await fs.readFile(templatePath, 'utf-8');
      }
      
      // Wstrzyknij dane wina jeśli zostały dostarczone
      if (wineData) {
        htmlContent = this.injectWineDataToHTML(htmlContent, wineData);
      }
      
      // 🎨 Process component shortcodes AFTER data injection
      htmlContent = await this.processShortcodes(htmlContent);
      
      // Ustaw zawartość HTML na stronie
      await page.setContent(htmlContent, { 
        waitUntil: ['networkidle0', 'domcontentloaded'] 
      });
      
      // Konfiguracja domyślna dla PDF
      const pdfOptions: any = {
        printBackground: options.printBackground !== false,
        displayHeaderFooter: options.displayHeaderFooter || false,
        preferCSSPageSize: true
      };
      
      // Set margins only if provided (don't set default 0mm for custom formats)
      if (options.margin) {
        pdfOptions.margin = {
          top: '0mm',
          right: '0mm', 
          bottom: '0mm',
          left: '0mm',
          ...options.margin
        };
      }

      // Handle custom format or use standard format
      if (options.customFormat) {
        // Use custom format dimensions
        const format = options.customFormat;
        pdfOptions.width = `${format.width}${format.unit}`;
        pdfOptions.height = `${format.height}${format.unit}`;
        
        // Apply custom margins if not overridden
        if (!options.margin) {
          pdfOptions.margin = {
            top: `${format.margins.top}${format.unit}`,
            right: `${format.margins.right}${format.unit}`,
            bottom: `${format.margins.bottom}${format.unit}`,
            left: `${format.margins.left}${format.unit}`
          };
        }
      } else {
        // Use standard format (A4, A5, Letter) or fallback to A5
        pdfOptions.format = this.getStandardFormat(options.format) || 'A4';
      }
      
      // Dodaj wymiary jeśli zostały podane
      if (options.width) {
        pdfOptions.width = options.width;
      }
      if (options.height) {
        pdfOptions.height = options.height;
      }
      
      logger.info(`PDFService: Generating PDF with options:`, pdfOptions);
      
      // Generuj PDF
      const pdfBuffer = await page.pdf(pdfOptions);
      
      logger.info('PDFService: HTML to PDF generation completed successfully');
      
      return Buffer.from(pdfBuffer);
      
    } catch (error) {
      logger.error('PDFService: Error generating PDF from HTML:', error);
      throw new Error(`Failed to generate PDF from HTML: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }

  /**
   * Wstrzykuje dane wina do szablonu HTML
   * @param htmlContent - Zawartość HTML
   * @param wineData - Dane wina
   * @returns HTML z wstrzykniętymi danymi
   */
  private injectWineDataToHTML(htmlContent: string, wineData: Wine): string {
    let processedHTML = htmlContent;
    // ✅ Strip Handlebars comments (your engine doesn't support them, they print into PDF)
processedHTML = processedHTML.replace(/\{\{!--[\s\S]*?--\}\}/g, '');

    
    try {
      // Rzutowanie na Record<string, any> dla dostępu do dynamicznych pól
      const wineRecord = wineData as Record<string, any>;
      
      // Podstawowe zastąpienia danych wina (używając znanej struktury Wine)
      const basicReplacements = {
        '{{wine.name}}': wineData.name || '',
        '{{wine.catalogNumber}}': wineData.catalogNumber || '',
        '{{wine.description}}': wineData.description || '',
        '{{wine.type}}': wineData.type || '',
        '{{wine.category}}': wineData.category || '',
        '{{wine.variety}}': wineData.variety || '',
        '{{wine.region}}': wineData.region || '',
        '{{wine.alcohol}}': wineData.alcohol || '',
        '{{wine.abv}}': wineData.abv?.toString() || '',
        '{{wine.price1}}': wineData.price1 || '',
        '{{wine.price2}}': wineData.price2 || '',
        '{{wine.image}}': wineData.image || ''
      };
      
      // Zastąp podstawowe pola
      for (const [placeholder, value] of Object.entries(basicReplacements)) {
        const regex = new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
        processedHTML = processedHTML.replace(regex, value);
      }
      
      // Obsługa dynamicznych pól win - zastąp wszystkie pozostałe placeholdery {{wine.xxx}}
      processedHTML = processedHTML.replace(/\{\{wine\.(\w+)\}\}/g, (match, fieldName) => {
        const fieldValue = wineRecord[fieldName];
        return fieldValue !== undefined ? fieldValue.toString() : '';
      });
      
      logger.info('PDFService: Wine data injected successfully into HTML template');
      
    } catch (error) {
      logger.error('PDFService: Error injecting wine data into HTML:', error);
      // Zwróć oryginalny HTML w przypadku błędu
    }
    
    return processedHTML;
  }

  /**
   * 🔄 Przetwarza markery dynamicznego klonowania (DYNAMIC_TEMPLATE)
   * Pobiera szablon HTML po ID i wstawia jego zawartość
   * @param html - HTML z markerami DYNAMIC_TEMPLATE
   * @returns HTML z wstawioną zawartością szablonu
   */
  private async processDynamicTemplateMarkers(html: string): Promise<string> {
    // Regex do znajdowania markerów: <!--DYNAMIC_TEMPLATE:templateId-->
    const markerRegex = /<!--DYNAMIC_TEMPLATE:([^>]+)-->/g;
    
    let processed = html;
    const matches = Array.from(html.matchAll(markerRegex));
    
    // Przetwórz każdy marker async
    for (const match of matches) {
      const fullMatch = match[0];
      const templateId = match[1];
      
      // Sprawdź czy templateId jest poprawny
      if (!templateId || templateId.trim() === '') {
        logger.warn('PDFService: Dynamic container - empty template ID in marker');
        processed = processed.replace(fullMatch, '<!-- Pusty ID szablonu HTML -->');
        continue;
      }
      
      try {
        // 🎯 POPRAWIONE: Używamy HTML templates z DataStore, NIE PDF templates!
        const template = this.dataStore.getHTMLTemplate(templateId);
        
        if (template && template.htmlContent) {
          // Wstaw zawartość szablonu HTML
          processed = processed.replace(fullMatch, template.htmlContent);
          logger.info(`PDFService: Dynamic container - inserted HTML template "${template.name}" (ID: ${templateId})`);
        } else {
          // Szablon nie znaleziony
          const fallbackHtml = `<!-- Szablon HTML o ID "${templateId}" nie został znaleziony -->`;
          processed = processed.replace(fullMatch, fallbackHtml);
          logger.warn(`PDFService: Dynamic container - HTML template ID ${templateId} not found`);
        }
      } catch (error) {
        logger.error(`PDFService: Error loading HTML template ${templateId}:`, error);
        const errorHtml = `<!-- Błąd ładowania szablonu HTML "${templateId}" -->`;
        processed = processed.replace(fullMatch, errorHtml);
      }
    }
    
    return processed;
  }

  /**
   * 🎨 Przetwarza shortcode'y komponentów HTML na rzeczywisty HTML
   * Konwertuje: [component type="text" ...] → <span>...</span>
   * @param html - HTML z shortcode'ami
   * @returns HTML z rozwiniętymi komponentami
   */
  private async processShortcodes(html: string): Promise<string> {
    logger.info('PDFService: Processing component shortcodes...');
    let processed = html;
    
    // Helper function to parse attributes from shortcode
    const parseAttributes = (match: string): Record<string, string> => {
      const attrs: Record<string, string> = {};
      const attrRegex = /(\w+)="([^"]*)"/g;
      let attrMatch: RegExpExecArray | null;
      while ((attrMatch = attrRegex.exec(match)) !== null) {
        // TypeScript: use Array destructuring to satisfy type checker
        const [, key, value] = attrMatch;
        if (key && value !== undefined) {
          attrs[key] = value;
        }
      }
      return attrs;
    };
    
    // Process TEXT components: [component type="text" ...]
    processed = processed.replace(
      /\[component[^\]]*type="text"[^\]]*\]/g,
      (match) => {
        const attrs = parseAttributes(match);
        const id = attrs.id || 'text_' + Date.now();
        const value = attrs.value || '';
        const className = attrs.class || '';
        const tag = attrs.tag || 'span';
        const style = attrs.style || '';
        
        const cssClass = className ? ` class="${className}"` : '';
        const cssStyle = style ? ` style="${style}"` : '';
        return `<${tag} id="${id}"${cssClass}${cssStyle}>${value}</${tag}>`;
      }
    );
    
    // Process IMAGE components: [component type="image" ...]
    processed = processed.replace(
      /\[component[^\]]*type="image"[^\]]*\]/g,
      (match) => {
        const attrs = parseAttributes(match);
        const id = attrs.id || 'img_' + Date.now();
        const src = attrs.src || '';
        const alt = attrs.alt || '';
        const width = attrs.width || '';
        const height = attrs.height || '';
        const objectFit = attrs.objectFit || '';
        const className = attrs.class || '';
        
        const cssClass = className ? ` class="${className}"` : '';
        const widthAttr = width ? ` width="${width}"` : '';
        const heightAttr = height ? ` height="${height}"` : '';
        const objectFitStyle = objectFit ? ` style="object-fit: ${objectFit}"` : '';
        
        return `<img id="${id}" src="${src}" alt="${alt}"${widthAttr}${heightAttr}${cssClass}${objectFitStyle}>`;
      }
    );
    
    // Process CONTAINER components: [component type="container" ...]
    processed = processed.replace(
      /\[component[^\]]*type="container"[^\]]*\]/g,
      (match) => {
        const attrs = parseAttributes(match);
        const id = attrs.id || 'container_' + Date.now();
        const containerType = attrs.containerType || 'div';
        const className = attrs.class || '';
        
        // Build inline styles from attributes
        const inlineStyles: string[] = [];
        if (attrs.width) inlineStyles.push(`width: ${attrs.width}`);
        if (attrs.height) inlineStyles.push(`height: ${attrs.height}`);
        if (attrs.padding) inlineStyles.push(`padding: ${attrs.padding}`);
        if (attrs.background) inlineStyles.push(`background: ${attrs.background}`);
        if (attrs.border) inlineStyles.push(`border: ${attrs.border}`);
        if (attrs.style) inlineStyles.push(attrs.style);
        
        const cssClass = className ? ` class="${className}"` : '';
        const cssStyle = inlineStyles.length > 0 ? ` style="${inlineStyles.join('; ')}"` : '';
        
        return `<${containerType} id="${id}"${cssClass}${cssStyle}></${containerType}>`;
      }
    );
    
    // Process TABLE components: [component type="table" ...]
    processed = processed.replace(
      /\[component[^\]]*type="table"[^\]]*\]/g,
      (match) => {
        const attrs = parseAttributes(match);
        const id = attrs.id || 'table_' + Date.now();
        const rows = parseInt(attrs.rows || '3') || 3;
        const cols = parseInt(attrs.columns || attrs.cols || '3') || 3; // Support both 'columns' and 'cols'
        const hasHeaders = attrs.headers === 'true';
        const className = attrs.class || '';
        
        const cssClass = className ? ` class="${className}"` : '';
        
        let tableHTML = `<table id="${id}"${cssClass}>`;
        
        if (hasHeaders) {
          tableHTML += '<thead><tr>';
          for (let c = 0; c < cols; c++) {
            tableHTML += `<th>Nagłówek ${c + 1}</th>`;
          }
          tableHTML += '</tr></thead>';
        }
        
        tableHTML += '<tbody>';
        for (let r = 0; r < rows; r++) {
          tableHTML += '<tr>';
          for (let c = 0; c < cols; c++) {
            tableHTML += `<td>Komórka ${r + 1},${c + 1}</td>`;
          }
          tableHTML += '</tr>';
        }
        tableHTML += '</tbody></table>';
        
        return tableHTML;
      }
    );
    
    // Process DYNAMIC CONTAINER components: [component type="dynamicContainer" ...]
    // This component embeds the content of another template by ID
    processed = processed.replace(
      /\[component[^\]]*type="dynamicContainer"[^\]]*\]/g,
      (match) => {
        const attrs = parseAttributes(match);
        const id = attrs.id || 'dynamic_' + Date.now();
        const templateId = attrs.templateId || '';
        const wrapperTag = attrs.wrapperTag || 'div';
        const className = attrs.class || '';
        const style = attrs.style || '';
        
        if (!templateId) {
          return `<${wrapperTag} id="${id}" class="dynamic-container-error" style="color: red; border: 1px solid red; padding: 10px;">⚠️ Error: templateId is required for dynamicContainer</${wrapperTag}>`;
        }
        
        // Build wrapper attributes
        const cssClass = className ? ` class="${className}"` : '';
        const inlineStyle = style ? ` style="${style}"` : '';
        
        // Use a special marker that will be replaced in a second pass
        // Format: <!--DYNAMIC_TEMPLATE:templateId-->
        const marker = `<!--DYNAMIC_TEMPLATE:${templateId}-->`;
        
        return `<${wrapperTag} id="${id}"${cssClass}${inlineStyle}>${marker}</${wrapperTag}>`;
      }
    );
    
    // Second pass: Process DYNAMIC_TEMPLATE markers
    // This needs to be done AFTER all other shortcodes are processed
    // so we can fetch templates and embed their content
    processed = await this.processDynamicTemplateMarkers(processed);
    
    // Process SVG ICON components: [component type="svg" ...]
    processed = processed.replace(
      /\[component[^\]]*type="svg"[^\]]*\]/g,
      (match): string => {
        const attrs = parseAttributes(match);
        const id = attrs.id || 'svg_' + Date.now();
        const iconType = attrs.iconType || 'wine';
        const size = attrs.size || '24';
        const color = attrs.color || '#000000';
        
        const wineIcon = `<svg id="${id}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="${color}"><path d="M6 3v6c0 2.97 2.16 5.43 5 5.91V19H8v2h8v-2h-3v-4.09c2.84-.48 5-2.94 5-5.91V3H6zm10 5H8V5h8v3z"/></svg>`;
        
        const svgIcons: Record<string, string> = {
          wine: wineIcon,
          grape: `<svg id="${id}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="${color}"><circle cx="12" cy="10" r="3"/><circle cx="9" cy="15" r="2.5"/><circle cx="15" cy="15" r="2.5"/><circle cx="12" cy="19" r="2"/></svg>`,
          bottle: `<svg id="${id}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="${color}"><path d="M9 3v1H7v2h2v2.5c-1.1.3-2 1.2-2 2.5v9c0 1.1.9 2 2 2h6c1.1 0 2-.9 2-2v-9c0-1.3-.9-2.2-2-2.5V6h2V4h-2V3H9zm2 11v7h2v-7h-2z"/></svg>`,
          award: `<svg id="${id}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="${color}"><path d="M12 2L9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2z"/></svg>`,
          star: `<svg id="${id}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="${color}"><path d="M12 2L9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2z"/></svg>`
        };
        
        // Always return a string - use wine as default (wine icon guaranteed to exist)
        return svgIcons[iconType] || wineIcon;
      }
    );
    
    logger.info('PDFService: Component shortcodes processed successfully');
    return processed;
  }

  /**
   * Pomocnicza metoda do odczytu szablonu HTML z pliku
   * @param templateName - Nazwa szablonu (bez rozszerzenia)
   * @returns Zawartość HTML szablonu
   */
  async readHTMLTemplate(templateName: string): Promise<string> {
    try {
      const templatePath = path.join(process.cwd(), 'data', `${templateName}.html`);
      const htmlContent = await fs.readFile(templatePath, 'utf-8');
      
      logger.info(`PDFService: HTML template '${templateName}' loaded successfully`);
      return htmlContent;
      
    } catch (error) {
      logger.error(`PDFService: Error reading HTML template '${templateName}':`, error);
      throw new Error(`Failed to read HTML template: ${templateName}`);
    }
  }

  /**
   * Generate PDF from HTML template with collection data
   */
  async generatePDFFromHTMLWithCollection(
    
    htmlTemplate: string,
    collectionData: any,
    options: {
      format?: string; // Now accepts custom format IDs
      customFormat?: import('../types').CustomPDFFormat;
      width?: string;
      height?: string;
      margin?: {
        top?: string;
        right?: string;
        bottom?: string;
        left?: string;
      };
      orientation?: 'portrait' | 'landscape';
      printBackground?: boolean;
      displayHeaderFooter?: boolean;
      flatten?: boolean; // New option for PDF flattening
    } = {}
  ): Promise<Buffer> {
    let browser;
    
    try {
      console.log("=== HIT generatePDFFromHTMLWithCollection ===");
  logger.info('PDFService: Starting HTML to PDF generation with Puppeteer (Collection data)');
      
      // Uruchom przeglądarkę
      browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
      
      const page = await browser.newPage();
      
      // Sprawdź czy htmlTemplate to ścieżka do pliku czy bezpośrednia zawartość HTML
      let htmlContent: string;
      
      // Improved detection: Check if it's a file path or direct HTML content
      const isDirectHTML = 
        htmlTemplate.includes('<html') || 
        htmlTemplate.includes('<!DOCTYPE') ||
        htmlTemplate.trim().startsWith('<') ||
        htmlTemplate.includes('[component') || // Shortcode indicator
        htmlTemplate.includes('{{'); // Handlebars/mustache template indicator
      
      if (isDirectHTML) {
        // To jest bezpośrednia zawartość HTML
        htmlContent = htmlTemplate;
      } else {
        // To jest ścieżka do pliku
        const templatePath = path.isAbsolute(htmlTemplate) 
          ? htmlTemplate 
          : path.join(process.cwd(), 'data', htmlTemplate);
        
        htmlContent = await fs.readFile(templatePath, 'utf-8');
      }
      
      // 🖼️ Convert relative image paths to base64 data URLs for Puppeteer
      if (collectionData && collectionData.coverImage) {
        const coverImagePath = collectionData.coverImage;
        
        // Check if it's a relative path starting with /
        if (coverImagePath.startsWith('/') && !coverImagePath.startsWith('data:')) {
          try {
            // Convert to absolute path
            const absolutePath = path.join(process.cwd(), 'public', coverImagePath);
            
            // Read image file
            const imageBuffer = await fs.readFile(absolutePath);
            
            // Detect MIME type from extension
            const ext = path.extname(coverImagePath).toLowerCase();
            const mimeTypes: { [key: string]: string } = {
              '.png': 'image/png',
              '.jpg': 'image/jpeg',
              '.jpeg': 'image/jpeg',
              '.gif': 'image/gif',
              '.webp': 'image/webp',
              '.svg': 'image/svg+xml'
            };
            const mimeType = mimeTypes[ext] || 'image/png';
            
            // Convert to base64 data URL
            const base64 = imageBuffer.toString('base64');
            collectionData.coverImage = `data:${mimeType};base64,${base64}`;
            
            logger.info(`PDFService: ✅ Converted coverImage to base64 data URL (${coverImagePath} -> ${mimeType}, ${Math.round(base64.length/1024)}KB)`);
          } catch (error) {
            logger.error(`PDFService: ❌ Failed to load cover image: ${coverImagePath}`, error);
            // Keep original path as fallback
          }
        }
      }
      
      // Wstrzyknij dane kolekcji
      if (collectionData) {
        htmlContent = this.injectCollectionDataToHTML(htmlContent, collectionData);
      }
      
      // 🎨 Process component shortcodes AFTER data injection
      htmlContent = await this.processShortcodes(htmlContent);
      
      logger.info('PDFService: Collection data injected successfully into HTML template');
      
      // Ustaw zawartość HTML na stronie
      await page.setContent(htmlContent, { 
        waitUntil: ['networkidle0', 'domcontentloaded'] 
      });
      
           // Konfiguracja podstawowa dla PDF (POPRAWIONE)
      const pdfOptions: any = {
        printBackground: options.printBackground !== false,
        displayHeaderFooter: options.displayHeaderFooter || false,

        // ✅ KLUCZ: używaj rozmiaru z CSS @page (A4, marginesy itd.)
        preferCSSPageSize: true,

        // ✅ żeby test mm był miarodajny (bez skalowania)
        scale: 1,

        // ✅ domyślnie zero marginesów (na test i pod layout mm)
        // jeśli podasz options.margin lub customFormat.margins – zostaną nadpisane niżej
        margin: { top: '0mm', right: '0mm', bottom: '0mm', left: '0mm' }
      };

      // Add margin only if explicitly specified in options
      if (options.margin) {
        pdfOptions.margin = options.margin;
      }

      // Add orientation if specified
      if (options.orientation) {
        pdfOptions.landscape = options.orientation === 'landscape';
      }

      // Handle custom format or use standard format
      if (options.customFormat) {
        // Use custom format dimensions
        const format = options.customFormat;

        pdfOptions.width = `${format.width}${format.unit}`;
        pdfOptions.height = `${format.height}${format.unit}`;

        // Apply custom margins if they exist and options.margin not set
        if (format.margins && !options.margin) {
          pdfOptions.margin = {
            top: `${format.margins.top}${format.unit}`,
            right: `${format.margins.right}${format.unit}`,
            bottom: `${format.margins.bottom}${format.unit}`,
            left: `${format.margins.left}${format.unit}`
          };
        }

        // jeśli ustawiasz width/height, nie ustawiaj format
        delete pdfOptions.format;
      } else {
        // ✅ POPRAWKA: fallback ma być A4, nie A5
        pdfOptions.format = this.getStandardFormat(options.format) || 'A4';
      }

      // Override width/height if explicitly provided (and remove format)
      if (options.width) {
        pdfOptions.width = options.width;
        delete pdfOptions.format;
      }
      if (options.height) {
        pdfOptions.height = options.height;
        delete pdfOptions.format;
      }

      logger.info(`PDFService: Generating PDF with options:`, pdfOptions);
console.log("PDF OPTIONS:", JSON.stringify(pdfOptions, null, 2));

let pdfBuffer = await page.pdf(pdfOptions);


      
      // Check if template uses CMYK (device-cmyk in CSS)
      const usesCMYK = htmlContent.includes('device-cmyk');
      const shouldFlatten = options.flatten || false;
      const addEditableFields = htmlContent.includes('data-editable-price') || false;
      
      if (usesCMYK || shouldFlatten || addEditableFields) {
        logger.info(`PDFService: Post-processing PDF - CMYK: ${usesCMYK}, Flatten: ${shouldFlatten}, Editable: ${addEditableFields}`);
        
        // Add CMYK metadata and/or flattening using pdf-lib
        try {
          const { PDFDocument } = await import('pdf-lib');
          const pdfDoc = await PDFDocument.load(pdfBuffer);
          
          if (usesCMYK) {
            // Add metadata indicating CMYK color space preference
            pdfDoc.setTitle(collectionData.customTitle || collectionData.name || 'Wine Catalog');
            pdfDoc.setSubject('Wine catalog with CMYK color profile for professional printing');
            pdfDoc.setKeywords(['wine', 'catalog', 'CMYK', 'print-ready']);
            pdfDoc.setProducer('Wine Management System - CMYK Edition');
            pdfDoc.setCreator('Wine Management System v2.0');
            logger.info('PDFService: ✅ CMYK metadata added to PDF');
          }
          
          if (addEditableFields) {
            // Dodaj edytowalne pola dla cen
            // Wykryj pozycje z HTML (data-editable-price)
            const priceFieldsMatch = htmlContent.matchAll(/data-editable-price="([^"]+)"\s+data-price-x="(\d+)"\s+data-price-y="(\d+)"\s+data-price-width="(\d+)"\s+data-price-height="(\d+)"/g);
            const fieldPositions: Array<{ x: number; y: number; width: number; height: number; name: string; defaultValue?: string }> = [];
            
            for (const match of priceFieldsMatch) {
              if (match[1] && match[2] && match[3] && match[4] && match[5]) {
                fieldPositions.push({
                  name: match[1],
                  x: parseInt(match[2]),
                  y: parseInt(match[3]),
                  width: parseInt(match[4]),
                  height: parseInt(match[5]),
                  defaultValue: ''
                });
              }
            }
            
            if (fieldPositions.length > 0) {
              const modifiedBuffer = await this.addEditableFieldsToPDF(Buffer.from(pdfBuffer), fieldPositions);
              pdfBuffer = modifiedBuffer;
              logger.info(`PDFService: ✅ Added ${fieldPositions.length} editable price fields`);
            }
          }
          
          if (shouldFlatten) {
            // Flatten the PDF - convert interactive elements to static content
            const form = pdfDoc.getForm();
            if (form) {
              form.flatten();
              logger.info('PDFService: ✅ PDF flattened - interactive elements converted to static');
            } else {
              logger.info('PDFService: ℹ️ No form elements found to flatten');
            }
          }
          
          // Save modified PDF
          const modifiedPdfBytes = await pdfDoc.save();
          pdfBuffer = Buffer.from(modifiedPdfBytes);
          
        } catch (postProcessError) {
          logger.warn('PDFService: Could not post-process PDF:', postProcessError);
          // Continue with original PDF if post-processing fails
        }
      }
      
      logger.info('PDFService: HTML to PDF generation completed successfully');
      
      return Buffer.from(pdfBuffer);
      
    } catch (error) {
      logger.error('PDFService: Error generating PDF from HTML with collection:', error);
      throw new Error(`Failed to generate PDF from HTML with collection: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }

  /**
   * Dodaje edytowalne pola formularza do PDF (np. pola cen)
   * @param pdfBuffer - Bufor PDF do modyfikacji
   * @param fieldPositions - Opcjonalne pozycje pól (automatyczne wykrywanie jeśli brak)
   * @returns Zmodyfikowany bufor PDF z edytowalnymi polami
   */
  async addEditableFieldsToPDF(
    pdfBuffer: Buffer, 
    fieldPositions?: Array<{ x: number; y: number; width: number; height: number; name: string; defaultValue?: string }>
  ): Promise<Buffer> {
    try {
      const { PDFDocument, PDFTextField, StandardFonts, rgb } = await import('pdf-lib');
      const pdfDoc = await PDFDocument.load(pdfBuffer);
      const form = pdfDoc.getForm();
      const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
      
      const pages = pdfDoc.getPages();
      
      if (fieldPositions && fieldPositions.length > 0 && pages.length > 0) {
        // Użyj dostarczonych pozycji
        const firstPage = pages[0];
        if (!firstPage) return Buffer.from(await pdfDoc.save());
        
        for (const fieldDef of fieldPositions) {
          const pageIndex = Math.floor(fieldDef.y / firstPage.getHeight());
          const page = pages[Math.min(pageIndex, pages.length - 1)];
          
          if (!page) continue;
          
          const textField = form.createTextField(fieldDef.name);
          textField.setText(fieldDef.defaultValue || '');
          textField.addToPage(page, {
            x: fieldDef.x,
            y: page.getHeight() - fieldDef.y - fieldDef.height, // PDF coordinates from bottom
            width: fieldDef.width,
            height: fieldDef.height,
            textColor: rgb(0, 0, 0),
            backgroundColor: rgb(1, 1, 0.9), // Lekko żółte tło
            borderColor: rgb(0.7, 0.7, 0.7),
            borderWidth: 1,
          });
          textField.updateAppearances(helveticaFont);
        }
        logger.info(`PDFService: ✅ Added ${fieldPositions.length} editable fields to PDF`);
      } else {
        // Automatyczne wykrywanie pozycji dla pól cen (placeholder)
        // W przyszłości można dodać parsing HTML i mapowanie pozycji
        logger.info('PDFService: ℹ️ No field positions provided - skipping editable fields');
      }
      
      const modifiedPdfBytes = await pdfDoc.save();
      return Buffer.from(modifiedPdfBytes);
      
    } catch (error) {
      logger.error('PDFService: Error adding editable fields to PDF:', error);
      // Zwróć oryginalny PDF jeśli dodawanie pól się nie powiedzie
      return pdfBuffer;
    }
  }

  /**
   * Inject collection data into HTML template using Handlebars-style placeholders
   */
  // Wklej ten fragment DO SWOJEGO pliku w klasie PDFService
// (podmień istniejącą metodę injectCollectionDataToHTML na tę wersję).

private injectCollectionDataToHTML(htmlContent: string, collectionData: any): string {
  let processedHTML = htmlContent;

  // ✅ Strip Handlebars comments (silnik ich nie obsługuje, potrafią trafić do PDF)
  processedHTML = processedHTML.replace(/\{\{!--[\s\S]*?--\}\}/g, '');

  // 🔍 DEBUG: Log collection metadata
  logger.info('PDFService: injectCollectionDataToHTML - collectionData.metadata:', collectionData?.metadata);
  logger.info('PDFService: injectCollectionDataToHTML - categoryNames:', collectionData?.metadata?.categoryNames);

  try {
    // 🔥 DETECT CUSTOM PAGINATION from meta tag
    const paginationMatch = htmlContent.match(
      /<meta\s+name="pagination"\s+content="firstPage:(\d+),nextPages:(\d+)"\s*\/?>/i
    );

    const winesToUse = collectionData.winesList || collectionData.wines || [];
    const winePages: any[][] = [];

    if (paginationMatch) {
      const firstPageCount = parseInt(paginationMatch[1] || '10', 10);
      const nextPageCount = parseInt(paginationMatch[2] || '10', 10);

      logger.info(
        `PDFService: 🎯 Custom pagination detected - firstPage: ${firstPageCount}, nextPages: ${nextPageCount}`
      );
      logger.info(`PDFService: Total wines to paginate: ${winesToUse.length}`);

      let currentIndex = 0;

      if (currentIndex < winesToUse.length) {
        const firstPage = winesToUse.slice(currentIndex, currentIndex + firstPageCount);
        winePages.push(firstPage);
        currentIndex += firstPageCount;
        logger.info(`PDFService: First page created with ${firstPage.length} wines`);
      }

      while (currentIndex < winesToUse.length) {
        const nextPage = winesToUse.slice(currentIndex, currentIndex + nextPageCount);
        winePages.push(nextPage);
        currentIndex += nextPageCount;
        logger.info(`PDFService: Page ${winePages.length} created with ${nextPage.length} wines`);
      }

      logger.info(`PDFService: ✅ Custom pagination complete - ${winePages.length} pages created`);
    } else {
      const itemsPerPage = 10;

      logger.info(`PDFService: 📄 Default pagination - ${itemsPerPage} wines per page`);
      logger.info(`PDFService: Total wines: ${winesToUse.length}`);

      for (let i = 0; i < winesToUse.length; i += itemsPerPage) {
        winePages.push(winesToUse.slice(i, i + itemsPerPage));
      }
    }

    collectionData.winePages = winePages;

    if (winePages.length > 0 && winePages[0]) {
      collectionData.firstPageWines = winePages[0];
      logger.info(`📋 Added firstPageWines with ${winePages[0].length} wines`);
    }
    if (winePages.length > 1) {
      collectionData.restPages = winePages.slice(1);
      logger.info(`📋 Added restPages with ${winePages.length - 1} pages`);
    }

    logger.info(`PDFService: Created ${winePages.length} pages with ${winesToUse.length} wines total`);
    if (winePages.length > 0 && winePages[0] && winePages[0].length > 0) {
      logger.info(`PDFService: First page has ${winePages[0].length} wines`);
      logger.info(`PDFService: First wine sample: ${JSON.stringify(winePages[0][0], null, 2)}`);
    }

    // Basic collection data replacements
    processedHTML = processedHTML.replace(/\{\{collection\.(\w+)\}\}/g, (match, field) => {
      return collectionData[field] || '';
    });

    // Handle collection.dynamicFields.xxx replacements (by field ID)
    processedHTML = processedHTML.replace(/\{\{collection\.dynamicFields\.([\w_]+)\}\}/g, (match, fieldId) => {
      const dynamicFields = collectionData.dynamicFields || {};
      return dynamicFields[fieldId] || '';
    });

    // Handle collection.dynamicFieldsByName.xxx replacements (by field name)
    processedHTML = processedHTML.replace(
      /\{\{collection\.dynamicFieldsByName\.([\w_]+)\}\}/g,
      (match, fieldName) => {
        const dynamicFieldsByName = collectionData.dynamicFieldsByName || {};
        return dynamicFieldsByName[fieldName.toLowerCase()] || '';
      }
    );

    // Shorthand: {{collection.okladka}}
    const reservedFields = [
      'id',
      'name',
      'description',
      'wines',
      'wineslist',
      'totalwines',
      'customtitle',
      'dynamicfields',
      'dynamicfieldsbyname',
      'createdat',
      'updatedat',
      'tags',
      'status',
      'winecount',
      'winesbycategory'
    ];

    processedHTML = processedHTML.replace(/\{\{collection\.([\w_]+)\}\}/g, (match, fieldName) => {
      if (reservedFields.includes(fieldName.toLowerCase())) return match;

      const dynamicFieldsByName = collectionData.dynamicFieldsByName || {};
      const value = dynamicFieldsByName[fieldName.toLowerCase()];

      if (value !== undefined && value !== null) return value;
      return '';
    });

    // Helper: znajdź pasujące {{/each}} z obsługą zagnieżdżeń
    const findMatchingEach = (
      html: string,
      startTag: string
    ): { start: number; end: number; template: string } | null => {
      const startIndex = html.indexOf(startTag);
      if (startIndex === -1) return null;

      let depth = 1;
      let pos = startIndex + startTag.length;

      logger.info(`findMatchingEach: Looking for matching {{/each}} for: ${startTag}`);

      while (pos < html.length && depth > 0) {
        const nextOpen = html.indexOf('{{#each', pos);
        const nextClose = html.indexOf('{{/each}}', pos);

        if (nextClose === -1) {
          logger.warn(`findMatchingEach: No closing {{/each}} found, depth=${depth}`);
          break;
        }

        if (nextOpen !== -1 && nextOpen < nextClose) {
          depth++;
          logger.info(`findMatchingEach: Found nested {{#each at pos ${nextOpen}, depth=${depth}`);
          pos = nextOpen + 7;
        } else {
          depth--;
          logger.info(`findMatchingEach: Found {{/each}} at pos ${nextClose}, depth=${depth}`);
          if (depth === 0) {
            const endPos = nextClose + 9;
            logger.info(`findMatchingEach: Found matching pair - start=${startIndex}, end=${endPos}`);
            return {
              start: startIndex,
              end: endPos,
              template: html.substring(startIndex + startTag.length, nextClose)
            };
          }
          pos = nextClose + 9;
        }
      }

      logger.error(`findMatchingEach: Failed to find matching {{/each}}`);
      return null;
    };

    // === collection.winesByCategory ===
    const categoryStartTag = '{{#each collection.winesByCategory}}';
    const categoryMatch = findMatchingEach(processedHTML, categoryStartTag);

    if (categoryMatch) {
      const template = categoryMatch.template;

      logger.info(`PDFService: category template has "{{#each pages}}": ${template.includes('{{#each pages}}')}`);
      logger.info(`PDFService: category template has pages loop (regex): ${/\{\{\s*#each\s+pages\s*\}\}/.test(template)}`);

      const hasWinePageDiv = processedHTML.includes('<div class="wine-page');
      logger.info(`PDFService: TEMPLATE HAS WINE-PAGE WRAPPER: ${hasWinePageDiv}`);

      const winesArr = collectionData.winesList || collectionData.wines;

      if (!winesArr || !Array.isArray(winesArr)) {
        logger.warn('PDFService: No wines found in collection for category grouping');
        processedHTML = processedHTML.substring(0, categoryMatch.start) + '' + processedHTML.substring(categoryMatch.end);
      } else {
        // Get custom wine categories from metadata (set in wizard when user moves wines between categories)
        const customWineCategories = collectionData?.metadata?.wineCategories || {};
        logger.info(`PDFService: Custom wine categories from wizard:`, customWineCategories);
        
        // 1) Group wines by category (✅ trim usuwa "różowe" vs "różowe ")
        // ✅ Use custom category for GROUPING (section placement), but keep original wine.category intact
        const winesByCategory: { [key: string]: any[] } = {};
        winesArr.forEach((wine: any) => {
          // Check if this wine has a custom category set in wizard (for section placement)
          const customCategory = customWineCategories[wine.catalogNumber];
          const sectionCategory = (customCategory || wine.category || 'Inne').trim();
          
          // ✅ Keep original wine data intact - do NOT override wine.category
          // This way {{this.category}} in template shows original category (e.g., "białe")
          // but wine appears in the section it was moved to (e.g., "różowe")
          const wineForSection = {
            ...wine,
            // Add sectionCategory field if needed for reference, but don't override category
            _movedToSection: customCategory ? sectionCategory : undefined
          };
          
          if (!winesByCategory[sectionCategory]) winesByCategory[sectionCategory] = [];
          winesByCategory[sectionCategory].push(wineForSection);
        });

        logger.info(`PDFService: Processing ${Object.keys(winesByCategory).length} categories`);
        logger.info(`PDFService: Categories found:`, Object.keys(winesByCategory));
        
        // Log wine count per category
        Object.entries(winesByCategory).forEach(([cat, wines]) => {
          logger.info(`PDFService: Category "${cat}" has ${wines.length} wines`);
        });

        // 2) Build pages per category (3 wines per page)
        const pagesByCategory: { [key: string]: any[][] } = {};
        Object.entries(winesByCategory).forEach(([category, wines]) => {
          const pages: any[][] = [];
          for (let i = 0; i < wines.length; i += 3) {
            pages.push(wines.slice(i, i + 3));
          }
          pagesByCategory[category] = pages;
        });

        // 3) Generate HTML per category
        const categoryHTML = Object.entries(winesByCategory)
          .map(([category, wines]) => {
            let catHTML = template;

            // Use custom category name if available, otherwise use default category name
            const customCategoryNames = collectionData?.metadata?.categoryNames || {};
            const displayCategoryName = customCategoryNames[category] || category;

            logger.info(`PDFService: ====== Processing category: "${category}" ======`);
            logger.info(`PDFService: Available custom category names:`, customCategoryNames);
            logger.info(`PDFService: Display name will be: "${displayCategoryName}"`);
            logger.info(`PDFService: Template contains {{category}}: ${catHTML.includes('{{category}}')}`);
            
            // Count how many times {{category}} appears
            const categoryMatches = catHTML.match(/\{\{category\}\}/g);
            logger.info(`PDFService: Found ${categoryMatches ? categoryMatches.length : 0} instances of {{category}} to replace`);

            catHTML = catHTML.replace(/\{\{category\}\}/g, displayCategoryName);
            
            // Verify replacement worked
            logger.info(`PDFService: After replacement, {{category}} still exists: ${catHTML.includes('{{category}}')}`);
            
            catHTML = catHTML.replace(/\{\{categoryWineCount\}\}/g, String(wines.length));

          // jeśli szablon ma {{#each pages}} ... {{/each}}
const pagesStartTag = '{{#each pages}}';

if (catHTML.includes(pagesStartTag)) {
  const pages = pagesByCategory[category] || [];

  // Użyj findMatchingEach (zamiast regex) bo są zagnieżdżone loop'y
  while (catHTML.includes(pagesStartTag)) {
    const pagesMatch = findMatchingEach(catHTML, pagesStartTag);

    if (!pagesMatch) {
      logger.warn('PDFService: Could not find matching {{/each}} for {{#each pages}}');
      break;
    }

    const pageTemplate = pagesMatch.template;

    const renderedPagesHTML = pages
      .map((winesInPage: any[]) => {
        let onePageHTML = pageTemplate;

        // W środku strony renderujemy {{#each this}} ... {{/each}}
        const thisStartTag = '{{#each this}}';

        while (onePageHTML.includes(thisStartTag)) {
          const thisMatch = findMatchingEach(onePageHTML, thisStartTag);

          if (!thisMatch) {
            logger.warn('PDFService: Could not find matching {{/each}} for {{#each this}} inside pages loop');
            break;
          }

          const wineTemplate = thisMatch.template;

          const winesHTML = winesInPage
            .map((wine: any) => {
              let wineHTML = wineTemplate;

              // {{this.field}} + {{wine.field}}
              wineHTML = wineHTML.replace(/\{\{this\.(\w+)\}\}/g, (_m: string, field: string) => wine[field] || '');
              wineHTML = wineHTML.replace(/\{\{wine\.(\w+)\}\}/g, (_m: string, field: string) => wine[field] || '');

              // {{#if this.field}} ... {{else}} ... {{/if}} - obsługa z else
              wineHTML = wineHTML.replace(
                /\{\{#if this\.(\w+)\}\}([\s\S]*?)(?:\{\{else\}\}([\s\S]*?))?\{\{\/if\}\}/g,
                (_ifm: string, field: string, ifContent: string, elseContent: string = '') => {
                  return wine[field] ? ifContent : elseContent;
                }
              );

              return wineHTML;
            })
            .join('');

          onePageHTML =
            onePageHTML.substring(0, thisMatch.start) + winesHTML + onePageHTML.substring(thisMatch.end);
        }

        return onePageHTML;
      })
      .join('');

    // Podmień cały blok {{#each pages}}...{{/each}} na gotowy HTML
    catHTML =
      catHTML.substring(0, pagesMatch.start) + renderedPagesHTML + catHTML.substring(pagesMatch.end);
  }
} else {
  // Legacy: {{#each wines}} ... {{/each}}
  const winePattern = /\{\{#each wines\}\}([\s\S]*?)\{\{\/each\}\}/g;
  catHTML = catHTML.replace(winePattern, (_wineMatch: string, wineTemplate: string) => {
    return wines
      .map((wine: any) => {
        let wineHTML = wineTemplate;
        wineHTML = wineHTML.replace(/\{\{wine\.(\w+)\}\}/g, (_m: string, field: string) => wine[field] || '');
        wineHTML = wineHTML.replace(/\{\{this\.(\w+)\}\}/g, (_m: string, field: string) => wine[field] || '');
        
        // {{#if this.field}} ... {{else}} ... {{/if}} - obsługa z else
        wineHTML = wineHTML.replace(
          /\{\{#if this\.(\w+)\}\}([\s\S]*?)(?:\{\{else\}\}([\s\S]*?))?\{\{\/if\}\}/g,
          (_ifm: string, field: string, ifContent: string, elseContent: string = '') => {
            return wine[field] ? ifContent : elseContent;
          }
        );
        
        return wineHTML;
      })
      .join('');
  });
}


            // Nie dokładaj dodatkowego wrappera, jeśli szablon już tworzy .page
            const templateAlreadyHasPage = catHTML.includes('class="page"') || catHTML.includes("class='page'");
            if (templateAlreadyHasPage) return catHTML;

            return `<div class="page products-page" style="page-break-after: always;">
  <div class="products-content">
${catHTML}
  </div>
</div>`;
          })
          .join('');

        processedHTML =
          processedHTML.substring(0, categoryMatch.start) + categoryHTML + processedHTML.substring(categoryMatch.end);

        // DEBUG: Save generated HTML
        const fs = require('fs');
        fs.writeFileSync('debug-categories-output.html', processedHTML, 'utf-8');
        logger.info(`PDFService: DEBUG - Saved generated HTML to debug-categories-output.html`);
      }
    }

    // Reszta Twojej funkcji (winePages / firstPageWines / restPages / eachPatterns / ifPattern / date)
    // zostaje bez zmian — zostaw ją jak była poniżej w pliku.

    // Handle conditional blocks {{#if condition}}
    const ifPattern = /\{\{#if\s+(\w+(?:\.\w+)*)\}\}([\s\S]*?)(?:\{\{else\}\}([\s\S]*?))?\{\{\/if\}\}/g;
    processedHTML = processedHTML.replace(ifPattern, (match, condition, ifContent, elseContent = '') => {
      const value = this.getNestedValue(collectionData, condition);
      return value ? ifContent : elseContent;
    });

    // Add current date
    processedHTML = processedHTML.replace(/\{\{date\}\}/g, new Date().toLocaleDateString('pl-PL'));

    return processedHTML;
  } catch (error) {
    logger.error('PDFService: Error injecting collection data to HTML:', error);
    return htmlContent;
  }
}


  /**
   * Get nested value from object using dot notation
   */
  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  /**
   * Get standard format name for Puppeteer
   */
  private getStandardFormat(format?: string): string | null {
    const standardFormats = ['A4', 'A5', 'A6', 'Letter', 'Legal', 'Tabloid'];
    if (format && standardFormats.includes(format)) {
      return format;
    }
    return null;
  }

}
