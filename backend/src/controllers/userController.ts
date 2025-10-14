import { Request, Response, NextFunction } from 'express';
import User, { LifeCategory, ITask, IMetric } from '@/models/User';
import { CustomError } from '@/middleware/errorHandler';

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
export const getUsers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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
};

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private/Admin
export const getUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = await User.findById(req.params.id)
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
};

// @desc    Get current user profile
// @route   GET /api/users/profile/me
// @access  Private
export const getMyProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = (req as any).user.id;
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
};

// @desc    Create new user
// @route   POST /api/users
// @access  Private/Admin
export const createUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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
};

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private/Admin
export const updateUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
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
};

// @desc    Update my profile
// @route   PUT /api/users/profile/me
// @access  Private
export const updateMyProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    
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
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
export const deleteUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = await User.findById(req.params.id);

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
};

// @desc    Get user tasks
// @route   GET /api/users/:id/tasks
// @access  Private
export const getUserTasks = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.params.id;
    const { category, completed, page = 1, limit = 10 } = req.query;

    const user = await User.findById(userId);
    if (!user) {
      throw new CustomError('User not found', 404);
    }

    let tasks = user.tasks;

    // Apply filters
    if (category) {
      tasks = tasks.filter(task => task.category === category);
    }
    if (completed !== undefined) {
      tasks = tasks.filter(task => task.completed === (completed === 'true'));
    }

    // Pagination
    const skip = (Number(page) - 1) * Number(limit);
    const paginatedTasks = tasks.slice(skip, skip + Number(limit));

    res.status(200).json({
      success: true,
      count: paginatedTasks.length,
      total: tasks.length,
      page: Number(page),
      pages: Math.ceil(tasks.length / Number(limit)),
      data: paginatedTasks
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add task to user
// @route   POST /api/users/:id/tasks
// @access  Private
export const addUserTask = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.params.id;
    const taskData: ITask = req.body;

    const user = await User.findById(userId);
    if (!user) {
      throw new CustomError('User not found', 404);
    }

    user.tasks.push(taskData);
    await user.save();

    res.status(201).json({
      success: true,
      data: taskData
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user task
// @route   PUT /api/users/:id/tasks/:taskId
// @access  Private
export const updateUserTask = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.params.id;
    const taskId = req.params.taskId;

    const user = await User.findById(userId);
    if (!user) {
      throw new CustomError('User not found', 404);
    }

    const taskIndex = user.tasks.findIndex(task => task._id?.toString() === taskId);
    if (taskIndex === -1) {
      throw new CustomError('Task not found', 404);
    }

    // Update task
    Object.assign(user.tasks[taskIndex], req.body);
    
    // If marking as completed, set completedAt and award XP
    if (req.body.completed && !user.tasks[taskIndex].completed) {
      user.tasks[taskIndex].completedAt = new Date();
      
      // Award XP to the category
      const category = user.tasks[taskIndex].category;
      const xpValue = user.tasks[taskIndex].xpValue;
      
      if (!user.levels.has(category)) {
        user.levels.set(category, { level: 1, xp: 0, dailyStreak: 0, totalCompleted: 0 });
      }
      
      const levelData = user.levels.get(category);
      levelData.xp += xpValue;
      levelData.totalCompleted += 1;
      
      // Check for level up (every 100 XP = 1 level)
      const newLevel = Math.floor(levelData.xp / 100) + 1;
      if (newLevel > levelData.level) {
        levelData.level = newLevel;
      }
    }

    await user.save();

    res.status(200).json({
      success: true,
      data: user.tasks[taskIndex]
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user task
// @route   DELETE /api/users/:id/tasks/:taskId
// @access  Private
export const deleteUserTask = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.params.id;
    const taskId = req.params.taskId;

    const user = await User.findById(userId);
    if (!user) {
      throw new CustomError('User not found', 404);
    }

    const taskIndex = user.tasks.findIndex(task => task._id?.toString() === taskId);
    if (taskIndex === -1) {
      throw new CustomError('Task not found', 404);
    }

    user.tasks.splice(taskIndex, 1);
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Task deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user metrics
// @route   GET /api/users/:id/metrics
// @access  Private
export const getUserMetrics = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.params.id;
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
};

// @desc    Add metric to user
// @route   POST /api/users/:id/metrics
// @access  Private
export const addUserMetric = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.params.id;
    const metricData: IMetric = req.body;

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
};

// @desc    Get user levels
// @route   GET /api/users/:id/levels
// @access  Private
export const getUserLevels = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.params.id;

    const user = await User.findById(userId);
    if (!user) {
      throw new CustomError('User not found', 404);
    }

    res.status(200).json({
      success: true,
      data: Object.fromEntries(user.levels)
    });
  } catch (error) {
    next(error);
  }
};
