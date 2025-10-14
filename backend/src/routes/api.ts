import { Router } from 'express';
import authenticate, { AuthenticatedRequest } from '../middleware/auth';

// Import all task routes
import tasksRoutes from './tasks';
import foodTasksRoutes from './foodTasks';
import homeworkTasksRoutes from './homeworkTasks';
import emailTasksRoutes from './emailTasks';
import meetingTasksRoutes from './meetingTasks';
import projectTasksRoutes from './projectTasks';
import workTasksRoutes from './workTasks';

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
      tasks: '/api/tasks',
      foodTasks: '/api/food-tasks',
      homeworkTasks: '/api/homework-tasks',
      emailTasks: '/api/email-tasks',
      meetingTasks: '/api/meeting-tasks',
      projectTasks: '/api/project-tasks',
      personalTasks: '/api/tasks/personal',
      workTasks: '/api/work-tasks',
      healthTasks: '/api/health-tasks',
      socialTasks: '/api/social-tasks',
      otherTasks: '/api/other-tasks'
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

// Mount all task routes
router.use('/tasks', tasksRoutes);
router.use('/food-tasks', foodTasksRoutes);
router.use('/homework-tasks', homeworkTasksRoutes);
router.use('/email-tasks', emailTasksRoutes);
router.use('/meeting-tasks', meetingTasksRoutes);
router.use('/project-tasks', projectTasksRoutes);
router.use('/work-tasks', workTasksRoutes);

export default router;
