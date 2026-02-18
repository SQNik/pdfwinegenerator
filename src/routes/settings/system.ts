import { Router } from 'express';
import { SystemController } from '../../controllers/settings/systemController';

export const createSystemRoutes = (): Router => {
  const router = Router();
  const controller = new SystemController();

  router.get('/', controller.getSettings.bind(controller));
  router.put('/', controller.updateSettings.bind(controller));
  router.post('/reset', controller.resetToDefaults.bind(controller));

  return router;
};
