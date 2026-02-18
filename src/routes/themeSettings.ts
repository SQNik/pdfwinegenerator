import { Router } from 'express';
import { ThemeSettingsController, upload } from '../controllers/themeSettingsController';

export const createThemeSettingsRoutes = (): Router => {
  const router = Router();
  const controller = new ThemeSettingsController();

  // Get current theme settings
  router.get('/', controller.getSettings.bind(controller));

  // Update theme settings
  router.put('/', controller.updateSettings.bind(controller));

  // Upload logo
  router.post('/upload-logo', upload.single('logo'), controller.uploadLogo.bind(controller));

  // Delete logo
  router.delete('/logo', controller.deleteLogo.bind(controller));

  // Reset to defaults
  router.post('/reset', controller.resetSettings.bind(controller));

  return router;
};
