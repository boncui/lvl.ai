import { Router } from 'express';
import authenticate, { AuthenticatedRequest } from '../middleware/auth';

// Import auth routes
import authRoutes from './authRoutes';

// Import all task routes
import taskRoutes from './taskRoutes';
import foodRoutes from './foodRoutes';
import homeworkRoutes from './homeworkRoutes';
import emailRoutes from './emailRoutes';
import meetingRoutes from './meetingRoutes';
import projectRoutes from './projectRoutes';
import workRoutes from './workRoutes';

// Import user and friend routes
import userRoutes from './userRoutes';
import friendRoutes from './friendRoutes';

// Import additional task routes
import healthRoutes from './healthRoutes';

const router = Router();

// @route   GET /api/
// @desc    API status
// @access  Public
router.get('/', (_req, res) => {
  res.json({
    message: 'LVL.AI API',
    version: '1.0.0',
    status: 'active',
    timestamp: new Date().toISOString(),
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      friends: '/api/friends',
      tasks: '/api/tasks',
      foodTasks: '/api/food-tasks',
      homeworkTasks: '/api/homework-tasks',
      emailTasks: '/api/email-tasks',
      meetingTasks: '/api/meeting-tasks',
      projectTasks: '/api/project-tasks',
      workTasks: '/api/work-tasks',
      healthTasks: '/api/health-tasks',
      socialTasks: '/api/social-tasks',
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

// Mount all task routes
router.use('/tasks', taskRoutes);
router.use('/food-tasks', foodRoutes);
router.use('/homework-tasks', homeworkRoutes);
router.use('/email-tasks', emailRoutes);
router.use('/meeting-tasks', meetingRoutes);
router.use('/project-tasks', projectRoutes);
router.use('/work-tasks', workRoutes);
router.use('/health-tasks', healthRoutes);

export default router;
