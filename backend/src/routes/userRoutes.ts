import { Router, Request, Response, NextFunction } from 'express';
import { body, param, query } from 'express-validator';
import User from '@/models/User';
import Task from '@/models/Task';
import { CustomError } from '@/middleware/errorHandler';
import authenticate, { authorize } from '../middleware/auth';

const router = Router();

// @route   GET /api/users
// @desc    Get all users
// @access  Private/Admin
router.get('/', authenticate, authorize('admin'), [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('sortBy').optional().isIn(['createdAt', 'updatedAt', 'name', 'email']).withMessage('Invalid sort field'),
  query('sortOrder').optional().isIn(['asc', 'desc']).withMessage('Sort order must be asc or desc')
], async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const sort: any = {};
    sort[sortBy as string] = sortOrder === 'desc' ? -1 : 1;

    const users = await User.find()
      .select('-password -emailVerificationToken -passwordResetToken -passwordResetExpires')
      .sort(sort)
      .skip(skip)
      .limit(Number(limit));

    const total = await User.countDocuments();

    res.status(200).json({
      success: true,
      count: users.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      data: users
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/users/profile/me
// @desc    Get current user profile
// @access  Private
router.get('/profile/me', authenticate, async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = (req as any).user['id'];
    const user = await User.findById(userId)
      .select('-password -emailVerificationToken -passwordResetToken -passwordResetExpires')
      .populate('friends', 'name email avatar')
      .populate('friendRequests.sent', 'name email avatar')
      .populate('friendRequests.received', 'name email avatar');

    if (!user) {
      throw new CustomError('User not found', 404);
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/users/:id
// @desc    Get single user
// @access  Private/Admin
router.get('/:id', authenticate, authorize('admin'), [
  param('id').isMongoId().withMessage('Please provide a valid user ID')
], async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = await User.findById(req.params['id'])
      .select('-password -emailVerificationToken -passwordResetToken -passwordResetExpires');

    if (!user) {
      throw new CustomError('User not found', 404);
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/users
// @desc    Create new user
// @access  Private/Admin
router.post('/', authenticate, authorize('admin'), [
  body('name').notEmpty().withMessage('Name is required').isLength({ max: 50 }).withMessage('Name cannot exceed 50 characters'),
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('avatar').optional().isURL().withMessage('Avatar must be a valid URL'),
  body('preferences.timezone').optional().isString().withMessage('Timezone must be a string'),
  body('preferences.dailyGoalXP').optional().isInt({ min: 1 }).withMessage('Daily goal XP must be a positive integer'),
  body('preferences.preferredWorkouts').optional().isArray().withMessage('Preferred workouts must be an array'),
  body('preferences.dietaryPreferences').optional().isArray().withMessage('Dietary preferences must be an array'),
  body('preferences.notificationSettings.email').optional().isBoolean().withMessage('Email notification setting must be boolean'),
  body('preferences.notificationSettings.push').optional().isBoolean().withMessage('Push notification setting must be boolean')
], async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = await User.create(req.body);

    res.status(201).json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        preferences: user.preferences,
        level: user.level,
        xp: user.xp
      }
    });
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/users/profile/me
// @desc    Update my profile
// @access  Private
router.put('/profile/me', authenticate, [
  body('name').optional().notEmpty().withMessage('Name cannot be empty').isLength({ max: 50 }).withMessage('Name cannot exceed 50 characters'),
  body('avatar').optional().isURL().withMessage('Avatar must be a valid URL'),
  body('preferences.timezone').optional().isString().withMessage('Timezone must be a string'),
  body('preferences.dailyGoalXP').optional().isInt({ min: 1 }).withMessage('Daily goal XP must be a positive integer'),
  body('preferences.preferredWorkouts').optional().isArray().withMessage('Preferred workouts must be an array'),
  body('preferences.dietaryPreferences').optional().isArray().withMessage('Dietary preferences must be an array'),
  body('preferences.notificationSettings.email').optional().isBoolean().withMessage('Email notification setting must be boolean'),
  body('preferences.notificationSettings.push').optional().isBoolean().withMessage('Push notification setting must be boolean')
], async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = (req as any).user['id'];
    
    // Only allow updating certain fields
    const allowedFields = ['name', 'avatar', 'preferences'];
    const updateData: any = {};
    
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    const user = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
      runValidators: true
    }).select('-password -emailVerificationToken -passwordResetToken -passwordResetExpires');

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/users/:id
// @desc    Update user
// @access  Private/Admin
router.put('/:id', authenticate, authorize('admin'), [
  param('id').isMongoId().withMessage('Please provide a valid user ID'),
  body('name').optional().notEmpty().withMessage('Name cannot be empty').isLength({ max: 50 }).withMessage('Name cannot exceed 50 characters'),
  body('email').optional().isEmail().withMessage('Please provide a valid email'),
  body('avatar').optional().isURL().withMessage('Avatar must be a valid URL')
], async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = await User.findByIdAndUpdate(req.params['id'], req.body, {
      new: true,
      runValidators: true
    }).select('-password -emailVerificationToken -passwordResetToken -passwordResetExpires');

    if (!user) {
      throw new CustomError('User not found', 404);
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
});

// @route   DELETE /api/users/:id
// @desc    Delete user
// @access  Private/Admin
router.delete('/:id', authenticate, authorize('admin'), [
  param('id').isMongoId().withMessage('Please provide a valid user ID')
], async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = await User.findById(req.params['id']);

    if (!user) {
      throw new CustomError('User not found', 404);
    }

    await user.deleteOne();

    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/users/:id/tasks
// @desc    Get user tasks
// @access  Private
router.get('/:id/tasks', authenticate, [
  param('id').isMongoId().withMessage('Please provide a valid user ID'),
  query('status').optional().isIn(['pending', 'in_progress', 'completed', 'cancelled']).withMessage('Invalid status'),
  query('tag').optional().isString().withMessage('Tag must be a string'),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
], async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.params['id'];
    const { status, tag, page = 1, limit = 10 } = req.query;

    const user = await User.findById(userId);
    if (!user) {
      throw new CustomError('User not found', 404);
    }

    // Build query for tasks
    const taskQuery: any = { _id: { $in: user.tasks } };
    if (status) {
      taskQuery.status = status;
    }
    if (tag) {
      taskQuery.tags = tag;
    }

    // Get tasks with pagination
    const skip = (Number(page) - 1) * Number(limit);
    const tasks = await Task.find(taskQuery)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Task.countDocuments(taskQuery);

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

// @route   POST /api/users/:id/tasks
// @desc    Add task to user (Deprecated - use /api/tasks instead)
// @access  Private
router.post('/:id/tasks', authenticate, [
  param('id').isMongoId().withMessage('Please provide a valid user ID'),
  body('title').notEmpty().withMessage('Task title is required'),
  body('description').optional().isString().withMessage('Description must be a string'),
  body('priority').optional().isIn(['low', 'medium', 'high', 'urgent']).withMessage('Invalid priority'),
  body('status').optional().isIn(['pending', 'in_progress', 'completed', 'cancelled']).withMessage('Invalid status'),
  body('dueDate').optional().isISO8601().withMessage('Invalid due date format'),
  body('taskTime').optional().isISO8601().withMessage('Invalid task time format'),
  body('points').optional().isInt({ min: 0 }).withMessage('Points must be a positive integer'),
  body('tags').optional().isArray().withMessage('Tags must be an array')
], async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.params['id'];

    const user = await User.findById(userId);
    if (!user) {
      throw new CustomError('User not found', 404);
    }

    // Create task
    const task = await Task.create({
      ...req.body,
      userId
    });

    // Add task ID to user's tasks array
    user.tasks.push(task._id as any);
    await user.save();

    res.status(201).json({
      success: true,
      data: task
    });
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/users/:id/tasks/:taskId
// @desc    Update user task (Deprecated - use /api/tasks/:id instead)
// @access  Private
router.put('/:id/tasks/:taskId', authenticate, [
  param('id').isMongoId().withMessage('Please provide a valid user ID'),
  param('taskId').isMongoId().withMessage('Please provide a valid task ID'),
  body('title').optional().notEmpty().withMessage('Task title cannot be empty'),
  body('description').optional().isString().withMessage('Description must be a string'),
  body('priority').optional().isIn(['low', 'medium', 'high', 'urgent']).withMessage('Invalid priority'),
  body('status').optional().isIn(['pending', 'in_progress', 'completed', 'cancelled']).withMessage('Invalid status'),
  body('dueDate').optional().isISO8601().withMessage('Invalid due date format'),
  body('taskTime').optional().isISO8601().withMessage('Invalid task time format'),
  body('points').optional().isInt({ min: 0 }).withMessage('Points must be a positive integer'),
  body('tags').optional().isArray().withMessage('Tags must be an array')
], async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.params['id'];
    const taskId = req.params['taskId'];

    const user = await User.findById(userId);
    if (!user) {
      throw new CustomError('User not found', 404);
    }

    // Check if task belongs to user
    const taskExists = user.tasks.some(id => id.toString() === taskId);
    if (!taskExists) {
      throw new CustomError('Task not found or does not belong to user', 404);
    }

    // Update task
    const task = await Task.findByIdAndUpdate(
      taskId,
      req.body,
      { new: true, runValidators: true }
    );

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

// @route   DELETE /api/users/:id/tasks/:taskId
// @desc    Delete user task (Deprecated - use /api/tasks/:id instead)
// @access  Private
router.delete('/:id/tasks/:taskId', authenticate, [
  param('id').isMongoId().withMessage('Please provide a valid user ID'),
  param('taskId').isMongoId().withMessage('Please provide a valid task ID')
], async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.params['id'];
    const taskId = req.params['taskId'];

    const user = await User.findById(userId);
    if (!user) {
      throw new CustomError('User not found', 404);
    }

    // Find task index
    const taskIndex = user.tasks.findIndex(id => id.toString() === taskId);
    if (taskIndex === -1) {
      throw new CustomError('Task not found or does not belong to user', 404);
    }

    // Delete task
    await Task.findByIdAndDelete(taskId);

    // Remove task from user's tasks array
    user.tasks.splice(taskIndex, 1);
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Task deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/users/:id/stats
// @desc    Get user stats (Simplified - metrics removed)
// @access  Private
router.get('/:id/stats', authenticate, [
  param('id').isMongoId().withMessage('Please provide a valid user ID')
], async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.params['id'];

    const user = await User.findById(userId);
    if (!user) {
      throw new CustomError('User not found', 404);
    }

    // Get task statistics
    const totalTasks = await Task.countDocuments({ userId });
    const completedTasks = await Task.countDocuments({ userId, status: 'completed' });
    const pendingTasks = await Task.countDocuments({ userId, status: 'pending' });
    const inProgressTasks = await Task.countDocuments({ userId, status: 'in_progress' });

    res.status(200).json({
      success: true,
      data: {
        level: user.level,
        xp: user.xp,
        totalTasksCompleted: user.totalTasksCompleted,
        tasks: {
          total: totalTasks,
          completed: completedTasks,
          pending: pendingTasks,
          inProgress: inProgressTasks
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

// Metrics removed from simplified User model
// Use a separate Metrics model if needed in the future

// @route   GET /api/users/:id/level
// @desc    Get user level and XP
// @access  Private
router.get('/:id/level', authenticate, [
  param('id').isMongoId().withMessage('Please provide a valid user ID')
], async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.params['id'];

    const user = await User.findById(userId);
    if (!user) {
      throw new CustomError('User not found', 404);
    }

    res.status(200).json({
      success: true,
      data: {
        level: user.level,
        xp: user.xp,
        totalTasksCompleted: user.totalTasksCompleted
      }
    });
  } catch (error) {
    next(error);
  }
});

export default router;