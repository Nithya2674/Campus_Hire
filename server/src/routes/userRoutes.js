import express from 'express';
import { getProfile, updateProfile } from '../controllers/userController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { validateBody } from '../middleware/validateMiddleware.js';
import { updateProfileSchema } from '../validators/userValidators.js';

const router = express.Router();

router.get('/me', authenticate, getProfile);
router.patch('/me', authenticate, validateBody(updateProfileSchema), updateProfile);

export default router;
