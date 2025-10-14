import express, { NextFunction, Request, Response, Router, RequestHandler } from 'express';
import { check, validationResult } from 'express-validator';
import authenticate, { AuthenticatedRequest } from '../middleware/auth';
import OtherTask from '../models/OtherTask';

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

// Middleware to ensure user owns the other task
const mustOwnOtherTask = (): RequestHandler =>
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const taskId = req.params.id;
    
    try {
      const task = await OtherTask.findById(taskId);
      
      if (!task) {
        res.status(404).json({ error: 'Other task not found' });
        return;
      }

      if (String(task.assignee) !== String(req.user._id)) {
        res.status(403).json({ error: 'You can only modify your own other tasks' });
        return;
      }

      req.otherTask = task;
      next();
    } catch (error) {
      res.status(400).json({ error: 'Invalid other task ID' });
    }
  };

// Other task validation
const otherTaskValidation = [
  check('title')
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ min: 1, max: 200 })
    .withMessage('Title must be between 1 and 200 characters'),
  check('otherCategory')
    .notEmpty()
    .withMessage('Other category is required')
    .isIn(['miscellaneous', 'errand', 'shopping', 'maintenance', 'travel', 'learning', 'hobby', 'other'])
    .withMessage('Invalid other category'),
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
  check('otherNotes')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Other notes must be less than 1000 characters'),
  check('mood')
    .optional()
    .isIn(['excited', 'motivated', 'neutral', 'tired', 'stressed', 'happy', 'sad', 'anxious'])
    .withMessage('Invalid mood value'),
  check('energyLevel')
    .optional()
    .isInt({ min: 1, max: 10 })
    .withMessage('Energy level must be between 1 and 10')
];

const router: Router = express.Router();

// ========================= OTHER TASK ROUTES =========================

// @route   GET /api/other-tasks
// @desc    Get all other tasks for authenticated user
// @access  Private
router.get('/', authenticate, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!._id;
  const { otherCategory, priority, status, mood, page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

  const query: any = { assignee: userId };
  
  if (otherCategory) query.otherCategory = otherCategory;
  if (priority) query.priority = priority;
  if (status) query.status = status;
  if (mood) query.mood = mood;

  const skip = (Number(page) - 1) * Number(limit);
  const sortOptions: any = {};
  sortOptions[sortBy as string] = sortOrder === 'desc' ? -1 : 1;

  const otherTasks = await OtherTask.find(query)
    .skip(skip)
    .limit(Number(limit))
    .sort(sortOptions)
    .populate('assignee', 'name email');

  const total = await OtherTask.countDocuments(query);

  res.status(200).json({
    otherTasks,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / Number(limit))
    }
  });
}));

// @route   GET /api/other-tasks/stats
// @desc    Get other task statistics
// @access  Private
router.get('/stats', authenticate, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!._id;
  const { period = '30' } = req.query; // days

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - Number(period));

  const otherTasks = await OtherTask.find({
    assignee: userId,
    createdAt: { $gte: startDate }
  });

  const stats = {
    totalOtherTasks: otherTasks.length,
    byCategory: {
      miscellaneous: otherTasks.filter(t => t.otherCategory === 'miscellaneous').length,
      errand: otherTasks.filter(t => t.otherCategory === 'errand').length,
      shopping: otherTasks.filter(t => t.otherCategory === 'shopping').length,
      maintenance: otherTasks.filter(t => t.otherCategory === 'maintenance').length,
      travel: otherTasks.filter(t => t.otherCategory === 'travel').length,
      learning: otherTasks.filter(t => t.otherCategory === 'learning').length,
      hobby: otherTasks.filter(t => t.otherCategory === 'hobby').length,
      other: otherTasks.filter(t => t.otherCategory === 'other').length
    },
    byMood: {
      excited: otherTasks.filter(t => t.mood === 'excited').length,
      motivated: otherTasks.filter(t => t.mood === 'motivated').length,
      neutral: otherTasks.filter(t => t.mood === 'neutral').length,
      tired: otherTasks.filter(t => t.mood === 'tired').length,
      stressed: otherTasks.filter(t => t.mood === 'stressed').length,
      happy: otherTasks.filter(t => t.mood === 'happy').length,
      sad: otherTasks.filter(t => t.mood === 'sad').length,
      anxious: otherTasks.filter(t => t.mood === 'anxious').length
    },
    averageEnergyLevel: otherTasks.length > 0 
      ? Math.round(otherTasks.reduce((sum, t) => sum + (t.energyLevel || 0), 0) / otherTasks.length)
      : 0,
    recurringTasks: otherTasks.filter(t => t.isRecurring).length,
    completedTasks: otherTasks.filter(t => t.status === 'completed').length,
    completionRate: otherTasks.length > 0 
      ? Math.round((otherTasks.filter(t => t.status === 'completed').length / otherTasks.length) * 100)
      : 0
  };

  res.status(200).json(stats);
}));

// @route   POST /api/other-tasks
// @desc    Create a new other task
// @access  Private
router.post('/', authenticate, otherTaskValidation, handleValidationErrors, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const otherTask = new OtherTask({
    ...req.body,
    assignee: req.user!._id,
    taskType: 'other'
  });

  await otherTask.save();
  res.status(201).json(otherTask);
}));

// @route   GET /api/other-tasks/:id
// @desc    Get a specific other task
// @access  Private
router.get('/:id', authenticate, mustOwnOtherTask(), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  res.status(200).json(req.otherTask);
}));

// @route   PUT /api/other-tasks/:id
// @desc    Update a specific other task
// @access  Private
router.put('/:id', authenticate, mustOwnOtherTask(), otherTaskValidation, handleValidationErrors, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const updatedOtherTask = await OtherTask.findByIdAndUpdate(
    req.params.id,
    { ...req.body },
    { new: true, runValidators: true }
  );

  res.status(200).json(updatedOtherTask);
}));

// @route   DELETE /api/other-tasks/:id
// @desc    Delete a specific other task
// @access  Private
router.delete('/:id', authenticate, mustOwnOtherTask(), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  await OtherTask.findByIdAndDelete(req.params.id);
  res.status(200).json({ message: 'Other task deleted successfully' });
}));

export default router;
