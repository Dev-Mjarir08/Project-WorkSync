import { Router } from 'express';
import * as adminsController from './admins.controller.js';

const router = Router();

router.get('/', adminsController.getAllAdmins);

export default router;

