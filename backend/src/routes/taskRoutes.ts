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

// @route   GET /api/tasks/analytics
// @desc    Get comprehensive analytics data for dashboard
// @access  Private
router.get('/analytics/overview', authenticate, [
  query('period').optional().isIn(['week', 'month', 'year']).withMessage('Period must be week, month, or year')
], async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ success: false, errors: errors.array() });
      return;
    }

    const userId = req.user!._id;
    const period = (req.query['period'] as string) || 'month';
    
    // Calculate date range based on period
    const now = new Date();
    const startDate = new Date();
    let dateFormat: string;
    let intervals: number;
    
    switch (period) {
      case 'week':
        startDate.setDate(now.getDate() - 7);
        dateFormat = 'day';
        intervals = 7;
        break;
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1);
        dateFormat = 'month';
        intervals = 12;
        break;
      case 'month':
      default:
        startDate.setMonth(now.getMonth() - 1);
        dateFormat = 'day';
        intervals = 30;
        break;
    }

    // Get all tasks for the user in the date range
    const tasks = await Task.find({
      userId,
      createdAt: { $gte: startDate }
    }).sort({ createdAt: 1 });

    // Get all completed tasks for XP tracking
    const completedTasks = tasks.filter(t => t.status === TaskStatus.COMPLETED);

    // Category breakdown (by tags)
    const categoryBreakdown: Record<string, { total: number; completed: number; points: number }> = {};
    tasks.forEach(task => {
      const tags = task.tags.length > 0 ? task.tags : ['uncategorized'];
      tags.forEach(tag => {
        const normalizedTag = tag.toLowerCase();
        if (!categoryBreakdown[normalizedTag]) {
          categoryBreakdown[normalizedTag] = { total: 0, completed: 0, points: 0 };
        }
        categoryBreakdown[normalizedTag].total += 1;
        if (task.status === TaskStatus.COMPLETED) {
          categoryBreakdown[normalizedTag].completed += 1;
          categoryBreakdown[normalizedTag].points += task.points;
        }
      });
    });

    // Generate time series data for task completion
    const timeSeriesData: Array<{
      date: string;
      completed: number;
      created: number;
      xpEarned: number;
    }> = [];

    // Create date buckets
    const dateBuckets: Map<string, { completed: number; created: number; xpEarned: number }> = new Map();
    
    for (let i = 0; i < intervals; i++) {
      const date = new Date(startDate);
      if (dateFormat === 'day') {
        date.setDate(startDate.getDate() + i);
      } else {
        date.setMonth(startDate.getMonth() + i);
      }
      
      const dateStr = date.toISOString().split('T')[0] || '';
      const key = dateFormat === 'day' 
        ? dateStr
        : `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      dateBuckets.set(key, { completed: 0, created: 0, xpEarned: 0 });
    }

    // Populate buckets with task data
    tasks.forEach(task => {
      const createdDateStr = task.createdAt.toISOString().split('T')[0] || '';
      const createdKey = dateFormat === 'day'
        ? createdDateStr
        : `${task.createdAt.getFullYear()}-${String(task.createdAt.getMonth() + 1).padStart(2, '0')}`;
      
      if (dateBuckets.has(createdKey)) {
        const bucket = dateBuckets.get(createdKey)!;
        bucket.created += 1;
      }

      if (task.status === TaskStatus.COMPLETED && task.completedAt) {
        const completedDateStr = task.completedAt.toISOString().split('T')[0] || '';
        const completedKey = dateFormat === 'day'
          ? completedDateStr
          : `${task.completedAt.getFullYear()}-${String(task.completedAt.getMonth() + 1).padStart(2, '0')}`;
        
        if (dateBuckets.has(completedKey)) {
          const bucket = dateBuckets.get(completedKey)!;
          bucket.completed += 1;
          bucket.xpEarned += task.points;
        }
      }
    });

    // Convert buckets to array
    dateBuckets.forEach((value, key) => {
      timeSeriesData.push({
        date: key,
        ...value
      });
    });

    // Calculate skill scores (based on completion rate by category)
    const skillScores: Array<{ category: string; score: number; tasksCompleted: number }> = [];
    Object.entries(categoryBreakdown).forEach(([category, data]) => {
      const completionRate = data.total > 0 ? (data.completed / data.total) * 100 : 0;
      skillScores.push({
        category,
        score: Math.round(completionRate),
        tasksCompleted: data.completed
      });
    });

    // Sort skill scores by tasks completed (descending)
    skillScores.sort((a, b) => b.tasksCompleted - a.tasksCompleted);

    // Calculate summary stats
    const totalTasks = tasks.length;
    const totalCompleted = completedTasks.length;
    const totalXPEarned = completedTasks.reduce((sum, t) => sum + t.points, 0);
    const completionRate = totalTasks > 0 ? Math.round((totalCompleted / totalTasks) * 100) : 0;
    const averagePointsPerTask = totalCompleted > 0 ? Math.round(totalXPEarned / totalCompleted) : 0;

    // Get user for level info
    const user = await User.findById(userId).select('level xp totalTasksCompleted');

    res.status(200).json({
      success: true,
      data: {
        summary: {
          totalTasks,
          totalCompleted,
          totalXPEarned,
          completionRate,
          averagePointsPerTask,
          currentLevel: user?.level || 1,
          currentXP: user?.xp || 0,
          lifetimeTasksCompleted: user?.totalTasksCompleted || 0
        },
        categoryBreakdown: Object.entries(categoryBreakdown).map(([category, data]) => ({
          category,
          ...data,
          completionRate: data.total > 0 ? Math.round((data.completed / data.total) * 100) : 0
        })),
        timeSeriesData,
        skillScores: skillScores.slice(0, 8), // Top 8 categories
        period
      }
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
