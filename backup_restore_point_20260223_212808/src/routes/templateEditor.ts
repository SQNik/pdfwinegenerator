import { Router } from 'express';
import { TemplateEditorController } from '../controllers/templateEditorController';
import { DataStore } from '../services/dataStore';
import { PDFService } from '../services/pdfService';

export function createTemplateEditorRoutes(
  dataStore: DataStore,
  pdfService: PDFService
): Router {
  const router = Router();
  const templateEditorController = new TemplateEditorController(dataStore, pdfService);

  // Template CRUD operations
  router.get('/templates', templateEditorController.getTemplates);
  router.get('/templates/:id', templateEditorController.getTemplate);
  router.post('/templates', templateEditorController.createTemplate);
  router.put('/templates/:id', templateEditorController.updateTemplate);
  router.delete('/templates/:id', templateEditorController.deleteTemplate);

  // Template preview
  router.post('/templates/:id/preview', templateEditorController.previewTemplate);

  // Categories
  router.get('/categories', templateEditorController.getCategories);

  // Wine fields for data binding
  router.get('/wine-fields', templateEditorController.getWineFields);

  // Collection fields for data binding
  router.get('/collection-fields', templateEditorController.getCollectionFields);

  // Collection data for template preview
  router.get('/collections/:collectionId/data', templateEditorController.getCollectionData);

  // Collection template preview
  router.post('/templates/:id/preview-collection', templateEditorController.previewCollectionTemplate);

  // Collection template PDF generation
  router.post('/templates/:id/generate-collection', templateEditorController.generateCollectionPDF);

  return router;
}