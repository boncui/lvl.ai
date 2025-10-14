import express, { NextFunction, Request, Response, Router, RequestHandler } from 'express';
import { check, validationResult } from 'express-validator';
import authenticate, { AuthenticatedRequest } from '../middleware/auth';
import PersonalTask from '../models/PersonalTask';

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

// Middleware to ensure user owns the personal task
const mustOwnPersonalTask = (): RequestHandler =>
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const taskId = req.params.id;
    
    try {
      const task = await PersonalTask.findById(taskId);
      
      if (!task) {
        res.status(404).json({ error: 'Personal task not found' });
        return;
      }

      if (String(task.assignee) !== String(req.user._id)) {
        res.status(403).json({ error: 'You can only modify your own personal tasks' });
        return;
      }

      req.personalTask = task;
      next();
    } catch (error) {
      res.status(400).json({ error: 'Invalid personal task ID' });
    }
  };

// Personal task validation
const personalTaskValidation = [
  check('title')
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ min: 1, max: 200 })
    .withMessage('Title must be between 1 and 200 characters'),
  check('personalCategory')
    .notEmpty()
    .withMessage('Personal category is required')
    .isIn(['self_care', 'hobby', 'learning', 'fitness', 'social', 'family', 'finance', 'home', 'travel', 'other'])
    .withMessage('Invalid personal category'),
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
  check('cost')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Cost must be a non-negative number'),
  check('isRecurring')
    .optional()
    .isBoolean()
    .withMessage('isRecurring must be a boolean'),
  check('mood')
    .optional()
    .isIn(['excited', 'motivated', 'neutral', 'tired', 'stressed', 'happy', 'sad', 'anxious'])
    .withMessage('Invalid mood value'),
  check('notes')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Notes must be less than 1000 characters')
];

const router: Router = express.Router();

// ========================= PERSONAL TASK ROUTES =========================

// @route   GET /api/personal-tasks
// @desc    Get all personal tasks for authenticated user
// @access  Private
router.get('/', authenticate, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!._id;
  const { personalCategory, priority, status, mood, page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

  const query: any = { assignee: userId };
  
  if (personalCategory) query.personalCategory = personalCategory;
  if (priority) query.priority = priority;
  if (status) query.status = status;
  if (mood) query.mood = mood;

  const skip = (Number(page) - 1) * Number(limit);
  const sortOptions: any = {};
  sortOptions[sortBy as string] = sortOrder === 'desc' ? -1 : 1;

  const personalTasks = await PersonalTask.find(query)
    .skip(skip)
    .limit(Number(limit))
    .sort(sortOptions)
    .populate('assignee', 'name email');

  const total = await PersonalTask.countDocuments(query);

  res.status(200).json({
    personalTasks,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / Number(limit))
    }
  });
}));

// @route   GET /api/personal-tasks/stats
// @desc    Get personal task statistics
// @access  Private
router.get('/stats', authenticate, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!._id;
  const { period = '30' } = req.query; // days

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - Number(period));

  const personalTasks = await PersonalTask.find({
    assignee: userId,
    createdAt: { $gte: startDate }
  });

  const stats = {
    totalPersonalTasks: personalTasks.length,
    byCategory: {
      self_care: personalTasks.filter(t => t.personalCategory === 'self_care').length,
      hobby: personalTasks.filter(t => t.personalCategory === 'hobby').length,
      learning: personalTasks.filter(t => t.personalCategory === 'learning').length,
      fitness: personalTasks.filter(t => t.personalCategory === 'fitness').length,
      social: personalTasks.filter(t => t.personalCategory === 'social').length,
      family: personalTasks.filter(t => t.personalCategory === 'family').length,
      finance: personalTasks.filter(t => t.personalCategory === 'finance').length,
      home: personalTasks.filter(t => t.personalCategory === 'home').length,
      travel: personalTasks.filter(t => t.personalCategory === 'travel').length,
      other: personalTasks.filter(t => t.personalCategory === 'other').length
    },
    byPriority: {
      low: personalTasks.filter(t => t.priority === 'low').length,
      medium: personalTasks.filter(t => t.priority === 'medium').length,
      high: personalTasks.filter(t => t.priority === 'high').length,
      urgent: personalTasks.filter(t => t.priority === 'urgent').length
    },
    byMood: {
      excited: personalTasks.filter(t => t.mood === 'excited').length,
      motivated: personalTasks.filter(t => t.mood === 'motivated').length,
      neutral: personalTasks.filter(t => t.mood === 'neutral').length,
      tired: personalTasks.filter(t => t.mood === 'tired').length,
      stressed: personalTasks.filter(t => t.mood === 'stressed').length,
      happy: personalTasks.filter(t => t.mood === 'happy').length,
      sad: personalTasks.filter(t => t.mood === 'sad').length,
      anxious: personalTasks.filter(t => t.mood === 'anxious').length
    },
    recurringTasks: personalTasks.filter(t => t.isRecurring).length,
    oneTimeTasks: personalTasks.filter(t => !t.isRecurring).length,
    totalCost: personalTasks.reduce((sum, t) => sum + (t.cost || 0), 0),
    averageCost: personalTasks.length > 0 
      ? Math.round(personalTasks.reduce((sum, t) => sum + (t.cost || 0), 0) / personalTasks.length)
      : 0,
    completedTasks: personalTasks.filter(t => t.status === 'completed').length,
    completionRate: personalTasks.length > 0 
      ? Math.round((personalTasks.filter(t => t.status === 'completed').length / personalTasks.length) * 100)
      : 0
  };

  res.status(200).json(stats);
}));

// @route   POST /api/personal-tasks
// @desc    Create a new personal task
// @access  Private
router.post('/', authenticate, personalTaskValidation, handleValidationErrors, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const personalTask = new PersonalTask({
    ...req.body,
    assignee: req.user!._id,
    taskType: 'personal'
  });

  await personalTask.save();
  res.status(201).json(personalTask);
}));

// @route   GET /api/personal-tasks/:id
// @desc    Get a specific personal task
// @access  Private
router.get('/:id', authenticate, mustOwnPersonalTask(), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  res.status(200).json(req.personalTask);
}));

// @route   PUT /api/personal-tasks/:id
// @desc    Update a specific personal task
// @access  Private
router.put('/:id', authenticate, mustOwnPersonalTask(), personalTaskValidation, handleValidationErrors, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const updatedPersonalTask = await PersonalTask.findByIdAndUpdate(
    req.params.id,
    { ...req.body },
    { new: true, runValidators: true }
  );

  res.status(200).json(updatedPersonalTask);
}));

// @route   DELETE /api/personal-tasks/:id
// @desc    Delete a specific personal task
// @access  Private
router.delete('/:id', authenticate, mustOwnPersonalTask(), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  await PersonalTask.findByIdAndDelete(req.params.id);
  res.status(200).json({ message: 'Personal task deleted successfully' });
}));

// @route   GET /api/personal-tasks/search/category
// @desc    Search personal tasks by category
// @access  Private
router.get('/search/category', authenticate, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { category, page = 1, limit = 10 } = req.query;
  
  if (!category) {
    res.status(400).json({ error: 'Category search term is required' });
    return;
  }

  const userId = req.user!._id;
  const skip = (Number(page) - 1) * Number(limit);

  const personalTasks = await PersonalTask.find({
    assignee: userId,
    personalCategory: { $regex: category, $options: 'i' }
  })
    .skip(skip)
    .limit(Number(limit))
    .sort({ createdAt: -1 });

  res.status(200).json({
    personalTasks,
    searchTerm: category,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total: personalTasks.length
    }
  });
}));

// @route   GET /api/personal-tasks/mood-tracking
// @desc    Get mood tracking data
// @access  Private
router.get('/mood-tracking', authenticate, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!._id;
  const { period = '30' } = req.query; // days

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - Number(period));

  const personalTasks = await PersonalTask.find({
    assignee: userId,
    createdAt: { $gte: startDate },
    mood: { $exists: true, $ne: null }
  })
    .sort({ createdAt: -1 });

  const moodTracking = personalTasks.map(task => ({
    date: task.createdAt,
    mood: task.mood,
    category: task.personalCategory,
    title: task.title,
    status: task.status
  }));

  res.status(200).json({
    moodTracking,
    period: `${period} days`,
    total: moodTracking.length
  });
}));

export default router;
