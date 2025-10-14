import express, { NextFunction, Request, Response, Router, RequestHandler } from 'express';
import { check, validationResult } from 'express-validator';
import authenticate, { AuthenticatedRequest } from '../middleware/auth';
import HealthTask from '../models/HealthTask';

// Helper function for async error handling
const asyncHandler =
  (fn: (req: Request, res: Response, next: NextFunction) => Promise<void>): RequestHandler =>
  (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };

// Middleware to handle validation errors
const handleValidationErrors: RequestHandler = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }
  next();
};

// Middleware to ensure user owns the health task
const mustOwnHealthTask = (): RequestHandler =>
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const taskId = req.params.id;
    
    try {
      const task = await HealthTask.findById(taskId);
      
      if (!task) {
        res.status(404).json({ error: 'Health task not found' });
        return;
      }

      if (String(task.assignee) !== String(req.user._id)) {
        res.status(403).json({ error: 'You can only modify your own health tasks' });
        return;
      }

      req.healthTask = task;
      next();
    } catch (error) {
      res.status(400).json({ error: 'Invalid health task ID' });
    }
  };

// Health task validation
const healthTaskValidation = [
  check('title')
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ min: 1, max: 200 })
    .withMessage('Title must be between 1 and 200 characters'),
  check('healthCategory')
    .notEmpty()
    .withMessage('Health category is required')
    .isIn(['exercise', 'medical', 'mental_health', 'nutrition', 'sleep', 'medication', 'checkup', 'therapy', 'other'])
    .withMessage('Invalid health category'),
  check('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'urgent'])
    .withMessage('Invalid priority level'),
  check('estimatedDuration')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Estimated duration must be at least 1 minute'),
  check('actualDuration')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Actual duration must be at least 1 minute'),
  check('isRecurring')
    .optional()
    .isBoolean()
    .withMessage('isRecurring must be a boolean'),
  check('healthNotes')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Health notes must be less than 1000 characters'),
  check('mood')
    .optional()
    .isIn(['excellent', 'good', 'neutral', 'poor', 'terrible'])
    .withMessage('Invalid mood value'),
  check('energyLevel')
    .optional()
    .isInt({ min: 1, max: 10 })
    .withMessage('Energy level must be between 1 and 10'),
  check('painLevel')
    .optional()
    .isInt({ min: 0, max: 10 })
    .withMessage('Pain level must be between 0 and 10')
];

const router: Router = express.Router();

// ========================= HEALTH TASK ROUTES =========================

// @route   GET /api/health-tasks
// @desc    Get all health tasks for authenticated user
// @access  Private
router.get('/', authenticate, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!._id;
  const { healthCategory, priority, status, mood, page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

  const query: any = { assignee: userId };
  
  if (healthCategory) query.healthCategory = healthCategory;
  if (priority) query.priority = priority;
  if (status) query.status = status;
  if (mood) query.mood = mood;

  const skip = (Number(page) - 1) * Number(limit);
  const sortOptions: any = {};
  sortOptions[sortBy as string] = sortOrder === 'desc' ? -1 : 1;

  const healthTasks = await HealthTask.find(query)
    .skip(skip)
    .limit(Number(limit))
    .sort(sortOptions)
    .populate('assignee', 'name email');

  const total = await HealthTask.countDocuments(query);

  res.status(200).json({
    healthTasks,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / Number(limit))
    }
  });
}));

// @route   GET /api/health-tasks/stats
// @desc    Get health task statistics
// @access  Private
router.get('/stats', authenticate, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!._id;
  const { period = '30' } = req.query; // days

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - Number(period));

  const healthTasks = await HealthTask.find({
    assignee: userId,
    createdAt: { $gte: startDate }
  });

  const stats = {
    totalHealthTasks: healthTasks.length,
    byCategory: {
      exercise: healthTasks.filter(t => t.healthCategory === 'exercise').length,
      medical: healthTasks.filter(t => t.healthCategory === 'medical').length,
      mental_health: healthTasks.filter(t => t.healthCategory === 'mental_health').length,
      nutrition: healthTasks.filter(t => t.healthCategory === 'nutrition').length,
      sleep: healthTasks.filter(t => t.healthCategory === 'sleep').length,
      medication: healthTasks.filter(t => t.healthCategory === 'medication').length,
      checkup: healthTasks.filter(t => t.healthCategory === 'checkup').length,
      therapy: healthTasks.filter(t => t.healthCategory === 'therapy').length,
      other: healthTasks.filter(t => t.healthCategory === 'other').length
    },
    byMood: {
      excellent: healthTasks.filter(t => t.mood === 'excellent').length,
      good: healthTasks.filter(t => t.mood === 'good').length,
      neutral: healthTasks.filter(t => t.mood === 'neutral').length,
      poor: healthTasks.filter(t => t.mood === 'poor').length,
      terrible: healthTasks.filter(t => t.mood === 'terrible').length
    },
    averageEnergyLevel: healthTasks.length > 0 
      ? Math.round(healthTasks.reduce((sum, t) => sum + (t.energyLevel || 0), 0) / healthTasks.length)
      : 0,
    averagePainLevel: healthTasks.length > 0 
      ? Math.round(healthTasks.reduce((sum, t) => sum + (t.painLevel || 0), 0) / healthTasks.length)
      : 0,
    recurringTasks: healthTasks.filter(t => t.isRecurring).length,
    completedTasks: healthTasks.filter(t => t.status === 'completed').length,
    completionRate: healthTasks.length > 0 
      ? Math.round((healthTasks.filter(t => t.status === 'completed').length / healthTasks.length) * 100)
      : 0
  };

  res.status(200).json(stats);
}));

// @route   POST /api/health-tasks
// @desc    Create a new health task
// @access  Private
router.post('/', authenticate, healthTaskValidation, handleValidationErrors, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const healthTask = new HealthTask({
    ...req.body,
    assignee: req.user!._id,
    taskType: 'health'
  });

  await healthTask.save();
  res.status(201).json(healthTask);
}));

// @route   GET /api/health-tasks/:id
// @desc    Get a specific health task
// @access  Private
router.get('/:id', authenticate, mustOwnHealthTask(), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  res.status(200).json(req.healthTask);
}));

// @route   PUT /api/health-tasks/:id
// @desc    Update a specific health task
// @access  Private
router.put('/:id', authenticate, mustOwnHealthTask(), healthTaskValidation, handleValidationErrors, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const updatedHealthTask = await HealthTask.findByIdAndUpdate(
    req.params.id,
    { ...req.body },
    { new: true, runValidators: true }
  );

  res.status(200).json(updatedHealthTask);
}));

// @route   DELETE /api/health-tasks/:id
// @desc    Delete a specific health task
// @access  Private
router.delete('/:id', authenticate, mustOwnHealthTask(), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  await HealthTask.findByIdAndDelete(req.params.id);
  res.status(200).json({ message: 'Health task deleted successfully' });
}));

export default router;
