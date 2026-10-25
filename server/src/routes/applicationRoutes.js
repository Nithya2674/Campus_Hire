import express from 'express';
import {
  getMyApplications,
  withdrawApplication,
  updateApplicationStatus,
} from '../controllers/applicationController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';
import { validateBody } from '../middleware/validateMiddleware.js';
import { updateApplicationStatusSchema } from '../validators/applicationValidators.js';

const router = express.Router();

router.get('/mine', authenticate, authorizeRoles('student'), getMyApplications);
router.patch('/:id/withdraw', authenticate, authorizeRoles('student'), withdrawApplication);
router.patch(
  '/:id/status',
  authenticate,
  authorizeRoles('recruiter', 'admin'),
  validateBody(updateApplicationStatusSchema),
  updateApplicationStatus
);

export default router;
