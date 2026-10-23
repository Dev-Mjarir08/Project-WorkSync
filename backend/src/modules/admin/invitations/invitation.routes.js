import { Router } from 'express';
import * as invitationController from './invitation.controller.js';

const router = Router();

router.post('/', invitationController.sendInvitation);
router.get('/', invitationController.getAllInvitations);

router.get('/pending', invitationController.getPendingInvitations);
router.get('/accepted', invitationController.getAcceptedInvitations);
router.get('/expired', invitationController.getExpiredInvitations);

router.get('/:invitationId', invitationController.getInvitationById);
router.patch('/:invitationId', invitationController.updateInvitation);
router.post('/:invitationId/resend', invitationController.resendInvitation);
router.delete('/:invitationId', invitationController.cancelInvitation);

export default router;
