import { Router } from 'express';
import * as commentsController from './comments.controller.js';

const router = Router();

// Routes mounted at /comments:
// GET /comments/:commentId
// PATCH /comments/:commentId
// DELETE /comments/:commentId
// POST /comments/:commentId/replies
// GET /comments/:commentId/replies
router.get('/:commentId', commentsController.getCommentById);
router.patch('/:commentId', commentsController.updateComment);
router.delete('/:commentId', commentsController.deleteComment);
router.post('/:commentId/replies', commentsController.addCommentReply);
router.get('/:commentId/replies', commentsController.getCommentReplies);

export default router;
