import { Router } from 'express';
import * as boardsController from './boards.controller.js';
import { validateRequest } from '../../../middleware/validateRequest.js';
import {
  boardIdParamSchema,
  getBoardsQuerySchema,
  updateBoardSchema,
  updateBoardStatusSchema
} from '../superAdmin.validation.js';

const router = Router();

router.get('/', validateRequest(getBoardsQuerySchema, 'query'), boardsController.getBoards);
router.get('/:boardId', validateRequest(boardIdParamSchema, 'params'), boardsController.getBoardById);
router.patch(
  '/:boardId',
  validateRequest(boardIdParamSchema, 'params'),
  validateRequest(updateBoardSchema, 'body'),
  boardsController.updateBoard
);
router.patch(
  '/:boardId/status',
  validateRequest(boardIdParamSchema, 'params'),
  validateRequest(updateBoardStatusSchema, 'body'),
  boardsController.updateBoardStatus
);
router.delete('/:boardId', validateRequest(boardIdParamSchema, 'params'), boardsController.deleteBoard);
router.get('/:boardId/tasks', validateRequest(boardIdParamSchema, 'params'), boardsController.getBoardTasks);

export default router;

