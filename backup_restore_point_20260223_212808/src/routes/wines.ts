import { Router } from 'express';
import { WineController } from '../controllers/wineController';
import { DataStore } from '../services/dataStore';
import { quickFieldsCheck } from '../middleware/fieldsSync';

export const createWineRoutes = (dataStore: DataStore): Router => {
  const router = Router();
  const wineController = new WineController(dataStore);

  router.get('/', quickFieldsCheck, wineController.getWines);
  router.delete('/all', quickFieldsCheck, wineController.clearAllWines);
  router.get('/:id', quickFieldsCheck, wineController.getWine);
  router.post('/', quickFieldsCheck, wineController.createWine);
  router.put('/:id', quickFieldsCheck, wineController.updateWine);
  router.delete('/:id', quickFieldsCheck, wineController.deleteWine);

  return router;
};