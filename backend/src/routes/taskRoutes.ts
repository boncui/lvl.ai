import { Router, Request, Response, NextFunction } from 'express';
import { body, param, query } from 'express-validator';
import Task from '@/models/Task';
import User from '@/models/User';
import { CustomError } from '@/middleware/errorHandler';
import authenticate from '../middleware/auth';

const router = Router();

// @route   GET /api/tasks
// @desc    Get all tasks for user
// @access  Private
router.get('/', authenticate, [
  query('status').optional().isIn(['pending', 'in_progress', 'completed', 'cancelled']).withMessage('Invalid status'),
  query('type').optional().isString().withMessage('Type must be a string'),
  query('priority').optional().isIn(['low', 'medium', 'high', 'urgent']).withMessage('Invalid priority'),
  query('tag').optional().isString().withMessage('Tag must be a string'),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('sortBy').optional().isIn(['createdAt', 'updatedAt', 'dueDate', 'priority']).withMessage('Invalid sort field'),
  query('sortOrder').optional().isIn(['asc', 'desc']).withMessage('Sort order must be asc or desc')
], async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = (req as any).user['id'];
    const { status, type, priority, tag, page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

    // Build filter object
    const filter: any = {
      $or: [
        { assignee: userId },
        { collaborators: userId }
      ]
    };

    if (status) filter.status = status;
    if (type) filter.type = type;
    if (priority) filter.priority = priority;
    if (tag) filter.tags = tag;

    // Build sort object
    const sort: any = {};
    sort[sortBy as string] = sortOrder === 'desc' ? -1 : 1;

    const skip = (Number(page) - 1) * Number(limit);

    const tasks = await Task.find(filter)
      .populate('assignee', 'name email avatar')
      .populate('assignedBy', 'name email avatar')
      .populate('collaborators', 'name email avatar')
      .populate('parentTask', 'title')
      .populate('subtasks', 'title status')
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
], async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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

    const tasks = await Task.find(filter);
    
    // Calculate statistics
    const totalTasks = tasks.length;
    const byType: Record<string, number> = {};
    const byStatus: Record<string, number> = {};
    const byPriority: Record<string, number> = {};
    let totalXP = 0;
    let overdue = 0;

    tasks.forEach(task => {
      // Count by type
      byType[task.taskType] = (byType[task.taskType] || 0) + 1;
      
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
    });

    res.status(200).json({
      success: true,
      data: {
        totalTasks,
        byType,
        byStatus,
        byPriority,
        totalXP,
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
  body('taskType').isIn(['food', 'homework', 'email', 'meeting', 'project', 'personal', 'work', 'health', 'social', 'other']).withMessage('Invalid task type'),
  body('priority').optional().isIn(['low', 'medium', 'high', 'urgent']).withMessage('Invalid priority'),
  body('dueDate').optional().isISO8601().withMessage('Invalid due date format'),
  body('estimatedDuration').optional().isInt({ min: 1 }).withMessage('Estimated duration must be a positive integer'),
  body('tags').optional().isArray().withMessage('Tags must be an array'),
  body('location').optional().isString().withMessage('Location must be a string'),
  body('collaborators').optional().isArray().withMessage('Collaborators must be an array'),
  body('assignedBy').optional().isMongoId().withMessage('Assigned by must be a valid user ID')
], async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = (req as any).user['id'];
    const taskData = {
      ...req.body,
      assignee: userId,
      assignedBy: req.body.assignedBy || userId
    };

    // If collaborators are specified, verify they exist
    if (req.body.collaborators && req.body.collaborators.length > 0) {
      const collaborators = await User.find({ _id: { $in: req.body.collaborators } });
      if (collaborators.length !== req.body.collaborators.length) {
        throw new CustomError('One or more collaborators not found', 400);
      }
    }

    const task = await Task.create(taskData);
    await task.populate('assignee', 'name email avatar');
    await task.populate('assignedBy', 'name email avatar');
    await task.populate('collaborators', 'name email avatar');

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
], async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = (req as any).user['id'];
    const taskId = req.params['id'];

    const task = await Task.findOne({
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
  body('dueDate').optional().isISO8601().withMessage('Invalid due date format'),
  body('estimatedDuration').optional().isInt({ min: 1 }).withMessage('Estimated duration must be a positive integer'),
  body('tags').optional().isArray().withMessage('Tags must be an array'),
  body('location').optional().isString().withMessage('Location must be a string'),
  body('collaborators').optional().isArray().withMessage('Collaborators must be an array')
], async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = (req as any).user['id'];
    const taskId = req.params['id'];

    const task = await Task.findOne({
      _id: taskId,
      $or: [
        { assignee: userId },
        { collaborators: userId }
      ]
    });

    if (!task) {
      throw new CustomError('Task not found', 404);
    }

    // Only assignee can update certain fields
    const isAssignee = task.assignee.toString() === userId;
    const updateData = { ...req.body };

    if (!isAssignee) {
      // Collaborators can only update limited fields
      const allowedFields = ['notes', 'actualDuration'];
      Object.keys(updateData).forEach(key => {
        if (!allowedFields.includes(key)) {
          delete updateData[key];
        }
      });
    }

    // If collaborators are being updated, verify they exist
    if (updateData.collaborators && updateData.collaborators.length > 0) {
      const collaborators = await User.find({ _id: { $in: updateData.collaborators } });
      if (collaborators.length !== updateData.collaborators.length) {
        throw new CustomError('One or more collaborators not found', 400);
      }
    }

    const updatedTask = await Task.findByIdAndUpdate(taskId, updateData, {
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
], async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = (req as any).user['id'];
    const taskId = req.params['id'];

    const task = await Task.findOne({
      _id: taskId,
      assignee: userId // Only assignee can delete
    });

    if (!task) {
      throw new CustomError('Task not found', 404);
    }

    // If this task has subtasks, delete them too
    if (task.subtasks.length > 0) {
      await Task.deleteMany({ _id: { $in: task.subtasks } });
    }

    await task.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Task deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/tasks/:id/notes
// @desc    Add note to task
// @access  Private
router.post('/:id/notes', authenticate, [
  param('id').isMongoId().withMessage('Please provide a valid task ID'),
  body('content').notEmpty().withMessage('Note content is required')
], async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = (req as any).user['id'];
    const taskId = req.params['id'];
    const { content } = req.body;

    const task = await Task.findOne({
      _id: taskId,
      $or: [
        { assignee: userId },
        { collaborators: userId }
      ]
    });

    if (!task) {
      throw new CustomError('Task not found', 404);
    }

    // Add note directly to the notes array
    task.notes.push({
      content,
      createdBy: userId,
      createdAt: new Date()
    });
    await task.save();
    await task.populate('notes.createdBy', 'name email avatar');

    res.status(200).json({
      success: true,
      data: task.notes
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/tasks/:id/reminders
// @desc    Add reminder to task
// @access  Private
router.post('/:id/reminders', authenticate, [
  param('id').isMongoId().withMessage('Please provide a valid task ID'),
  body('date').isISO8601().withMessage('Invalid reminder date format'),
  body('message').notEmpty().withMessage('Reminder message is required')
], async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = (req as any).user['id'];
    const taskId = req.params['id'];
    const { date, message } = req.body;

    const task = await Task.findOne({
      _id: taskId,
      assignee: userId // Only assignee can add reminders
    });

    if (!task) {
      throw new CustomError('Task not found', 404);
    }

    // Add reminder directly to the reminders array
    task.reminders.push({
      date: new Date(date),
      message,
      isSent: false
    });
    await task.save();

    res.status(200).json({
      success: true,
      data: task.reminders
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/tasks/:id/collaborators
// @desc    Add collaborator to task
// @access  Private
router.post('/:id/collaborators', authenticate, [
  param('id').isMongoId().withMessage('Please provide a valid task ID'),
  body('collaboratorId').isMongoId().withMessage('Please provide a valid collaborator ID')
], async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = (req as any).user['id'];
    const taskId = req.params['id'];
    const { collaboratorId } = req.body;

    const task = await Task.findOne({
      _id: taskId,
      assignee: userId // Only assignee can add collaborators
    });

    if (!task) {
      throw new CustomError('Task not found', 404);
    }

    // Check if collaborator exists
    const collaborator = await User.findById(collaboratorId);
    if (!collaborator) {
      throw new CustomError('User not found', 404);
    }

    // Add collaborator directly to the collaborators array
    if (!task.collaborators.includes(collaboratorId)) {
      task.collaborators.push(collaboratorId);
      await task.save();
    }
    await task.populate('collaborators', 'name email avatar');

    res.status(200).json({
      success: true,
      data: task.collaborators
    });
  } catch (error) {
    next(error);
  }
});

// @route   DELETE /api/tasks/:id/collaborators/:collaboratorId
// @desc    Remove collaborator from task
// @access  Private
router.delete('/:id/collaborators/:collaboratorId', authenticate, [
  param('id').isMongoId().withMessage('Please provide a valid task ID'),
  param('collaboratorId').isMongoId().withMessage('Please provide a valid collaborator ID')
], async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = (req as any).user['id'];
    const taskId = req.params['id'];
    const collaboratorId = req.params['collaboratorId'];

    const task = await Task.findOne({
      _id: taskId,
      assignee: userId // Only assignee can remove collaborators
    });

    if (!task) {
      throw new CustomError('Task not found', 404);
    }

    // Remove collaborator directly from the collaborators array
    task.collaborators = task.collaborators.filter(id => id.toString() !== collaboratorId);
    await task.save();
    await task.populate('collaborators', 'name email avatar');

    res.status(200).json({
      success: true,
      data: task.collaborators
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/tasks/type/:type
// @desc    Get tasks by type
// @access  Private
router.get('/type/:type', authenticate, [
  param('type').isIn(['food', 'homework', 'email', 'meeting', 'project', 'personal', 'work', 'health', 'social', 'other']).withMessage('Invalid task type'),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
], async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = (req as any).user['id'];
    const { type } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    const tasks = await Task.find({
      taskType: type,
      $or: [
        { assignee: userId },
        { collaborators: userId }
      ]
    })
    .populate('assignee', 'name email avatar')
    .populate('collaborators', 'name email avatar')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit));

    const total = await Task.countDocuments({
      taskType: type,
      $or: [
        { assignee: userId },
        { collaborators: userId }
      ]
    });

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

// @route   GET /api/tasks/overdue
// @desc    Get overdue tasks
// @access  Private
router.get('/overdue', authenticate, async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = (req as any).user['id'];

    const tasks = await Task.find({
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
      count: tasks.length,
      data: tasks
    });
  } catch (error) {
    next(error);
  }
});

export default router;