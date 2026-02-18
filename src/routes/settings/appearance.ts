import { Router } from 'express';
import { AppearanceController } from '../../controllers/settings/appearanceController';
import { upload } from '../../controllers/themeSettingsController';

export const createAppearanceRoutes = (): Router => {
  const router = Router();
  const controller = new AppearanceController();

  router.get('/', controller.getSettings.bind(controller));
  router.put('/', controller.updateSettings.bind(controller));
  router.post('/reset', controller.resetToDefaults.bind(controller));
  router.post('/upload-logo', upload.single('logo'), controller.uploadLogo.bind(controller));
  router.delete('/logo', controller.deleteLogo.bind(controller));

  return router;
};
