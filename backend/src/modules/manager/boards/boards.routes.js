import { Router } from 'express';
import * as boardsController from './boards.controller.js';

const router = Router();

router.get('/', boardsController.getBoards);
router.post('/', boardsController.createBoard);

router.get('/:boardId', boardsController.getBoardById);
router.patch('/:boardId', boardsController.updateBoard);
router.delete('/:boardId', boardsController.deleteBoard);
router.patch('/:boardId/status', boardsController.updateBoardStatus);

router.get('/:boardId/members', boardsController.getBoardMembers);
router.post('/:boardId/members', boardsController.addBoardMember);
router.delete('/:boardId/members/:memberId', boardsController.removeBoardMember);

router.get('/:boardId/activities', boardsController.getBoardActivities);

// Lists under Board
router.get('/:boardId/lists', boardsController.getBoardLists);
router.post('/:boardId/lists', boardsController.createBoardList);

export default router;
