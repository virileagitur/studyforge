import { Router } from 'express';
import { registerUser, authUser, getUserProfile } from '../controllers/authController';
import { protect } from '../middleware/authMiddleware';

const router = Router();

// Public routes
router.post('/register', registerUser);
router.post('/login', authUser);

// Protected routes
router.route('/profile').get(protect, getUserProfile);

export default router;