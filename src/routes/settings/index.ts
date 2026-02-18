import { Router } from 'express';
import { createAppearanceRoutes } from './appearance';
import { createSecurityRoutes } from './security';
import { createUsersRoutes } from './users';
import { createSystemRoutes } from './system';

export const createSettingsRoutes = (): Router => {
  const router = Router();

  // Mount sub-routes
  router.use('/appearance', createAppearanceRoutes());
  router.use('/security', createSecurityRoutes());
  router.use('/users', createUsersRoutes());
  router.use('/system', createSystemRoutes());

  // Health check for the module
  router.get('/health', (req, res) => {
    res.json({
      success: true,
      module: 'settings',
      sections: ['appearance', 'security', 'users', 'system'],
      timestamp: new Date().toISOString()
    });
  });

  return router;
};
