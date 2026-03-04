import express from 'express';
import { CustomFormatsController } from '../controllers/customFormatsController';
import { DataStore } from '../services/dataStore';

const router = express.Router();

export function createCustomFormatsRoutes(dataStore: DataStore) {
  const controller = new CustomFormatsController(dataStore);

  // GET /api/custom-formats - Get all custom PDF formats
  router.get('/', controller.getCustomFormats.bind(controller));

  // GET /api/custom-formats/validate-name/:name - Validate format name availability
  router.get('/validate-name/:name', controller.validateFormatName.bind(controller));

  // GET /api/custom-formats/:id - Get custom format by ID
  router.get('/:id', controller.getCustomFormat.bind(controller));

  // POST /api/custom-formats - Create new custom format
  router.post('/', controller.createCustomFormat.bind(controller));

  // PUT /api/custom-formats/:id - Update custom format
  router.put('/:id', controller.updateCustomFormat.bind(controller));

  // DELETE /api/custom-formats/:id - Delete custom format
  router.delete('/:id', controller.deleteCustomFormat.bind(controller));

  return router;
}

export default router;