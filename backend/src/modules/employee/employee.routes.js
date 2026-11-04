import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate.js';

const router = Router();

router.use(authenticate);

router.get('/dashboard', (req, res) => {
  res.status(200).json({ success: true, message: 'Employee dashboard metrics' });
});

router.get('/my-tasks', (req, res) => {
  res.status(200).json({ success: true, message: 'Employee assigned tasks' });
});

export default router;

