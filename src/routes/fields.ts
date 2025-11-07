import { Router } from 'express';
import { FieldsController } from '../controllers/fieldsController';
import { DataStore } from '../services/dataStore';

export const createFieldsRoutes = (dataStore: DataStore): Router => {
  const router = Router();
  const fieldsController = new FieldsController(dataStore);

  router.get('/config', fieldsController.getFieldsConfig);
  router.put('/config', fieldsController.updateFieldsConfig);
  router.post('/config/reset', fieldsController.resetFieldsConfig);
  router.get('/system', fieldsController.getSystemFields);

  return router;
};