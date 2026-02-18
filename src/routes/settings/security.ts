import { Router } from 'express';
import { SecurityController } from '../../controllers/settings/securityController';

export const createSecurityRoutes = (): Router => {
  const router = Router();
  const controller = new SecurityController();

  router.get('/', controller.getSettings.bind(controller));
  router.put('/', controller.updateSettings.bind(controller));
  router.post('/reset', controller.resetToDefaults.bind(controller));

  return router;
};
