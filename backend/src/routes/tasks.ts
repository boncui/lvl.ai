import express, { NextFunction, Request, Response, Router, RequestHandler } from 'express';
import { check, validationResult } from 'express-validator';
import authenticate, { AuthenticatedRequest } from '../middleware/auth';
import {
  TaskType, 
  TaskPriority, 
  TaskStatus
} from '../models/BaseTask';
import FoodTask from '../models/FoodTask';
import HomeworkTask from '../models/HomeworkTask';
import EmailTask from '../models/EmailTask';
import MeetingTask from '../models/MeetingTask';
import ProjectTask from '../models/ProjectTask';
import PersonalTask from '../models/PersonalTask';
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

// Middleware to ensure user owns the task
const mustOwnTask = (): RequestHandler =>
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const taskId = req.params['id'];
    const taskType = req.params['taskType'] || req.body.taskType;
    
    if (!taskType) {
      res.status(400).json({ error: 'Task type is required' });
      return;
    }

    try {
      let task;
      switch (taskType) {
        case TaskType.FOOD:
          task = await FoodTask.findById(taskId);
          break;
        case TaskType.HOMEWORK:
          task = await HomeworkTask.findById(taskId);
          break;
        case TaskType.EMAIL:
          task = await EmailTask.findById(taskId);
          break;
        case TaskType.MEETING:
          task = await MeetingTask.findById(taskId);
          break;
        case TaskType.PROJECT:
          task = await ProjectTask.findById(taskId);
          break;
        case TaskType.PERSONAL:
          task = await PersonalTask.findById(taskId);
          break;
        case TaskType.WORK:
          task = await WorkTask.findById(taskId);
          break;
        default:
          res.status(400).json({ error: 'Invalid task type' });
          return;
      }
      
      if (!task) {
        res.status(404).json({ error: 'Task not found' });
        return;
      }

      if (String(task.assignee) !== String(req.user._id)) {
        res.status(403).json({ error: 'You can only modify your own tasks' });
        return;
      }

      req.task = task;
      next();
    } catch (error) {
      res.status(400).json({ error: 'Invalid task type or ID' });
    }
  };

// Base validation for all tasks
const baseTaskValidation = [
  check('title')
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ min: 1, max: 200 })
    .withMessage('Title must be between 1 and 200 characters'),
  check('description')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Description must be less than 1000 characters'),
  check('priority')
    .optional()
    .isIn(Object.values(TaskPriority))
    .withMessage('Invalid priority level'),
  check('status')
    .optional()
    .isIn(Object.values(TaskStatus))
    .withMessage('Invalid status'),
  check('dueDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid due date format'),
  check('startDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid start date format'),
  check('estimatedDuration')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Estimated duration must be at least 1 minute'),
  check('actualDuration')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Actual duration must be at least 1 minute'),
  check('xpValue')
    .optional()
    .isInt({ min: 0 })
    .withMessage('XP value cannot be negative'),
  check('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  check('location')
    .optional()
    .isLength({ max: 200 })
    .withMessage('Location must be less than 200 characters')
];

const router: Router = express.Router();

// ========================= GENERAL TASK ROUTES =========================

// @route   GET /api/tasks
// @desc    Get all tasks for authenticated user
// @access  Private
router.get('/', authenticate, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!._id;
  const { taskType, status, priority, page = 1, limit = 10 } = req.query;

  const query: any = { assignee: userId };
  
  if (taskType) query.taskType = taskType;
  if (status) query.status = status;
  if (priority) query.priority = priority;

  const skip = (Number(page) - 1) * Number(limit);

  // Get all task types
  const [
    foodTasks,
    homeworkTasks,
    emailTasks,
    meetingTasks,
    projectTasks,
    personalTasks,
    workTasks,
  ] = await Promise.all([
    FoodTask.find(query).skip(skip).limit(Number(limit)).sort({ createdAt: -1 }),
    HomeworkTask.find(query).skip(skip).limit(Number(limit)).sort({ createdAt: -1 }),
    EmailTask.find(query).skip(skip).limit(Number(limit)).sort({ createdAt: -1 }),
    MeetingTask.find(query).skip(skip).limit(Number(limit)).sort({ createdAt: -1 }),
    ProjectTask.find(query).skip(skip).limit(Number(limit)).sort({ createdAt: -1 }),
    PersonalTask.find(query).skip(skip).limit(Number(limit)).sort({ createdAt: -1 }),
    WorkTask.find(query).skip(skip).limit(Number(limit)).sort({ createdAt: -1 }),
  ]);

  const allTasks = [
    ...foodTasks,
    ...homeworkTasks,
    ...emailTasks,
    ...meetingTasks,
    ...projectTasks,
    ...personalTasks,
    ...workTasks,
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  res.status(200).json({
    tasks: allTasks,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total: allTasks.length
    }
  });
}));

// @route   GET /api/tasks/stats
// @desc    Get task statistics for authenticated user
// @access  Private
router.get('/stats', authenticate, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!._id;

  const [
    foodTasks,
    homeworkTasks,
    emailTasks,
    meetingTasks,
    projectTasks,
    personalTasks,
    workTasks,
  ] = await Promise.all([
    FoodTask.find({ assignee: userId }),
    HomeworkTask.find({ assignee: userId }),
    EmailTask.find({ assignee: userId }),
    MeetingTask.find({ assignee: userId }),
    ProjectTask.find({ assignee: userId }),
    PersonalTask.find({ assignee: userId }),
    WorkTask.find({ assignee: userId }),
  ]);

  const allTasks = [
    ...foodTasks,
    ...homeworkTasks,
    ...emailTasks,
    ...meetingTasks,
    ...projectTasks,
    ...personalTasks,
    ...workTasks,
  ];

  const stats = {
    totalTasks: allTasks.length,
    byType: {
      food: foodTasks.length,
      homework: homeworkTasks.length,
      email: emailTasks.length,
      meeting: meetingTasks.length,
      project: projectTasks.length,
      personal: personalTasks.length,
      work: workTasks.length,
    },
    byStatus: {
      pending: allTasks.filter(t => t.status === TaskStatus.PENDING).length,
      inProgress: allTasks.filter(t => t.status === TaskStatus.IN_PROGRESS).length,
      completed: allTasks.filter(t => t.status === TaskStatus.COMPLETED).length,
      cancelled: allTasks.filter(t => t.status === TaskStatus.CANCELLED).length
    },
    byPriority: {
      low: allTasks.filter(t => t.priority === TaskPriority.LOW).length,
      medium: allTasks.filter(t => t.priority === TaskPriority.MEDIUM).length,
      high: allTasks.filter(t => t.priority === TaskPriority.HIGH).length,
      urgent: allTasks.filter(t => t.priority === TaskPriority.URGENT).length
    },
    totalXP: allTasks.reduce((sum, task) => sum + (task.xpValue || 0), 0),
    overdue: allTasks.filter(task => 
      task.dueDate && task.dueDate < new Date() && task.status !== TaskStatus.COMPLETED
    ).length
  };

  res.status(200).json(stats);
}));

// @route   POST /api/tasks
// @desc    Create a new task
// @access  Private
router.post('/', authenticate, baseTaskValidation, handleValidationErrors, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { taskType, ...taskData } = req.body;
  
  if (!taskType || !Object.values(TaskType).includes(taskType)) {
    res.status(400).json({ error: 'Valid task type is required' });
    return;
  }

  let task;
  switch (taskType) {
    case TaskType.FOOD:
      task = new FoodTask({ ...taskData, assignee: req.user!._id, taskType });
      break;
    case TaskType.HOMEWORK:
      task = new HomeworkTask({ ...taskData, assignee: req.user!._id, taskType });
      break;
    case TaskType.EMAIL:
      task = new EmailTask({ ...taskData, assignee: req.user!._id, taskType });
      break;
    case TaskType.MEETING:
      task = new MeetingTask({ ...taskData, assignee: req.user!._id, taskType });
      break;
    case TaskType.PROJECT:
      task = new ProjectTask({ ...taskData, assignee: req.user!._id, taskType });
      break;
    case TaskType.PERSONAL:
      task = new PersonalTask({ ...taskData, assignee: req.user!._id, taskType });
      break;
    case TaskType.WORK:
      task = new WorkTask({ ...taskData, assignee: req.user!._id, taskType });
      break;
    default:
      res.status(400).json({ error: 'Invalid task type' });
      return;
  }

  await task.save();
  res.status(201).json(task);
}));

// @route   GET /api/tasks/:taskType/:id
// @desc    Get a specific task
// @access  Private
router.get('/:taskType/:id', authenticate, mustOwnTask(), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  res.status(200).json(req.task);
}));

// @route   PUT /api/tasks/:taskType/:id
// @desc    Update a specific task
// @access  Private
router.put('/:taskType/:id', authenticate, mustOwnTask(), baseTaskValidation, handleValidationErrors, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const updatedTask = await req.task!.save();
  res.status(200).json(updatedTask);
}));

// @route   DELETE /api/tasks/:taskType/:id
// @desc    Delete a specific task
// @access  Private
router.delete('/:taskType/:id', authenticate, mustOwnTask(), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  await req.task!.deleteOne();
  res.status(200).json({ message: 'Task deleted successfully' });
}));

// ========================= TASK-SPECIFIC ROUTES =========================

// @route   GET /api/tasks/:taskType
// @desc    Get tasks by type
// @access  Private
router.get('/:taskType', authenticate, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { taskType } = req.params;
  const userId = req.user!._id;
  const { status, priority, page = 1, limit = 10 } = req.query;

  if (!Object.values(TaskType).includes(taskType as TaskType)) {
    res.status(400).json({ error: 'Invalid task type' });
    return;
  }

  const query: any = { assignee: userId };
  if (status) query.status = status;
  if (priority) query.priority = priority;

  const skip = (Number(page) - 1) * Number(limit);
  let tasks;
  
  switch (taskType) {
    case TaskType.FOOD:
      tasks = await FoodTask.find(query).skip(skip).limit(Number(limit)).sort({ createdAt: -1 });
      break;
    case TaskType.HOMEWORK:
      tasks = await HomeworkTask.find(query).skip(skip).limit(Number(limit)).sort({ createdAt: -1 });
      break;
    case TaskType.EMAIL:
      tasks = await EmailTask.find(query).skip(skip).limit(Number(limit)).sort({ createdAt: -1 });
      break;
    case TaskType.MEETING:
      tasks = await MeetingTask.find(query).skip(skip).limit(Number(limit)).sort({ createdAt: -1 });
      break;
    case TaskType.PROJECT:
      tasks = await ProjectTask.find(query).skip(skip).limit(Number(limit)).sort({ createdAt: -1 });
      break;
    case TaskType.PERSONAL:
      tasks = await PersonalTask.find(query).skip(skip).limit(Number(limit)).sort({ createdAt: -1 });
      break;
    case TaskType.WORK:
      tasks = await WorkTask.find(query).skip(skip).limit(Number(limit)).sort({ createdAt: -1 });
      break;
    default:
      res.status(400).json({ error: 'Invalid task type' });
      return;
  }

  res.status(200).json({
    tasks,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total: tasks.length
    }
  });
}));

export default router;