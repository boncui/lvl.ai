import { Router, Request, Response, NextFunction } from 'express';
import { body, param, query } from 'express-validator';
import HealthTask from '../models/HealthTask';
import { CustomError } from '../middleware/errorHandler';
import authenticate from '../middleware/auth';

const router = Router();

// @route   GET /api/health-tasks
// @desc    Get all health tasks
// @access  Private
router.get('/', authenticate, [
  query('healthCategory').optional().isString().withMessage('Health category must be a string'),
  query('priority').optional().isIn(['low', 'medium', 'high', 'urgent']).withMessage('Invalid priority'),
  query('status').optional().isIn(['pending', 'in_progress', 'completed', 'cancelled']).withMessage('Invalid status'),
  query('mood').optional().isString().withMessage('Mood must be a string'),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
], async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = (req as any).user['id'];
    const { healthCategory, priority, status, mood, page = 1, limit = 10 } = req.query;

    // Build filter object
    const filter: any = {
      $or: [
        { assignee: userId },
        { collaborators: userId }
      ]
    };

    if (healthCategory) filter.healthCategory = healthCategory;
    if (priority) filter.priority = priority;
    if (status) filter.status = status;
    if (mood) filter.mood = { $regex: mood, $options: 'i' };

    const skip = (Number(page) - 1) * Number(limit);

    const healthTasks = await HealthTask.find(filter)
      .populate('assignee', 'name email avatar')
      .populate('assignedBy', 'name email avatar')
      .populate('collaborators', 'name email avatar')
      .populate('parentTask', 'title')
      .populate('subtasks', 'title status')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await HealthTask.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: healthTasks.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      data: healthTasks
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/health-tasks/stats
// @desc    Get health task statistics
// @access  Private
router.get('/stats', authenticate, async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = (req as any).user['id'];
    const { period = 30 } = req.query;
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - Number(period));

    const filter = {
      $or: [
        { assignee: userId },
        { collaborators: userId }
      ],
      createdAt: { $gte: startDate }
    };

    const healthTasks = await HealthTask.find(filter);
    
    // Calculate statistics
    const totalTasks = healthTasks.length;
    const byCategory: Record<string, number> = {};
    const byStatus: Record<string, number> = {};
    const byPriority: Record<string, number> = {};
    let totalXP = 0;
    let overdue = 0;
    let averageEnergyLevel = 0;
    let averagePainLevel = 0;
    let totalSleepHours = 0;
    let totalExerciseMinutes = 0;

    healthTasks.forEach(task => {
      // Count by category
      byCategory[task.healthCategory] = (byCategory[task.healthCategory] || 0) + 1;
      
      // Count by status
      byStatus[task.status] = (byStatus[task.status] || 0) + 1;
      
      // Count by priority
      byPriority[task.priority] = (byPriority[task.priority] || 0) + 1;
      
      // Calculate XP
      if (task.status === 'completed' && task.xpValue) {
        totalXP += task.xpValue;
      }
      
      // Count overdue
      if (task.dueDate && task.dueDate < new Date() && task.status !== 'completed') {
        overdue++;
      }

      // Health-specific metrics
      if (task.energyLevel) {
        averageEnergyLevel += task.energyLevel;
      }
      if (task.painLevel) {
        averagePainLevel += task.painLevel;
      }
      if (task.sleepDuration) {
        totalSleepHours += task.sleepDuration;
      }
      if (task.duration) {
        totalExerciseMinutes += task.duration;
      }
    });

    // Calculate averages
    const tasksWithEnergy = healthTasks.filter(t => t.energyLevel).length;
    const tasksWithPain = healthTasks.filter(t => t.painLevel).length;
    
    averageEnergyLevel = tasksWithEnergy > 0 ? averageEnergyLevel / tasksWithEnergy : 0;
    averagePainLevel = tasksWithPain > 0 ? averagePainLevel / tasksWithPain : 0;

    res.status(200).json({
      success: true,
      data: {
        totalTasks,
        byCategory,
        byStatus,
        byPriority,
        totalXP,
        overdue,
        healthMetrics: {
          averageEnergyLevel: Math.round(averageEnergyLevel * 10) / 10,
          averagePainLevel: Math.round(averagePainLevel * 10) / 10,
          totalSleepHours: Math.round(totalSleepHours * 10) / 10,
          totalExerciseMinutes,
          averageSleepQuality: healthTasks.filter(t => t.sleepQuality).length > 0 
            ? Math.round(healthTasks.reduce((sum, t) => sum + (t.sleepQuality || 0), 0) / healthTasks.filter(t => t.sleepQuality).length * 10) / 10
            : 0
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/health-tasks
// @desc    Create new health task
// @access  Private
router.post('/', authenticate, [
  body('title').notEmpty().withMessage('Title is required'),
  body('healthCategory').isIn(['exercise', 'medical', 'mental_health', 'nutrition', 'sleep']).withMessage('Invalid health category'),
  body('priority').optional().isIn(['low', 'medium', 'high', 'urgent']).withMessage('Invalid priority'),
  body('estimatedDuration').optional().isInt({ min: 1 }).withMessage('Estimated duration must be a positive integer'),
  body('mood').optional().isString().withMessage('Mood must be a string'),
  body('energyLevel').optional().isInt({ min: 1, max: 5 }).withMessage('Energy level must be between 1 and 5'),
  body('painLevel').optional().isInt({ min: 1, max: 10 }).withMessage('Pain level must be between 1 and 10'),
  body('healthNotes').optional().isString().withMessage('Health notes must be a string')
], async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = (req as any).user['id'];
    const taskData = {
      ...req.body,
      assignee: userId,
      assignedBy: req.body.assignedBy || userId,
      taskType: 'health'
    };

    const healthTask = await HealthTask.create(taskData);
    await healthTask.populate('assignee', 'name email avatar');
    await healthTask.populate('assignedBy', 'name email avatar');
    await healthTask.populate('collaborators', 'name email avatar');

    res.status(201).json({
      success: true,
      data: healthTask
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/health-tasks/:id
// @desc    Get single health task
// @access  Private
router.get('/:id', authenticate, [
  param('id').isMongoId().withMessage('Please provide a valid health task ID')
], async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = (req as any).user['id'];
    const taskId = req.params['id'];

    const healthTask = await HealthTask.findOne({
      _id: taskId,
      $or: [
        { assignee: userId },
        { collaborators: userId }
      ]
    })
    .populate('assignee', 'name email avatar')
    .populate('assignedBy', 'name email avatar')
    .populate('collaborators', 'name email avatar')
    .populate('parentTask', 'title')
    .populate('subtasks', 'title status')
    .populate('notes.createdBy', 'name email avatar');

    if (!healthTask) {
      throw new CustomError('Health task not found', 404);
    }

    res.status(200).json({
      success: true,
      data: healthTask
    });
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/health-tasks/:id
// @desc    Update health task
// @access  Private
router.put('/:id', authenticate, [
  param('id').isMongoId().withMessage('Please provide a valid health task ID'),
  body('title').optional().notEmpty().withMessage('Title cannot be empty'),
  body('healthCategory').optional().isIn(['exercise', 'medical', 'mental_health', 'nutrition', 'sleep']).withMessage('Invalid health category'),
  body('priority').optional().isIn(['low', 'medium', 'high', 'urgent']).withMessage('Invalid priority'),
  body('estimatedDuration').optional().isInt({ min: 1 }).withMessage('Estimated duration must be a positive integer'),
  body('mood').optional().isString().withMessage('Mood must be a string'),
  body('energyLevel').optional().isInt({ min: 1, max: 5 }).withMessage('Energy level must be between 1 and 5'),
  body('painLevel').optional().isInt({ min: 1, max: 10 }).withMessage('Pain level must be between 1 and 10'),
  body('healthNotes').optional().isString().withMessage('Health notes must be a string')
], async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = (req as any).user['id'];
    const taskId = req.params['id'];

    const healthTask = await HealthTask.findOne({
      _id: taskId,
      $or: [
        { assignee: userId },
        { collaborators: userId }
      ]
    });

    if (!healthTask) {
      throw new CustomError('Health task not found', 404);
    }

    // Only assignee can update certain fields
    const isAssignee = healthTask.assignee.toString() === userId;
    const updateData = { ...req.body };

    if (!isAssignee) {
      // Collaborators can only update limited fields
      const allowedFields = ['notes', 'actualDuration', 'healthNotes', 'mood', 'energyLevel', 'painLevel'];
      Object.keys(updateData).forEach(key => {
        if (!allowedFields.includes(key)) {
          delete updateData[key];
        }
      });
    }

    const updatedHealthTask = await HealthTask.findByIdAndUpdate(taskId, updateData, {
      new: true,
      runValidators: true
    })
    .populate('assignee', 'name email avatar')
    .populate('assignedBy', 'name email avatar')
    .populate('collaborators', 'name email avatar')
    .populate('parentTask', 'title')
    .populate('subtasks', 'title status');

    res.status(200).json({
      success: true,
      data: updatedHealthTask
    });
  } catch (error) {
    next(error);
  }
});

// @route   DELETE /api/health-tasks/:id
// @desc    Delete health task
// @access  Private
router.delete('/:id', authenticate, [
  param('id').isMongoId().withMessage('Please provide a valid health task ID')
], async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = (req as any).user['id'];
    const taskId = req.params['id'];

    const healthTask = await HealthTask.findOne({
      _id: taskId,
      assignee: userId // Only assignee can delete
    });

    if (!healthTask) {
      throw new CustomError('Health task not found', 404);
    }

    // If this task has subtasks, delete them too
    if (healthTask.subtasks.length > 0) {
      await HealthTask.deleteMany({ _id: { $in: healthTask.subtasks } });
    }

    await healthTask.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Health task deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/health-tasks/:id/notes
// @desc    Add note to health task
// @access  Private
router.post('/:id/notes', authenticate, [
  param('id').isMongoId().withMessage('Please provide a valid health task ID'),
  body('content').notEmpty().withMessage('Note content is required')
], async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = (req as any).user['id'];
    const taskId = req.params['id'];
    const { content } = req.body;

    const healthTask = await HealthTask.findOne({
      _id: taskId,
      $or: [
        { assignee: userId },
        { collaborators: userId }
      ]
    });

    if (!healthTask) {
      throw new CustomError('Health task not found', 404);
    }

    // Add note directly to the notes array
    healthTask.notes.push({
      content,
      createdBy: userId,
      createdAt: new Date()
    });
    await healthTask.save();
    await healthTask.populate('notes.createdBy', 'name email avatar');

    res.status(200).json({
      success: true,
      data: healthTask.notes
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/health-tasks/:id/reminders
// @desc    Add reminder to health task
// @access  Private
router.post('/:id/reminders', authenticate, [
  param('id').isMongoId().withMessage('Please provide a valid health task ID'),
  body('date').isISO8601().withMessage('Invalid reminder date format'),
  body('message').notEmpty().withMessage('Reminder message is required')
], async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = (req as any).user['id'];
    const taskId = req.params['id'];
    const { date, message } = req.body;

    const healthTask = await HealthTask.findOne({
      _id: taskId,
      assignee: userId // Only assignee can add reminders
    });

    if (!healthTask) {
      throw new CustomError('Health task not found', 404);
    }

    // Add reminder directly to the reminders array
    healthTask.reminders.push({
      date: new Date(date),
      message,
      isSent: false
    });
    await healthTask.save();

    res.status(200).json({
      success: true,
      data: healthTask.reminders
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/health-tasks/overdue
// @desc    Get overdue health tasks
// @access  Private
router.get('/overdue', authenticate, async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = (req as any).user['id'];

    const overdueTasks = await HealthTask.find({
      $or: [
        { assignee: userId },
        { collaborators: userId }
      ],
      dueDate: { $lt: new Date() },
      status: { $ne: 'completed' }
    })
    .populate('assignee', 'name email avatar')
    .populate('collaborators', 'name email avatar')
    .sort({ dueDate: 1 });

    res.status(200).json({
      success: true,
      count: overdueTasks.length,
      data: overdueTasks
    });
  } catch (error) {
    next(error);
  }
});

export default router;