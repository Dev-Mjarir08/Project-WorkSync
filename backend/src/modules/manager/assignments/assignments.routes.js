import { Router } from 'express';
import * as assignmentsController from './assignments.controller.js';

const router = Router();

router.get('/', assignmentsController.getAssignments);
router.post('/', assignmentsController.assignTaskToMember);

router.get('/:assignmentId', assignmentsController.getAssignmentById);
router.patch('/:assignmentId', assignmentsController.updateAssignment);
router.delete('/:assignmentId', assignmentsController.removeAssignment);

export default router;
