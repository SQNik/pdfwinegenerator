import { Router } from 'express';
import { CollectionFieldsController } from '../controllers/collectionFieldsController';
import { DataStore } from '../services/dataStore';

/**
 * Dedykowane trasy dla zarządzania polami dynamicznymi kolekcji
 * 
 * Endpointy:
 * GET    /api/collection-fields/config         - Lista wszystkich pól
 * GET    /api/collection-fields/config/:id     - Pojedyncze pole
 * POST   /api/collection-fields/config         - Tworzenie pola
 * PUT    /api/collection-fields/config/:id     - Aktualizacja pola  
 * DELETE /api/collection-fields/config/:id     - Usunięcie pola
 * PUT    /api/collection-fields/order          - Aktualizacja kolejności
 * GET    /api/collection-fields/stats          - Statystyki użycia pól
 */
export const createCollectionFieldsRoutes = (dataStore: DataStore): Router => {
  const router = Router();
  const collectionFieldsController = new CollectionFieldsController(dataStore);

  // Pobieranie konfiguracji pól
  router.get('/config', collectionFieldsController.getCollectionFieldsConfig);
  router.get('/config/:fieldId', collectionFieldsController.getCollectionField);

  // Zarządzanie polami (CRUD)
  router.post('/config', collectionFieldsController.createCollectionField);
  router.put('/config/:fieldId', collectionFieldsController.updateCollectionField);
  router.delete('/config/:fieldId', collectionFieldsController.deleteCollectionField);

  // Zarządzanie kolejnością pól
  router.put('/order', collectionFieldsController.updateFieldsOrder);

  // Statystyki użycia pól
  router.get('/stats', collectionFieldsController.getFieldsUsageStats);

  return router;
};