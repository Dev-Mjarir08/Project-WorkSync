import { Router } from 'express';
import * as memberController from './member.controller.js';

const router = Router();

router.get('/', memberController.getMembers);
router.post('/', memberController.addMember);
router.get('/:memberId', memberController.getMemberById);
router.patch('/:memberId', memberController.updateMember);
router.patch('/:memberId/role', memberController.updateMemberRole);
router.patch('/:memberId/status', memberController.updateMemberStatus);
router.delete('/:memberId', memberController.removeMember);
router.get('/:memberId/activities', memberController.getMemberActivities);
router.get('/:memberId/tasks', memberController.getMemberTasks);
router.get('/:memberId/boards', memberController.getMemberBoards);

export default router;
