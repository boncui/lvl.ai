import { Router } from 'express';
import authenticate, { AuthenticatedRequest } from '../middleware/auth';

// Import auth routes
import authRoutes from './authRoutes';

// Import task routes
import taskRoutes from './taskRoutes';

// Import user and friend routes
import userRoutes from './userRoutes';
import friendRoutes from './friendRoutes';

// Import AI organizer routes
import organizerRoutes from './organizerAgentRoutes';

const router = Router();

// @route   GET /api/
// @desc    API status
// @access  Public
router.get('/', (_req, res) => {
  res.json({
    message: 'LVL.AI API',
    version: '2.0.0',
    status: 'active',
    timestamp: new Date().toISOString(),
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      friends: '/api/friends',
      tasks: '/api/tasks',
      organizer: '/api/organizer',
    }
  });
});

// @route   GET /api/protected
// @desc    Protected route example
// @access  Private
router.get('/protected', authenticate, (req: AuthenticatedRequest, res) => {
  res.json({
    message: 'This is a protected route',
    user: req.user
  });
});

// Mount auth routes
router.use('/auth', authRoutes);

// Mount user and friend routes
router.use('/users', userRoutes);
router.use('/friends', friendRoutes);

// Mount task routes
router.use('/tasks', taskRoutes);

// Mount AI organizer routes
router.use('/organizer', organizerRoutes);

export default router;
