import { Request, Response } from 'express';
import { PDFService } from '../services/pdfService';
import { DataStore } from '../services/dataStore';
import logger from '../utils/logger';
import { PDFTemplate, Wine } from '../types';

export class PDFController {
  constructor(
    private pdfService: PDFService,
    private dataStore: DataStore
  ) {}

  /**
   * Get all PDF templates
   */
  getTemplates = async (req: Request, res: Response): Promise<void> => {
    try {
      const templates = await this.pdfService.getTemplates();
      res.json({
        success: true,
        data: templates,
      });
    } catch (error) {
      logger.error('Error getting PDF templates:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
    }
  };

  /**
   * Get specific PDF template
   */
  getTemplate = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      
      if (!id) {
        res.status(400).json({
          success: false,
          error: 'Template ID is required',
        });
        return;
      }

      const template = await this.pdfService.getTemplate(id);
      
      if (!template) {
        res.status(404).json({
          success: false,
          error: 'Template not found',
        });
        return;
      }

      res.json({
        success: true,
        data: template,
      });
    } catch (error) {
      logger.error('Error getting PDF template:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
    }
  };

  /**
   * Create new PDF template
   */
  createTemplate = async (req: Request, res: Response): Promise<void> => {
    try {
      const templateData: Omit<PDFTemplate, 'id' | 'createdAt' | 'updatedAt'> = req.body;

      // Basic validation
      if (!templateData.name) {
        res.status(400).json({
          success: false,
          error: 'Template name is required',
        });
        return;
      }

      const newTemplate = await this.pdfService.createTemplate(templateData);
      
      res.status(201).json({
        success: true,
        data: newTemplate,
      });
    } catch (error) {
      logger.error('Error creating PDF template:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
    }
  };

  /**
   * Update PDF template
   */
  updateTemplate = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      
      if (!id) {
        res.status(400).json({
          success: false,
          error: 'Template ID is required',
        });
        return;
      }

      const updates: Partial<PDFTemplate> = req.body;

      const updatedTemplate = await this.pdfService.updateTemplate(id, updates);
      
      if (!updatedTemplate) {
        res.status(404).json({
          success: false,
          error: 'Template not found',
        });
        return;
      }

      res.json({
        success: true,
        data: updatedTemplate,
      });
    } catch (error) {
      logger.error('Error updating PDF template:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
    }
  };

  /**
   * Delete PDF template
   */
  deleteTemplate = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      
      if (!id) {
        res.status(400).json({
          success: false,
          error: 'Template ID is required',
        });
        return;
      }

      const deleted = await this.pdfService.deleteTemplate(id);
      
      if (!deleted) {
        res.status(404).json({
          success: false,
          error: 'Template not found',
        });
        return;
      }

      res.json({
        success: true,
        message: 'Template deleted successfully',
      });
    } catch (error) {
      logger.error('Error deleting PDF template:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
    }
  };

  /**
   * Generate PDF from template and collection
   */
  generatePDF = async (req: Request, res: Response): Promise<void> => {
    try {
      const { templateId, collectionId } = req.body;

      if (!templateId || !collectionId) {
        res.status(400).json({
          success: false,
          error: 'Template ID and Collection ID are required',
        });
        return;
      }

      // Check if template exists
      const template = await this.pdfService.getTemplate(templateId);
      if (!template) {
        res.status(404).json({
          success: false,
          error: 'Template not found',
        });
        return;
      }

      // Check if collection exists
      const collection = this.dataStore.getCollection(collectionId);
      if (!collection) {
        res.status(404).json({
          success: false,
          error: 'Collection not found',
        });
        return;
      }

      const filename = await this.pdfService.generatePDF(templateId, collectionId, this.dataStore);
      
      res.json({
        success: true,
        data: {
          filename,
          downloadUrl: `/pdf-output/${filename}`,
        },
      });
    } catch (error) {
      logger.error('Error generating PDF:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      });
    }
  };

  /**
   * Get PDF generation jobs
   */
  getJobs = async (req: Request, res: Response): Promise<void> => {
    try {
      const jobs = await this.pdfService.getJobs();
      res.json({
        success: true,
        data: jobs,
      });
    } catch (error) {
      logger.error('Error getting PDF jobs:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
    }
  };

  /**
   * Get specific PDF generation job
   */
  getJob = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      
      if (!id) {
        res.status(400).json({
          success: false,
          error: 'Job ID is required',
        });
        return;
      }

      const job = await this.pdfService.getJob(id);
      
      if (!job) {
        res.status(404).json({
          success: false,
          error: 'Job not found',
        });
        return;
      }

      res.json({
        success: true,
        data: job,
      });
    } catch (error) {
      logger.error('Error getting PDF job:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
    }
  };

  /**
   * Preview template (generate sample PDF with dummy data)
   */
  previewTemplate = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      logger.info(`Preview template requested for ID: ${id}`);
      
      if (!id) {
        res.status(400).json({
          success: false,
          error: 'Template ID is required',
        });
        return;
      }
      
      const template = await this.pdfService.getTemplate(id);
      if (!template) {
        logger.error(`Template not found: ${id}`);
        res.status(404).json({
          success: false,
          error: 'Template not found',
        });
        return;
      }

      logger.info(`Template loaded: ${template.name}, generating preview...`);

      let previewWines: Wine[] = [];

      // Check if template has a preview collection selected
      const previewCollectionId = template.sections?.content?.previewCollectionId;
      const productsPerPage = 6; // ✅ Domyślna wartość, elementi product-list mają własną konfigurację

      if (previewCollectionId) {
        logger.info(`Template has preview collection: ${previewCollectionId}, loading wines...`);
        try {
          // Load real wines from the selected collection
          const collection = await this.dataStore.getCollection(previewCollectionId);
          if (collection && collection.wines && collection.wines.length > 0) {
            // Load wines by catalog numbers and limit to productsPerPage
            const winesByIds = await this.dataStore.getWinesByCatalogNumbers(collection.wines);
            previewWines = winesByIds.slice(0, productsPerPage);
            logger.info(`Loaded ${previewWines.length} wines from collection: ${collection.name}`);
          } else {
            logger.warn(`Collection ${previewCollectionId} not found or has no wines, using sample data`);
          }
        } catch (error) {
          logger.error(`Error loading preview collection ${previewCollectionId}:`, error);
        }
      }

      // Fallback to sample data if no collection wines loaded
      if (previewWines.length === 0) {
        logger.info('Using sample wines for preview');
        previewWines = [
          {
            id: 'sample-1',
            catalogNumber: 'W001',
            name: 'Cabernet Sauvignon Reserve',
            description: 'Wytrawne wino czerwone o intensywnym smaku i aromacie.',
            type: 'Czerwone',
            category: 'Wytrawne',
            variety: 'Cabernet Sauvignon',
            region: 'Bordeaux',
            alcohol: '14%',
            price1: '89,99',
            price2: '79,99',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: 'sample-2',
            catalogNumber: 'W002',
            name: 'Chardonnay Premium',
            description: 'Biale wino o delikatnym smaku z nutami owocow tropikalnych.',
            type: 'Białe',
            category: 'Półwytrawne',
            variety: 'Chardonnay',
            region: 'Burgundia',
            alcohol: '12.5%',
            price1: '75,99',
            price2: '69,99',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        ];
      }

      logger.info(`About to generate preview PDF with ${previewWines.length} wines`);
      const filename = await this.pdfService.generatePreviewPDF(template, previewWines, this.dataStore);
      logger.info(`Preview PDF generated successfully: ${filename}`);
      
      res.json({
        success: true,
        data: {
          filename,
          downloadUrl: `/pdf-output/${filename}`,
        },
      });
    } catch (error) {
      logger.error('Error generating PDF preview:', error);
      logger.error('Error stack:', error instanceof Error ? error.stack : String(error));
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      });
    }
  };

  /**
   * Preview PDF for collection
   */
  previewCollectionPDF = async (req: Request, res: Response): Promise<void> => {
    try {
      const { collectionId, template, title, collection } = req.body;

      if (!collectionId || !template) {
        res.status(400).json({
          success: false,
          error: 'Collection ID and template are required',
        });
        return;
      }

      // Get collection data if not provided
      let collectionData = collection;
      if (!collectionData) {
        const collections = await this.dataStore.getCollections();
        collectionData = collections.find(c => c.id === collectionId);
        
        if (!collectionData) {
          res.status(404).json({
            success: false,
            error: 'Collection not found',
          });
          return;
        }
      }

      // Get template data
      const templateData = await this.pdfService.getTemplate(template);
      if (!templateData) {
        res.status(404).json({
          success: false,
          error: 'PDF template not found',
        });
        return;
      }

      // Get wines from collection using catalogNumbers (not UUIDs)
      console.log('Collection data wines:', collectionData.wines);
      const collectionWines = collectionData.wines 
        ? await this.dataStore.getWinesByCatalogNumbers(collectionData.wines)
        : [];

      console.log(`Found ${collectionWines.length} wines for collection`);
      console.log('Collection wines details:', collectionWines.map(w => ({ id: w.id, catalogNumber: w.catalogNumber, name: w.name })));

      logger.info(`Generating preview PDF for collection ${collectionData.name} with ${collectionWines.length} wines`);
      
      // Generate preview PDF
      const filename = await this.pdfService.generatePreviewPDF(templateData, collectionWines, this.dataStore);
      
      logger.info(`Collection preview PDF generated successfully: ${filename}`);
      
      res.json({
        success: true,
        data: {
          filename,
          previewUrl: `/pdf-output/${filename}`,
        },
      });
    } catch (error) {
      logger.error('Error generating collection PDF preview:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      });
    }
  };

  /**
   * Generate PDF for collection
   */
  generateCollectionPDF = async (req: Request, res: Response): Promise<void> => {
    try {
      console.log('generateCollectionPDF called with:', req.body);
      const { collectionId, template, title, collection } = req.body;

      if (!collectionId || !template) {
        res.status(400).json({
          success: false,
          error: 'Collection ID and template are required',
        });
        return;
      }

      // Get collection data if not provided
      let collectionData = collection;
      if (!collectionData) {
        const collections = await this.dataStore.getCollections();
        collectionData = collections.find(c => c.id === collectionId);
        
        if (!collectionData) {
          res.status(404).json({
            success: false,
            error: 'Collection not found',
          });
          return;
        }
      }

      // Get template data
      const templateData = await this.pdfService.getTemplate(template);
      if (!templateData) {
        res.status(404).json({
          success: false,
          error: 'PDF template not found',
        });
          return;
      }

      // Get wines from collection using catalogNumbers (not UUIDs)
      const collectionWines = collectionData.wines 
        ? await this.dataStore.getWinesByCatalogNumbers(collectionData.wines)
        : [];

      logger.info(`Generating PDF for collection ${collectionData.name} with ${collectionWines.length} wines`);
      
      // Generate PDF
      const filename = await this.pdfService.generatePDF(template, collectionId, this.dataStore);
      
      logger.info(`Collection PDF generated successfully: ${filename}`);
      
      // Set response headers for file download
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      
      // Send the PDF file
      const path = require('path');
      const fs = require('fs');
      const filePath = path.join(process.cwd(), 'pdf-output', filename);
      
      if (fs.existsSync(filePath)) {
        res.sendFile(filePath);
      } else {
        res.status(404).json({
          success: false,
          error: 'Generated PDF file not found',
        });
      }
    } catch (error) {
      logger.error('Error generating collection PDF:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      });
    }
  };

  /**
   * Generate PDF from HTML template
   */
  generateFromHTML = async (req: Request, res: Response): Promise<void> => {
    try {
      const { 
        htmlTemplate, 
        wineId,
        catalogNumber,
        options = {} 
      } = req.body;

      if (!htmlTemplate) {
        res.status(400).json({
          success: false,
          error: 'HTML template is required',
        });
        return;
      }

      let wineData: Wine | undefined;

      // Get wine data if ID or catalogNumber provided
      if (wineId) {
        wineData = this.dataStore.getWine(wineId);
        
        if (!wineData) {
          res.status(404).json({
            success: false,
            error: 'Wine not found',
          });
          return;
        }
      } else if (catalogNumber) {
        wineData = await this.dataStore.getWineByCatalogNumber(catalogNumber);
        
        if (!wineData) {
          res.status(404).json({
            success: false,
            error: 'Wine not found by catalog number',
          });
          return;
        }
      }

      logger.info(`Generating PDF from HTML template ${wineData ? 'for wine: ' + wineData.name : 'without wine data'}`);
      
      // Generate PDF from HTML
      const pdfBuffer = await this.pdfService.generatePDFFromHTML(
        htmlTemplate,
        wineData,
        options
      );

      // Set response headers for PDF download
      const filename = wineData 
        ? `wine-${wineData.catalogNumber}-${Date.now()}.pdf`
        : `template-${Date.now()}.pdf`;

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Length', pdfBuffer.length);

      // Send PDF buffer
      res.send(pdfBuffer);

      logger.info(`PDF generated successfully from HTML template: ${filename}`);

    } catch (error) {
      logger.error('Error generating PDF from HTML:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      });
    }
  };

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
}