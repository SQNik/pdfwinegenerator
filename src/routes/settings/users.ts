import { Router } from 'express';
import { UsersController } from '../../controllers/settings/usersController';

export const createUsersRoutes = (): Router => {
  const router = Router();
  const controller = new UsersController();

  router.get('/', controller.getUsers.bind(controller));
  router.post('/', controller.addUser.bind(controller));
  router.put('/:userId', controller.updateUser.bind(controller));
  router.delete('/:userId', controller.deleteUser.bind(controller));

  return router;
};
