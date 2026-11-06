import { Router } from 'express';
import * as notificationsController from './notifications.controller.js';

const router = Router();

router.get('/', notificationsController.getNotifications);
router.get('/unread', notificationsController.getUnreadNotifications);
router.patch('/read-all', notificationsController.markAllAsRead);

router.get('/settings', notificationsController.getNotificationSettings);
router.patch('/settings', notificationsController.updateNotificationSettings);

router.patch('/:notificationId/read', notificationsController.markNotificationAsRead);
router.delete('/:notificationId', notificationsController.deleteNotification);

export default router;
