import { Router } from 'express';
import * as systemController from './system.controller.js';

const router = Router();

router.get('/health', systemController.getSystemHealth);
router.get('/database', systemController.getSystemDatabase);
router.get('/cache', systemController.getSystemCache);
router.get('/sockets', systemController.getSystemSockets);
router.get('/metrics', systemController.getSystemMetrics);

export default router;

