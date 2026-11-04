import { Router } from 'express';
import * as announcementsController from './announcements.controller.js';
import { validateRequest } from '../../../middleware/validateRequest.js';
import {
  announcementIdParamSchema,
  getAnnouncementsQuerySchema,
  createAnnouncementSchema,
  updateAnnouncementSchema
} from '../superAdmin.validation.js';

const router = Router();

router.get('/', validateRequest(getAnnouncementsQuerySchema, 'query'), announcementsController.getAnnouncements);
router.post('/', validateRequest(createAnnouncementSchema, 'body'), announcementsController.createAnnouncement);
router.get('/:announcementId', validateRequest(announcementIdParamSchema, 'params'), announcementsController.getAnnouncementById);
router.patch(
  '/:announcementId',
  validateRequest(announcementIdParamSchema, 'params'),
  validateRequest(updateAnnouncementSchema, 'body'),
  announcementsController.updateAnnouncement
);
router.delete('/:announcementId', validateRequest(announcementIdParamSchema, 'params'), announcementsController.deleteAnnouncement);
router.patch('/:announcementId/publish', validateRequest(announcementIdParamSchema, 'params'), announcementsController.publishAnnouncement);
router.patch('/:announcementId/archive', validateRequest(announcementIdParamSchema, 'params'), announcementsController.archiveAnnouncement);

export default router;

