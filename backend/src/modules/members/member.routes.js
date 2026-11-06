import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate.js';
import { validateRequest } from '../../middleware/validateRequest.js';
import * as memberController from './member.controller.js';
import {
  memberIdParamSchema,
  addMemberSchema,
  updateMemberRoleSchema,
  inviteMemberSchema,
  invitationIdParamSchema
} from './member.validation.js';

const router = Router({ mergeParams: true });

router.use(authenticate);

router.get('/dashboard', memberController.getDashboard);
router.get('/members', memberController.getMembers);
router.post(
  '/members',
  validateRequest(addMemberSchema, 'body'),
  memberController.addMember
);
router.get(
  '/members/:memberId',
  validateRequest(memberIdParamSchema, 'params'),
  memberController.getMemberDetails
);
router.patch(
  '/members/:memberId/role',
  validateRequest(memberIdParamSchema, 'params'),
  validateRequest(updateMemberRoleSchema, 'body'),
  memberController.updateMemberRole
);
router.delete(
  '/members/:memberId',
  validateRequest(memberIdParamSchema, 'params'),
  memberController.removeMember
);

router.post(
  '/invitations',
  validateRequest(inviteMemberSchema, 'body'),
  memberController.inviteMember
);
router.get('/invitations', memberController.getInvitations);
router.delete(
  '/invitations/:invitationId',
  validateRequest(invitationIdParamSchema, 'params'),
  memberController.cancelInvitation
);

export default router;
