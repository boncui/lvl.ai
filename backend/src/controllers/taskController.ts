import { Request, Response, NextFunction } from 'express';
import Task from '@/models/Task';
import User from '@/models/User';
import { CustomError } from '@/middleware/errorHandler';

// @desc    Create new task
// @route   POST /api/tasks
// @access  Private
export const createTask = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = (req as any).user.id;
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
};

// @desc    Get all tasks for user
// @route   GET /api/tasks
// @access  Private
export const getTasks = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = (req as any).user.id;
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
};

// @desc    Get single task
// @route   GET /api/tasks/:id
// @access  Private
export const getTask = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const taskId = req.params.id;

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
};

// @desc    Update task
// @route   PUT /api/tasks/:id
// @access  Private
export const updateTask = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const taskId = req.params.id;

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
};

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private
export const deleteTask = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const taskId = req.params.id;

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
};

// @desc    Add note to task
// @route   POST /api/tasks/:id/notes
// @access  Private
export const addNote = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const taskId = req.params.id;
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

    await task.addNote(content, userId);
    await task.populate('notes.createdBy', 'name email avatar');

    res.status(200).json({
      success: true,
      data: task.notes
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add reminder to task
// @route   POST /api/tasks/:id/reminders
// @access  Private
export const addReminder = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const taskId = req.params.id;
    const { date, message } = req.body;

    const task = await Task.findOne({
      _id: taskId,
      assignee: userId // Only assignee can add reminders
    });

    if (!task) {
      throw new CustomError('Task not found', 404);
    }

    await task.addReminder(new Date(date), message);

    res.status(200).json({
      success: true,
      data: task.reminders
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add collaborator to task
// @route   POST /api/tasks/:id/collaborators
// @access  Private
export const addCollaborator = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const taskId = req.params.id;
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

    await task.addCollaborator(collaboratorId);
    await task.populate('collaborators', 'name email avatar');

    res.status(200).json({
      success: true,
      data: task.collaborators
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove collaborator from task
// @route   DELETE /api/tasks/:id/collaborators/:collaboratorId
// @access  Private
export const removeCollaborator = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const taskId = req.params.id;
    const collaboratorId = req.params.collaboratorId;

    const task = await Task.findOne({
      _id: taskId,
      assignee: userId // Only assignee can remove collaborators
    });

    if (!task) {
      throw new CustomError('Task not found', 404);
    }

    await task.removeCollaborator(collaboratorId);
    await task.populate('collaborators', 'name email avatar');

    res.status(200).json({
      success: true,
      data: task.collaborators
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get tasks by type
// @route   GET /api/tasks/type/:type
// @access  Private
export const getTasksByType = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const { type } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    const tasks = await Task.find({
      type,
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
      type,
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
};

// @desc    Get overdue tasks
// @route   GET /api/tasks/overdue
// @access  Private
export const getOverdueTasks = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = (req as any).user.id;

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
};
