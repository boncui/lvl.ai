import { Router, Response, NextFunction } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import Task, { TaskStatus } from '@/models/Task';
import User from '@/models/User';
import { CustomError } from '@/middleware/errorHandler';
import authenticate, { AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// @route   GET /api/tasks
// @desc    Get all tasks for user
// @access  Private
router.get('/', authenticate, [
  query('status').optional().isIn(['pending', 'in_progress', 'completed', 'cancelled']).withMessage('Invalid status'),
  query('priority').optional().isIn(['low', 'medium', 'high', 'urgent']).withMessage('Invalid priority'),
  query('tag').optional().isString().withMessage('Tag must be a string'),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('sortBy').optional().isIn(['createdAt', 'updatedAt', 'dueDate', 'taskTime', 'priority', 'points']).withMessage('Invalid sort field'),
  query('sortOrder').optional().isIn(['asc', 'desc']).withMessage('Sort order must be asc or desc')
], async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ success: false, errors: errors.array() });
      return;
    }

    const userId = req.user!._id;
    const { status, priority, tag, page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

    // Build filter object
    const filter: any = { userId };

    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (tag) filter.tags = tag;

    // Build sort object
    const sort: any = {};
    sort[sortBy as string] = sortOrder === 'desc' ? -1 : 1;

    const skip = (Number(page) - 1) * Number(limit);

    const tasks = await Task.find(filter)
      .populate('userId', 'name email avatar')
      .sort(sort)
      .skip(skip)
      .limit(Number(limit));

    const total = await Task.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: tasks.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      data: tasks
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/tasks/stats
// @desc    Get task statistics
// @access  Private
router.get('/stats', authenticate, [
  query('period').optional().isInt({ min: 1 }).withMessage('Period must be a positive integer')
], async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ success: false, errors: errors.array() });
      return;
    }

    const userId = req.user!._id;
    const { period = 30 } = req.query;
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - Number(period));

    const filter = {
      userId,
      createdAt: { $gte: startDate }
    };

    const tasks = await Task.find(filter);
    
    // Calculate statistics
    const totalTasks = tasks.length;
    const byStatus: Record<string, number> = {};
    const byPriority: Record<string, number> = {};
    let totalPoints = 0;
    let earnedPoints = 0;
    let overdue = 0;

    tasks.forEach(task => {
      // Count by status
      byStatus[task.status] = (byStatus[task.status] || 0) + 1;
      
      // Count by priority
      byPriority[task.priority] = (byPriority[task.priority] || 0) + 1;
      
      // Calculate points
      totalPoints += task.points;
      if (task.status === TaskStatus.COMPLETED) {
        earnedPoints += task.points;
      }
      
      // Count overdue
      if (task.dueDate && task.dueDate < new Date() && task.status !== TaskStatus.COMPLETED) {
        overdue++;
      }
    });

    res.status(200).json({
      success: true,
      data: {
        totalTasks,
        byStatus,
        byPriority,
        totalPoints,
        earnedPoints,
        overdue
      }
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/tasks
// @desc    Create new task
// @access  Private
router.post('/', authenticate, [
  body('title').notEmpty().withMessage('Title is required'),
  body('description').optional().isString().withMessage('Description must be a string'),
  body('priority').optional().isIn(['low', 'medium', 'high', 'urgent']).withMessage('Invalid priority'),
  body('status').optional().isIn(['pending', 'in_progress', 'completed', 'cancelled']).withMessage('Invalid status'),
  body('taskTime').optional().isISO8601().withMessage('Invalid task time format'),
  body('dueDate').optional().isISO8601().withMessage('Invalid due date format'),
  body('points').optional().isInt({ min: 0 }).withMessage('Points must be a non-negative integer'),
  body('tags').optional().isArray().withMessage('Tags must be an array')
], async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ success: false, errors: errors.array() });
      return;
    }

    const userId = req.user!._id;
    const taskData = {
      ...req.body,
      userId
    };

    const task = await Task.create(taskData);
    await task.populate('userId', 'name email avatar');

    // Add task to user's tasks array
    try {
      await User.findByIdAndUpdate(userId, {
        $push: { tasks: task._id }
      });
    } catch (userUpdateError: any) {
      // If user update fails (e.g., tasks field is corrupted), log error but don't fail task creation
      console.error('Error updating user tasks array:', userUpdateError.message);
      // Task was still created successfully, so we can continue
    }

    res.status(201).json({
      success: true,
      data: task
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/tasks/:id
// @desc    Get single task
// @access  Private
router.get('/:id', authenticate, [
  param('id').isMongoId().withMessage('Please provide a valid task ID')
], async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ success: false, errors: errors.array() });
      return;
    }

    const userId = req.user!._id;
    const taskId = req.params['id'];

    const task = await Task.findOne({
      _id: taskId,
      userId
    }).populate('userId', 'name email avatar');

    if (!task) {
      throw new CustomError('Task not found', 404);
    }

    res.status(200).json({
      success: true,
      data: task
    });
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/tasks/:id
// @desc    Update task
// @access  Private
router.put('/:id', authenticate, [
  param('id').isMongoId().withMessage('Please provide a valid task ID'),
  body('title').optional().notEmpty().withMessage('Title cannot be empty'),
  body('description').optional().isString().withMessage('Description must be a string'),
  body('priority').optional().isIn(['low', 'medium', 'high', 'urgent']).withMessage('Invalid priority'),
  body('status').optional().isIn(['pending', 'in_progress', 'completed', 'cancelled']).withMessage('Invalid status'),
  body('taskTime').optional().isISO8601().withMessage('Invalid task time format'),
  body('dueDate').optional().isISO8601().withMessage('Invalid due date format'),
  body('points').optional().isInt({ min: 0 }).withMessage('Points must be a non-negative integer'),
  body('tags').optional().isArray().withMessage('Tags must be an array')
], async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ success: false, errors: errors.array() });
      return;
    }

    const userId = req.user!._id;
    const taskId = req.params['id'];

    const task = await Task.findOne({
      _id: taskId,
      userId
    });

    if (!task) {
      throw new CustomError('Task not found', 404);
    }

    // Check if status changed to completed
    const wasCompleted = task.status === TaskStatus.COMPLETED;
    const isNowCompleted = req.body.status === TaskStatus.COMPLETED;

    const updateData: Record<string, unknown> = { ...req.body };
    if (!wasCompleted && isNowCompleted) {
      updateData['completedAt'] = new Date();
    }

    const updatedTask = await Task.findByIdAndUpdate(taskId, updateData, {
      new: true,
      runValidators: true
    }).populate('userId', 'name email avatar');

    // Update user stats if task was just completed
    if (!wasCompleted && isNowCompleted && updatedTask) {
      await User.findByIdAndUpdate(userId, {
        $inc: {
          xp: updatedTask.points,
          totalTasksCompleted: 1
        }
      });
    }

    res.status(200).json({
      success: true,
      data: updatedTask
    });
  } catch (error) {
    next(error);
  }
});

// @route   DELETE /api/tasks/:id
// @desc    Delete task
// @access  Private
router.delete('/:id', authenticate, [
  param('id').isMongoId().withMessage('Please provide a valid task ID')
], async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ success: false, errors: errors.array() });
      return;
    }

    const userId = req.user!._id;
    const taskId = req.params['id'];

    const task = await Task.findOne({
      _id: taskId,
      userId
    });

    if (!task) {
      throw new CustomError('Task not found', 404);
    }

    await task.deleteOne();

    // Remove task from user's tasks array
    await User.findByIdAndUpdate(userId, {
      $pull: { tasks: taskId }
    });

    res.status(200).json({
      success: true,
      message: 'Task deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/tasks/upcoming
// @desc    Get upcoming tasks (sorted by taskTime or dueDate)
// @access  Private
router.get('/filter/upcoming', authenticate, async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!._id;

    const tasks = await Task.find({
      userId,
      status: { $ne: TaskStatus.COMPLETED },
      $or: [
        { taskTime: { $gte: new Date() } },
        { dueDate: { $gte: new Date() } }
      ]
    })
    .populate('userId', 'name email avatar')
    .sort({ taskTime: 1, dueDate: 1 })
    .limit(20);

    res.status(200).json({
      success: true,
      count: tasks.length,
      data: tasks
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/tasks/overdue
// @desc    Get overdue tasks
// @access  Private
router.get('/filter/overdue', authenticate, async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!._id;

    const tasks = await Task.find({
      userId,
      dueDate: { $lt: new Date() },
      status: { $ne: TaskStatus.COMPLETED }
    })
    .populate('userId', 'name email avatar')
    .sort({ dueDate: 1 });

    res.status(200).json({
      success: true,
      count: tasks.length,
      data: tasks
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/tasks/:id/complete
// @desc    Mark task as complete
// @access  Private
router.post('/:id/complete', authenticate, [
  param('id').isMongoId().withMessage('Please provide a valid task ID')
], async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ success: false, errors: errors.array() });
      return;
    }

    const userId = req.user!._id;
    const taskId = req.params['id'];

    const task = await Task.findOne({
      _id: taskId,
      userId
    });

    if (!task) {
      throw new CustomError('Task not found', 404);
    }

    if (task.status === TaskStatus.COMPLETED) {
      throw new CustomError('Task is already completed', 400);
    }

    task.status = TaskStatus.COMPLETED;
    task.completedAt = new Date();
    await task.save();

    // Update user stats
    await User.findByIdAndUpdate(userId, {
      $inc: {
        xp: task.points,
        totalTasksCompleted: 1
      }
    });

    await task.populate('userId', 'name email avatar');

    res.status(200).json({
      success: true,
      data: task,
      message: `Task completed! You earned ${task.points} points.`
    });
  } catch (error) {
    next(error);
  }
});

export default router;
