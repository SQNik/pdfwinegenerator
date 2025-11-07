import { Router } from 'express';
import { CollectionController } from '../controllers/collectionController';
import { DataStore } from '../services/dataStore';

export const createCollectionRoutes = (dataStore: DataStore): Router => {
  const router = Router();
  const collectionController = new CollectionController(dataStore);

  // Collections CRUD
  router.get('/', collectionController.getCollections);
  router.get('/:id', collectionController.getCollection);
  router.post('/', collectionController.createCollection);
  router.put('/:id', collectionController.updateCollection);
  router.delete('/:id', collectionController.deleteCollection);

  // Wine management in collections
  router.post('/:id/wines/:wineId', collectionController.addWineToCollection);
  router.delete('/:id/wines/:wineId', collectionController.removeWineFromCollection);

  // Export functionality
  router.get('/export/merged', collectionController.getCollectionsWithFullWineData);
  router.get('/:id/export', collectionController.exportCollectionWithWines);

  return router;
};