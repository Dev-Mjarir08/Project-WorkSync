import { Router } from 'express';
import * as announcementsController from './announcements.controller.js';

const router = Router();

router.get('/', announcementsController.getAnnouncements);
router.post('/', announcementsController.createAnnouncement);

router.get('/:announcementId', announcementsController.getAnnouncementById);
router.patch('/:announcementId', announcementsController.updateAnnouncement);
router.delete('/:announcementId', announcementsController.deleteAnnouncement);

router.patch('/:announcementId/publish', announcementsController.publishAnnouncement);
router.patch('/:announcementId/archive', announcementsController.archiveAnnouncement);

export default router;
