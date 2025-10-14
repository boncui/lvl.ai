import express, { NextFunction, Request, Response, Router, RequestHandler } from 'express';
import { check, validationResult } from 'express-validator';
import authenticate, { AuthenticatedRequest } from '../middleware/auth';
import SocialTask from '../models/SocialTask';

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

// Middleware to ensure user owns the social task
const mustOwnSocialTask = (): RequestHandler =>
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const taskId = req.params.id;
    
    try {
      const task = await SocialTask.findById(taskId);
      
      if (!task) {
        res.status(404).json({ error: 'Social task not found' });
        return;
      }

      if (String(task.assignee) !== String(req.user._id)) {
        res.status(403).json({ error: 'You can only modify your own social tasks' });
        return;
      }

      req.socialTask = task;
      next();
    } catch (error) {
      res.status(400).json({ error: 'Invalid social task ID' });
    }
  };

// Social task validation
const socialTaskValidation = [
  check('title')
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ min: 1, max: 200 })
    .withMessage('Title must be between 1 and 200 characters'),
  check('socialCategory')
    .notEmpty()
    .withMessage('Social category is required')
    .isIn(['family', 'friends', 'networking', 'dating', 'community', 'volunteer', 'event', 'other'])
    .withMessage('Invalid social category'),
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
  check('socialNotes')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Social notes must be less than 1000 characters'),
  check('mood')
    .optional()
    .isIn(['excited', 'happy', 'neutral', 'nervous', 'anxious', 'sad', 'lonely'])
    .withMessage('Invalid mood value'),
  check('energyLevel')
    .optional()
    .isInt({ min: 1, max: 10 })
    .withMessage('Energy level must be between 1 and 10')
];

const router: Router = express.Router();

// ========================= SOCIAL TASK ROUTES =========================

// @route   GET /api/social-tasks
// @desc    Get all social tasks for authenticated user
// @access  Private
router.get('/', authenticate, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!._id;
  const { socialCategory, priority, status, mood, page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

  const query: any = { assignee: userId };
  
  if (socialCategory) query.socialCategory = socialCategory;
  if (priority) query.priority = priority;
  if (status) query.status = status;
  if (mood) query.mood = mood;

  const skip = (Number(page) - 1) * Number(limit);
  const sortOptions: any = {};
  sortOptions[sortBy as string] = sortOrder === 'desc' ? -1 : 1;

  const socialTasks = await SocialTask.find(query)
    .skip(skip)
    .limit(Number(limit))
    .sort(sortOptions)
    .populate('assignee', 'name email');

  const total = await SocialTask.countDocuments(query);

  res.status(200).json({
    socialTasks,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / Number(limit))
    }
  });
}));

// @route   GET /api/social-tasks/stats
// @desc    Get social task statistics
// @access  Private
router.get('/stats', authenticate, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!._id;
  const { period = '30' } = req.query; // days

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - Number(period));

  const socialTasks = await SocialTask.find({
    assignee: userId,
    createdAt: { $gte: startDate }
  });

  const stats = {
    totalSocialTasks: socialTasks.length,
    byCategory: {
      family: socialTasks.filter(t => t.socialCategory === 'family').length,
      friends: socialTasks.filter(t => t.socialCategory === 'friends').length,
      networking: socialTasks.filter(t => t.socialCategory === 'networking').length,
      dating: socialTasks.filter(t => t.socialCategory === 'dating').length,
      community: socialTasks.filter(t => t.socialCategory === 'community').length,
      volunteer: socialTasks.filter(t => t.socialCategory === 'volunteer').length,
      event: socialTasks.filter(t => t.socialCategory === 'event').length,
      other: socialTasks.filter(t => t.socialCategory === 'other').length
    },
    byMood: {
      excited: socialTasks.filter(t => t.mood === 'excited').length,
      happy: socialTasks.filter(t => t.mood === 'happy').length,
      neutral: socialTasks.filter(t => t.mood === 'neutral').length,
      nervous: socialTasks.filter(t => t.mood === 'nervous').length,
      anxious: socialTasks.filter(t => t.mood === 'anxious').length,
      sad: socialTasks.filter(t => t.mood === 'sad').length,
      lonely: socialTasks.filter(t => t.mood === 'lonely').length
    },
    averageEnergyLevel: socialTasks.length > 0 
      ? Math.round(socialTasks.reduce((sum, t) => sum + (t.energyLevel || 0), 0) / socialTasks.length)
      : 0,
    recurringTasks: socialTasks.filter(t => t.isRecurring).length,
    completedTasks: socialTasks.filter(t => t.status === 'completed').length,
    completionRate: socialTasks.length > 0 
      ? Math.round((socialTasks.filter(t => t.status === 'completed').length / socialTasks.length) * 100)
      : 0
  };

  res.status(200).json(stats);
}));

// @route   POST /api/social-tasks
// @desc    Create a new social task
// @access  Private
router.post('/', authenticate, socialTaskValidation, handleValidationErrors, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const socialTask = new SocialTask({
    ...req.body,
    assignee: req.user!._id,
    taskType: 'social'
  });

  await socialTask.save();
  res.status(201).json(socialTask);
}));

// @route   GET /api/social-tasks/:id
// @desc    Get a specific social task
// @access  Private
router.get('/:id', authenticate, mustOwnSocialTask(), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  res.status(200).json(req.socialTask);
}));

// @route   PUT /api/social-tasks/:id
// @desc    Update a specific social task
// @access  Private
router.put('/:id', authenticate, mustOwnSocialTask(), socialTaskValidation, handleValidationErrors, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const updatedSocialTask = await SocialTask.findByIdAndUpdate(
    req.params.id,
    { ...req.body },
    { new: true, runValidators: true }
  );

  res.status(200).json(updatedSocialTask);
}));

// @route   DELETE /api/social-tasks/:id
// @desc    Delete a specific social task
// @access  Private
router.delete('/:id', authenticate, mustOwnSocialTask(), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  await SocialTask.findByIdAndDelete(req.params.id);
  res.status(200).json({ message: 'Social task deleted successfully' });
}));

export default router;
