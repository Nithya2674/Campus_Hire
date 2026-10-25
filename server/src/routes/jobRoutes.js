import express from 'express';
import {
  getAllJobs,
  getJobById,
  createJob,
  updateJob,
  publishJob,
  closeJob,
  deleteJob,
  checkJobEligibilityEndpoint,
  applyJob,
} from '../controllers/jobController.js';
import { getJobApplications } from '../controllers/applicationController.js';
import { authenticate, optionalAuth } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';
import { validateBody } from '../middleware/validateMiddleware.js';
import { createJobSchema, updateJobSchema } from '../validators/jobValidators.js';
import { applyJobSchema } from '../validators/applicationValidators.js';

const router = express.Router();

router.get('/', optionalAuth, getAllJobs);
router.get('/:id', optionalAuth, getJobById);
router.post(
  '/',
  authenticate,
  authorizeRoles('recruiter', 'admin'),
  validateBody(createJobSchema),
  createJob
);
router.patch(
  '/:id',
  authenticate,
  authorizeRoles('recruiter', 'admin'),
  validateBody(updateJobSchema),
  updateJob
);
router.patch(
  '/:id/publish',
  authenticate,
  authorizeRoles('recruiter', 'admin'),
  publishJob
);
router.patch(
  '/:id/close',
  authenticate,
  authorizeRoles('recruiter', 'admin'),
  closeJob
);
router.delete(
  '/:id',
  authenticate,
  authorizeRoles('recruiter', 'admin'),
  deleteJob
);

// Student job actions
router.get(
  '/:id/eligibility',
  authenticate,
  authorizeRoles('student'),
  checkJobEligibilityEndpoint
);
router.post(
  '/:id/apply',
  authenticate,
  authorizeRoles('student'),
  validateBody(applyJobSchema),
  applyJob
);

// Recruiter/Admin view applicants for this job
router.get(
  '/:id/applications',
  authenticate,
  authorizeRoles('recruiter', 'admin'),
  getJobApplications
);

export default router;
