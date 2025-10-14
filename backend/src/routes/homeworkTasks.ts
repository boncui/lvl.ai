import express, { NextFunction, Request, Response, Router, RequestHandler } from 'express';
import { check, validationResult } from 'express-validator';
import authenticate, { AuthenticatedRequest } from '../middleware/auth';
import HomeworkTask from '../models/HomeworkTask';
import User from '../models/User';

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

// Middleware to ensure user owns the homework task
const mustOwnHomeworkTask = (): RequestHandler =>
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const taskId = req.params.id;
    
    try {
      const task = await HomeworkTask.findById(taskId);
      
      if (!task) {
        res.status(404).json({ error: 'Homework task not found' });
        return;
      }

      if (String(task.assignee) !== String(req.user._id)) {
        res.status(403).json({ error: 'You can only modify your own homework tasks' });
        return;
      }

      req.homeworkTask = task;
      next();
    } catch (error) {
      res.status(400).json({ error: 'Invalid homework task ID' });
    }
  };

// Homework task validation
const homeworkTaskValidation = [
  check('title')
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ min: 1, max: 200 })
    .withMessage('Title must be between 1 and 200 characters'),
  check('subject')
    .notEmpty()
    .withMessage('Subject is required')
    .isLength({ min: 1, max: 50 })
    .withMessage('Subject must be between 1 and 50 characters'),
  check('assignmentType')
    .notEmpty()
    .withMessage('Assignment type is required')
    .isIn(['essay', 'problem_set', 'project', 'reading', 'quiz', 'exam', 'other'])
    .withMessage('Invalid assignment type'),
  check('difficulty')
    .optional()
    .isIn(['easy', 'medium', 'hard'])
    .withMessage('Invalid difficulty level'),
  check('dueDate')
    .notEmpty()
    .withMessage('Due date is required for homework tasks')
    .isISO8601()
    .withMessage('Invalid due date format'),
  check('estimatedStudyTime')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Estimated study time must be at least 1 minute'),
  check('actualStudyTime')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Actual study time must be at least 1 minute'),
  check('grade')
    .optional()
    .isLength({ max: 10 })
    .withMessage('Grade must be less than 10 characters'),
  check('materials')
    .optional()
    .isArray()
    .withMessage('Materials must be an array'),
  check('studyNotes')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Study notes must be less than 1000 characters'),
  check('isGroupWork')
    .optional()
    .isBoolean()
    .withMessage('isGroupWork must be a boolean'),
  check('groupMembers')
    .optional()
    .isArray()
    .withMessage('Group members must be an array')
];

const router: Router = express.Router();

// ========================= HOMEWORK TASK ROUTES =========================

// @route   GET /api/homework-tasks
// @desc    Get all homework tasks for authenticated user
// @access  Private
router.get('/', authenticate, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!._id;
  const { subject, assignmentType, difficulty, status, page = 1, limit = 10, sortBy = 'dueDate', sortOrder = 'asc' } = req.query;

  const query: any = { assignee: userId };
  
  if (subject) query.subject = { $regex: subject, $options: 'i' };
  if (assignmentType) query.assignmentType = assignmentType;
  if (difficulty) query.difficulty = difficulty;
  if (status) query.status = status;

  const skip = (Number(page) - 1) * Number(limit);
  const sortOptions: any = {};
  sortOptions[sortBy as string] = sortOrder === 'desc' ? -1 : 1;

  const homeworkTasks = await HomeworkTask.find(query)
    .skip(skip)
    .limit(Number(limit))
    .sort(sortOptions)
    .populate('assignee', 'name email')
    .populate('groupMembers', 'name email');

  const total = await HomeworkTask.countDocuments(query);

  res.status(200).json({
    homeworkTasks,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / Number(limit))
    }
  });
}));

// @route   GET /api/homework-tasks/stats
// @desc    Get homework task statistics
// @access  Private
router.get('/stats', authenticate, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!._id;
  const { period = '30' } = req.query; // days

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - Number(period));

  const homeworkTasks = await HomeworkTask.find({
    assignee: userId,
    createdAt: { $gte: startDate }
  });

  const stats = {
    totalHomeworkTasks: homeworkTasks.length,
    bySubject: homeworkTasks.reduce((acc, task) => {
      acc[task.subject] = (acc[task.subject] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    byAssignmentType: {
      essay: homeworkTasks.filter(t => t.assignmentType === 'essay').length,
      problem_set: homeworkTasks.filter(t => t.assignmentType === 'problem_set').length,
      project: homeworkTasks.filter(t => t.assignmentType === 'project').length,
      reading: homeworkTasks.filter(t => t.assignmentType === 'reading').length,
      quiz: homeworkTasks.filter(t => t.assignmentType === 'quiz').length,
      exam: homeworkTasks.filter(t => t.assignmentType === 'exam').length,
      other: homeworkTasks.filter(t => t.assignmentType === 'other').length
    },
    byDifficulty: {
      easy: homeworkTasks.filter(t => t.difficulty === 'easy').length,
      medium: homeworkTasks.filter(t => t.difficulty === 'medium').length,
      hard: homeworkTasks.filter(t => t.difficulty === 'hard').length
    },
    byStatus: {
      pending: homeworkTasks.filter(t => t.status === 'pending').length,
      in_progress: homeworkTasks.filter(t => t.status === 'in_progress').length,
      completed: homeworkTasks.filter(t => t.status === 'completed').length,
      cancelled: homeworkTasks.filter(t => t.status === 'cancelled').length
    },
    overdue: homeworkTasks.filter(t => 
      t.dueDate && t.dueDate < new Date() && t.status !== 'completed'
    ).length,
    averageStudyTime: homeworkTasks.length > 0 
      ? Math.round(homeworkTasks.reduce((sum, t) => sum + (t.estimatedStudyTime || 0), 0) / homeworkTasks.length)
      : 0,
    groupWorkTasks: homeworkTasks.filter(t => t.isGroupWork).length,
    individualTasks: homeworkTasks.filter(t => !t.isGroupWork).length,
    completedTasks: homeworkTasks.filter(t => t.status === 'completed').length,
    completionRate: homeworkTasks.length > 0 
      ? Math.round((homeworkTasks.filter(t => t.status === 'completed').length / homeworkTasks.length) * 100)
      : 0
  };

  res.status(200).json(stats);
}));

// @route   POST /api/homework-tasks
// @desc    Create a new homework task
// @access  Private
router.post('/', authenticate, homeworkTaskValidation, handleValidationErrors, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const homeworkTask = new HomeworkTask({
    ...req.body,
    assignee: req.user!._id,
    taskType: 'homework'
  });

  await homeworkTask.save();
  res.status(201).json(homeworkTask);
}));

// @route   GET /api/homework-tasks/:id
// @desc    Get a specific homework task
// @access  Private
router.get('/:id', authenticate, mustOwnHomeworkTask(), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  res.status(200).json(req.homeworkTask);
}));

// @route   PUT /api/homework-tasks/:id
// @desc    Update a specific homework task
// @access  Private
router.put('/:id', authenticate, mustOwnHomeworkTask(), homeworkTaskValidation, handleValidationErrors, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const updatedHomeworkTask = await HomeworkTask.findByIdAndUpdate(
    req.params.id,
    { ...req.body },
    { new: true, runValidators: true }
  );

  res.status(200).json(updatedHomeworkTask);
}));

// @route   DELETE /api/homework-tasks/:id
// @desc    Delete a specific homework task
// @access  Private
router.delete('/:id', authenticate, mustOwnHomeworkTask(), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  await HomeworkTask.findByIdAndDelete(req.params.id);
  res.status(200).json({ message: 'Homework task deleted successfully' });
}));

// @route   POST /api/homework-tasks/:id/materials
// @desc    Add a material to a homework task
// @access  Private
router.post('/:id/materials', authenticate, mustOwnHomeworkTask(), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { material } = req.body;
  
  if (!material || typeof material !== 'string') {
    res.status(400).json({ error: 'Valid material is required' });
    return;
  }

  await req.homeworkTask!.addMaterial(material);
  const updatedTask = await HomeworkTask.findById(req.params.id);
  
  res.status(200).json(updatedTask);
}));

// @route   POST /api/homework-tasks/:id/group-members
// @desc    Add a group member to a homework task
// @access  Private
router.post('/:id/group-members', authenticate, mustOwnHomeworkTask(), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { userId } = req.body;
  
  if (!userId) {
    res.status(400).json({ error: 'User ID is required' });
    return;
  }

  // Verify the user exists
  const user = await User.findById(userId);
  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }

  await req.homeworkTask!.addGroupMember(userId);
  const updatedTask = await HomeworkTask.findById(req.params.id).populate('groupMembers', 'name email');
  
  res.status(200).json(updatedTask);
}));

// @route   PUT /api/homework-tasks/:id/study-time
// @desc    Update study time for a homework task
// @access  Private
router.put('/:id/study-time', authenticate, mustOwnHomeworkTask(), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { actualTime } = req.body;
  
  if (!actualTime || typeof actualTime !== 'number' || actualTime < 0) {
    res.status(400).json({ error: 'Valid actual study time is required' });
    return;
  }

  await req.homeworkTask!.updateStudyTime(actualTime);
  const updatedTask = await HomeworkTask.findById(req.params.id);
  
  res.status(200).json(updatedTask);
}));

// @route   GET /api/homework-tasks/:id/study-efficiency
// @desc    Get study efficiency for a homework task
// @access  Private
router.get('/:id/study-efficiency', authenticate, mustOwnHomeworkTask(), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const efficiency = req.homeworkTask!.studyEfficiency;
  
  res.status(200).json({ 
    studyEfficiency: efficiency,
    estimatedStudyTime: req.homeworkTask!.estimatedStudyTime,
    actualStudyTime: req.homeworkTask!.actualStudyTime,
    isOverdue: req.homeworkTask!.isOverdue
  });
}));

// @route   GET /api/homework-tasks/search/subjects
// @desc    Search homework tasks by subject
// @access  Private
router.get('/search/subjects', authenticate, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { subject, page = 1, limit = 10 } = req.query;
  
  if (!subject) {
    res.status(400).json({ error: 'Subject search term is required' });
    return;
  }

  const userId = req.user!._id;
  const skip = (Number(page) - 1) * Number(limit);

  const homeworkTasks = await HomeworkTask.find({
    assignee: userId,
    subject: { $regex: subject, $options: 'i' }
  })
    .skip(skip)
    .limit(Number(limit))
    .sort({ dueDate: 1 });

  res.status(200).json({
    homeworkTasks,
    searchTerm: subject,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total: homeworkTasks.length
    }
  });
}));

// @route   GET /api/homework-tasks/upcoming
// @desc    Get upcoming homework tasks (due within next 7 days)
// @access  Private
router.get('/upcoming', authenticate, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!._id;
  const { days = 7 } = req.query;

  const endDate = new Date();
  endDate.setDate(endDate.getDate() + Number(days));

  const upcomingTasks = await HomeworkTask.find({
    assignee: userId,
    dueDate: { $lte: endDate, $gte: new Date() },
    status: { $ne: 'completed' }
  })
    .sort({ dueDate: 1 })
    .populate('groupMembers', 'name email');

  res.status(200).json({
    upcomingTasks,
    period: `${days} days`,
    total: upcomingTasks.length
  });
}));

export default router;
