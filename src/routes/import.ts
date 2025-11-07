import { Router } from 'express';
import { ImportController } from '../controllers/importController';
import { DataStore } from '../services/dataStore';

export const createImportRoutes = (dataStore: DataStore): Router => {
  const router = Router();
  const importController = new ImportController(dataStore);

  router.post('/google-sheets', importController.importFromGoogleSheets);
  router.post('/csv', importController.importFromCSV);

  return router;
};