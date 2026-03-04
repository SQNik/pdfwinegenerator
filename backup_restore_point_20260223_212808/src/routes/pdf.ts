import { Router } from 'express';
import { PDFController } from '../controllers/pdfController';
import { PDFService } from '../services/pdfService';
import { DataStore } from '../services/dataStore';

export const createPDFRoutes = (dataStore: DataStore): Router => {
  const router = Router();
  const pdfService = new PDFService(dataStore);
  const pdfController = new PDFController(pdfService, dataStore);

  // Template management routes
  router.get('/templates', pdfController.getTemplates);
  router.get('/templates/:id', pdfController.getTemplate);
  router.post('/templates', pdfController.createTemplate);
  router.put('/templates/:id', pdfController.updateTemplate);
  router.delete('/templates/:id', pdfController.deleteTemplate);

  // Template preview
  router.get('/templates/:id/preview', pdfController.previewTemplate);

  // Product template management routes removed

  // PDF generation routes
  router.post('/generate', pdfController.generatePDF);
  router.post('/generate-from-html', pdfController.generateFromHTML);

  // Job management routes
  router.get('/jobs', pdfController.getJobs);
  router.get('/jobs/:id', pdfController.getJob);

  return router;
};