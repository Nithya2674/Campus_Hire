import express from 'express';
import {
  getStats,
  getUsers,
  toggleUserStatus,
  getAdminJobs,
  getAdminApplications,
} from '../controllers/adminController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';

const router = express.Router();

// All admin routes require admin role
router.use(authenticate, authorizeRoles('admin'));

router.get('/stats', getStats);
router.get('/users', getUsers);
router.patch('/users/:id/status', toggleUserStatus);
router.get('/jobs', getAdminJobs);
router.get('/applications', getAdminApplications);

export default router;
