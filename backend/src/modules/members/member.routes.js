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

// All member & workspace administration routes require authenticated JWT
router.use(authenticate);

// 1. GET /dashboard - Workspace dashboard
router.get('/dashboard', memberController.getDashboard);

// 2. GET /members - Workspace members
router.get('/members', memberController.getMembers);

// 3. POST /members - Add existing user to workspace
router.post(
  '/members',
  validateRequest(addMemberSchema, 'body'),
  memberController.addMember
);

// 4. GET /members/:memberId - Member details
router.get(
  '/members/:memberId',
  validateRequest(memberIdParamSchema, 'params'),
  memberController.getMemberDetails
);

// 5. PATCH /members/:memberId/role - Change workspace role
router.patch(
  '/members/:memberId/role',
  validateRequest(memberIdParamSchema, 'params'),
  validateRequest(updateMemberRoleSchema, 'body'),
  memberController.updateMemberRole
);

// 6. DELETE /members/:memberId - Remove member from workspace
router.delete(
  '/members/:memberId',
  validateRequest(memberIdParamSchema, 'params'),
  memberController.removeMember
);

// 7. POST /invitations - Invite new member
router.post(
  '/invitations',
  validateRequest(inviteMemberSchema, 'body'),
  memberController.inviteMember
);

// 8. GET /invitations - All invitations
router.get('/invitations', memberController.getInvitations);

// 9. DELETE /invitations/:invitationId - Cancel invitation
router.delete(
  '/invitations/:invitationId',
  validateRequest(invitationIdParamSchema, 'params'),
  memberController.cancelInvitation
);

export default router;