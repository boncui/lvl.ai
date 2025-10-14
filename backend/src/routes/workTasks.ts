import express, { NextFunction, Request, Response, Router, RequestHandler } from 'express';
import { check, validationResult } from 'express-validator';
import authenticate, { AuthenticatedRequest } from '../middleware/auth';
import WorkTask from '../models/WorkTask';

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

// Middleware to ensure user owns the work task
const mustOwnWorkTask = (): RequestHandler =>
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const taskId = req.params.id;
    
    try {
      const task = await WorkTask.findById(taskId);
      
      if (!task) {
        res.status(404).json({ error: 'Work task not found' });
        return;
      }

      if (String(task.assignee) !== String(req.user._id)) {
        res.status(403).json({ error: 'You can only modify your own work tasks' });
        return;
      }

      req.workTask = task;
      next();
    } catch (error) {
      res.status(400).json({ error: 'Invalid work task ID' });
    }
  };

// Work task validation
const workTaskValidation = [
  check('title')
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ min: 1, max: 200 })
    .withMessage('Title must be between 1 and 200 characters'),
  check('workCategory')
    .notEmpty()
    .withMessage('Work category is required')
    .isIn(['meeting', 'email', 'documentation', 'coding', 'testing', 'design', 'research', 'presentation', 'other'])
    .withMessage('Invalid work category'),
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
  check('deadline')
    .optional()
    .isISO8601()
    .withMessage('Invalid deadline format'),
  check('isBillable')
    .optional()
    .isBoolean()
    .withMessage('isBillable must be a boolean'),
  check('hourlyRate')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Hourly rate must be a non-negative number'),
  check('clientName')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Client name must be less than 100 characters'),
  check('projectName')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Project name must be less than 100 characters'),
  check('notes')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Notes must be less than 1000 characters')
];

const router: Router = express.Router();

// ========================= WORK TASK ROUTES =========================

// @route   GET /api/work-tasks
// @desc    Get all work tasks for authenticated user
// @access  Private
router.get('/', authenticate, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!._id;
  const { workCategory, priority, status, isBillable, page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

  const query: any = { assignee: userId };
  
  if (workCategory) query.workCategory = workCategory;
  if (priority) query.priority = priority;
  if (status) query.status = status;
  if (isBillable !== undefined) query.isBillable = isBillable === 'true';

  const skip = (Number(page) - 1) * Number(limit);
  const sortOptions: any = {};
  sortOptions[sortBy as string] = sortOrder === 'desc' ? -1 : 1;

  const workTasks = await WorkTask.find(query)
    .skip(skip)
    .limit(Number(limit))
    .sort(sortOptions)
    .populate('assignee', 'name email');

  const total = await WorkTask.countDocuments(query);

  res.status(200).json({
    workTasks,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / Number(limit))
    }
  });
}));

// @route   GET /api/work-tasks/stats
// @desc    Get work task statistics
// @access  Private
router.get('/stats', authenticate, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!._id;
  const { period = '30' } = req.query; // days

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - Number(period));

  const workTasks = await WorkTask.find({
    assignee: userId,
    createdAt: { $gte: startDate }
  });

  const stats = {
    totalWorkTasks: workTasks.length,
    byCategory: {
      meeting: workTasks.filter(t => t.workCategory === 'meeting').length,
      email: workTasks.filter(t => t.workCategory === 'email').length,
      documentation: workTasks.filter(t => t.workCategory === 'documentation').length,
      coding: workTasks.filter(t => t.workCategory === 'coding').length,
      testing: workTasks.filter(t => t.workCategory === 'testing').length,
      design: workTasks.filter(t => t.workCategory === 'design').length,
      research: workTasks.filter(t => t.workCategory === 'research').length,
      presentation: workTasks.filter(t => t.workCategory === 'presentation').length,
      other: workTasks.filter(t => t.workCategory === 'other').length
    },
    billableTasks: workTasks.filter(t => t.isBillable).length,
    nonBillableTasks: workTasks.filter(t => !t.isBillable).length,
    totalBillableHours: workTasks
      .filter(t => t.isBillable && t.actualDuration)
      .reduce((sum, t) => sum + (t.actualDuration || 0), 0),
    totalEarnings: workTasks
      .filter(t => t.isBillable && t.actualDuration && t.hourlyRate)
      .reduce((sum, t) => sum + ((t.actualDuration || 0) / 60) * (t.hourlyRate || 0), 0),
    averageHourlyRate: workTasks.length > 0 
      ? Math.round(workTasks.reduce((sum, t) => sum + (t.hourlyRate || 0), 0) / workTasks.length)
      : 0,
    completedTasks: workTasks.filter(t => t.status === 'completed').length,
    completionRate: workTasks.length > 0 
      ? Math.round((workTasks.filter(t => t.status === 'completed').length / workTasks.length) * 100)
      : 0
  };

  res.status(200).json(stats);
}));

// @route   POST /api/work-tasks
// @desc    Create a new work task
// @access  Private
router.post('/', authenticate, workTaskValidation, handleValidationErrors, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const workTask = new WorkTask({
    ...req.body,
    assignee: req.user!._id,
    taskType: 'work'
  });

  await workTask.save();
  res.status(201).json(workTask);
}));

// @route   GET /api/work-tasks/:id
// @desc    Get a specific work task
// @access  Private
router.get('/:id', authenticate, mustOwnWorkTask(), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  res.status(200).json(req.workTask);
}));

// @route   PUT /api/work-tasks/:id
// @desc    Update a specific work task
// @access  Private
router.put('/:id', authenticate, mustOwnWorkTask(), workTaskValidation, handleValidationErrors, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const updatedWorkTask = await WorkTask.findByIdAndUpdate(
    req.params.id,
    { ...req.body },
    { new: true, runValidators: true }
  );

  res.status(200).json(updatedWorkTask);
}));

// @route   DELETE /api/work-tasks/:id
// @desc    Delete a specific work task
// @access  Private
router.delete('/:id', authenticate, mustOwnWorkTask(), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  await WorkTask.findByIdAndDelete(req.params.id);
  res.status(200).json({ message: 'Work task deleted successfully' });
}));

export default router;
