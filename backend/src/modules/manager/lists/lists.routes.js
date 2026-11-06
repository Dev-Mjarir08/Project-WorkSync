import { Router } from 'express';
import * as listsController from './lists.controller.js';

const router = Router();

router.get('/:listId', listsController.getListById);
router.patch('/:listId', listsController.updateList);
router.delete('/:listId', listsController.deleteList);
router.patch('/:listId/position', listsController.updateListPosition);
router.get('/:listId/tasks', listsController.getListTasks);

export default router;
