import { Router, Request, Response, NextFunction } from 'express';
import { body, param, query } from 'express-validator';
import mongoose from 'mongoose';
import User, { LifeCategory } from '@/models/User';
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
    const userData = {
      ...req.body,
      // Initialize default levels for all categories
      levels: Object.values(LifeCategory).reduce((acc, category) => {
        acc[category] = {
          level: 1,
          xp: 0,
          dailyStreak: 0,
          totalCompleted: 0
        };
        return acc;
      }, {} as Record<LifeCategory, any>)
    };

    const user = await User.create(userData);

    res.status(201).json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        preferences: user.preferences,
        levels: user.levels
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
  query('category').optional().isIn(['Fitness', 'Productivity', 'Nutrition', 'Finance', 'Social', 'Knowledge']).withMessage('Invalid category'),
  query('completed').optional().isBoolean().withMessage('Completed must be boolean'),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
], async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.params['id'];
    const { category, completed, page = 1, limit = 10 } = req.query;

    const user = await User.findById(userId);
    if (!user) {
      throw new CustomError('User not found', 404);
    }

    // Get all tasks from different categories
    const allTasks = [
      ...user.tasks.foodTasks,
      ...user.tasks.homeworkTasks,
      ...user.tasks.emailTasks,
      ...user.tasks.meetingTasks,
      ...user.tasks.projectTasks,
      ...user.tasks.personalTasks,
      ...user.tasks.workTasks,
      ...user.tasks.healthTasks,
      ...user.tasks.socialTasks,
      ...user.tasks.otherTasks
    ];

    // Apply filters
    let filteredTasks = allTasks;
    if (category) {
      // Map category to task type
      const categoryMap: Record<string, string> = {
        'Fitness': 'healthTasks',
        'Productivity': 'workTasks',
        'Nutrition': 'foodTasks',
        'Finance': 'personalTasks',
        'Social': 'socialTasks',
        'Knowledge': 'homeworkTasks'
      };
      const taskType = categoryMap[category as string];
      if (taskType) {
        filteredTasks = user.tasks[taskType as keyof typeof user.tasks];
      }
    }
    if (completed !== undefined) {
      // Note: ObjectId arrays don't have completion status, this would need to be handled differently
      // For now, we'll return all tasks
      filteredTasks = allTasks;
    }

    // Pagination
    const skip = (Number(page) - 1) * Number(limit);
    const paginatedTasks = filteredTasks.slice(skip, skip + Number(limit));

    res.status(200).json({
      success: true,
      count: paginatedTasks.length,
      total: filteredTasks.length,
      page: Number(page),
      pages: Math.ceil(filteredTasks.length / Number(limit)),
      data: paginatedTasks
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/users/:id/tasks
// @desc    Add task to user
// @access  Private
router.post('/:id/tasks', authenticate, [
  param('id').isMongoId().withMessage('Please provide a valid user ID'),
  body('title').notEmpty().withMessage('Task title is required'),
  body('category').isIn(['Fitness', 'Productivity', 'Nutrition', 'Finance', 'Social', 'Knowledge']).withMessage('Invalid category'),
  body('dueDate').optional().isISO8601().withMessage('Invalid due date format'),
  body('completed').optional().isBoolean().withMessage('Completed must be boolean'),
  body('xpValue').optional().isInt({ min: 1 }).withMessage('XP value must be a positive integer'),
  body('autoGenerated').optional().isBoolean().withMessage('Auto generated must be boolean')
], async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.params['id'];

    const user = await User.findById(userId);
    if (!user) {
      throw new CustomError('User not found', 404);
    }

    // Add task to appropriate category based on taskType
    const taskType = req.body.taskType || 'personalTasks';
    const validTaskTypes = ['foodTasks', 'homeworkTasks', 'emailTasks', 'meetingTasks', 'projectTasks', 'personalTasks', 'workTasks', 'healthTasks', 'socialTasks', 'otherTasks'];
    
    if (!validTaskTypes.includes(taskType)) {
      throw new CustomError('Invalid task type', 400);
    }

    // For now, we'll create a simple task object and add it to the appropriate array
    // In a real implementation, you'd create a Task document and add its ID
    const taskId = new mongoose.Types.ObjectId();
    user.tasks[taskType as keyof typeof user.tasks].push(taskId);
    await user.save();

    res.status(201).json({
      success: true,
      data: { taskId, taskType }
    });
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/users/:id/tasks/:taskId
// @desc    Update user task
// @access  Private
router.put('/:id/tasks/:taskId', authenticate, [
  param('id').isMongoId().withMessage('Please provide a valid user ID'),
  param('taskId').isMongoId().withMessage('Please provide a valid task ID'),
  body('title').optional().notEmpty().withMessage('Task title cannot be empty'),
  body('category').optional().isIn(['Fitness', 'Productivity', 'Nutrition', 'Finance', 'Social', 'Knowledge']).withMessage('Invalid category'),
  body('dueDate').optional().isISO8601().withMessage('Invalid due date format'),
  body('completed').optional().isBoolean().withMessage('Completed must be boolean'),
  body('xpValue').optional().isInt({ min: 1 }).withMessage('XP value must be a positive integer'),
  body('autoGenerated').optional().isBoolean().withMessage('Auto generated must be boolean')
], async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.params['id'];
    const taskId = req.params['taskId'];

    const user = await User.findById(userId);
    if (!user) {
      throw new CustomError('User not found', 404);
    }

    // Find task in appropriate category
    const validTaskTypes = ['foodTasks', 'homeworkTasks', 'emailTasks', 'meetingTasks', 'projectTasks', 'personalTasks', 'workTasks', 'healthTasks', 'socialTasks', 'otherTasks'];
    let taskIndex = -1;
    let taskCategory = '';
    
    for (const category of validTaskTypes) {
      const index = user.tasks[category as keyof typeof user.tasks].findIndex((id: any) => id.toString() === taskId);
      if (index !== -1) {
        taskIndex = index;
        taskCategory = category;
        break;
      }
    }
    
    if (taskIndex === -1) {
      throw new CustomError('Task not found', 404);
    }

    // Update task (in a real implementation, you'd update the actual Task document)
    // For now, we'll just update the user's level progress if task is completed
    if (req.body.completed) {
      // Award XP to the category based on task category
      const categoryMap: Record<string, LifeCategory> = {
        'foodTasks': LifeCategory.NUTRITION,
        'homeworkTasks': LifeCategory.KNOWLEDGE,
        'emailTasks': LifeCategory.PRODUCTIVITY,
        'meetingTasks': LifeCategory.PRODUCTIVITY,
        'projectTasks': LifeCategory.PRODUCTIVITY,
        'personalTasks': LifeCategory.PRODUCTIVITY,
        'workTasks': LifeCategory.PRODUCTIVITY,
        'healthTasks': LifeCategory.FITNESS,
        'socialTasks': LifeCategory.SOCIAL,
        'otherTasks': LifeCategory.PRODUCTIVITY
      };
      
      const lifeCategory = categoryMap[taskCategory];
      const xpValue = req.body.xpValue || 10;
      
      if (lifeCategory && user.levels[lifeCategory]) {
        user.levels[lifeCategory].xp += xpValue;
        user.levels[lifeCategory].totalCompleted += 1;
        
        // Check for level up (every 100 XP = 1 level)
        const newLevel = Math.floor(user.levels[lifeCategory].xp / 100) + 1;
        if (newLevel > user.levels[lifeCategory].level) {
          user.levels[lifeCategory].level = newLevel;
        }
      }
    }

    await user.save();

    res.status(200).json({
      success: true,
      data: { message: 'Task updated successfully', taskCategory, taskIndex }
    });
  } catch (error) {
    next(error);
  }
});

// @route   DELETE /api/users/:id/tasks/:taskId
// @desc    Delete user task
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

    // Find task in appropriate category
    const validTaskTypes = ['foodTasks', 'homeworkTasks', 'emailTasks', 'meetingTasks', 'projectTasks', 'personalTasks', 'workTasks', 'healthTasks', 'socialTasks', 'otherTasks'];
    let taskIndex = -1;
    let taskCategory = '';
    
    for (const category of validTaskTypes) {
      const index = user.tasks[category as keyof typeof user.tasks].findIndex((id: any) => id.toString() === taskId);
      if (index !== -1) {
        taskIndex = index;
        taskCategory = category;
        break;
      }
    }
    
    if (taskIndex === -1) {
      throw new CustomError('Task not found', 404);
    }

    // Remove task from appropriate category
    user.tasks[taskCategory as keyof typeof user.tasks].splice(taskIndex, 1);
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Task deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/users/:id/metrics
// @desc    Get user metrics
// @access  Private
router.get('/:id/metrics', authenticate, [
  param('id').isMongoId().withMessage('Please provide a valid user ID'),
  query('metricType').optional().isIn(['workout', 'meal', 'finance', 'study', 'sleep']).withMessage('Invalid metric type'),
  query('startDate').optional().isISO8601().withMessage('Invalid start date format'),
  query('endDate').optional().isISO8601().withMessage('Invalid end date format'),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
], async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.params['id'];
    const { metricType, startDate, endDate, page = 1, limit = 10 } = req.query;

    const user = await User.findById(userId);
    if (!user) {
      throw new CustomError('User not found', 404);
    }

    let metrics = user.metrics;

    // Apply filters
    if (metricType) {
      metrics = metrics.filter(metric => metric.metricType === metricType);
    }
    if (startDate) {
      metrics = metrics.filter(metric => metric.date >= new Date(startDate as string));
    }
    if (endDate) {
      metrics = metrics.filter(metric => metric.date <= new Date(endDate as string));
    }

    // Sort by date (newest first)
    metrics.sort((a, b) => b.date.getTime() - a.date.getTime());

    // Pagination
    const skip = (Number(page) - 1) * Number(limit);
    const paginatedMetrics = metrics.slice(skip, skip + Number(limit));

    res.status(200).json({
      success: true,
      count: paginatedMetrics.length,
      total: metrics.length,
      page: Number(page),
      pages: Math.ceil(metrics.length / Number(limit)),
      data: paginatedMetrics
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/users/:id/metrics
// @desc    Add metric to user
// @access  Private
router.post('/:id/metrics', authenticate, [
  param('id').isMongoId().withMessage('Please provide a valid user ID'),
  body('metricType').isIn(['workout', 'meal', 'finance', 'study', 'sleep']).withMessage('Invalid metric type'),
  body('value').isNumeric().withMessage('Value must be a number'),
  body('unit').optional().isString().withMessage('Unit must be a string'),
  body('date').optional().isISO8601().withMessage('Invalid date format'),
  body('notes').optional().isString().withMessage('Notes must be a string')
], async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.params['id'];
    const metricData = req.body;

    const user = await User.findById(userId);
    if (!user) {
      throw new CustomError('User not found', 404);
    }

    user.metrics.push(metricData);
    await user.save();

    res.status(201).json({
      success: true,
      data: metricData
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/users/:id/levels
// @desc    Get user levels
// @access  Private
router.get('/:id/levels', authenticate, [
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
      data: user.levels
    });
  } catch (error) {
    next(error);
  }
});

export default router;