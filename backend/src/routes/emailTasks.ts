import express, { NextFunction, Request, Response, Router, RequestHandler } from 'express';
import { check, validationResult } from 'express-validator';
import authenticate, { AuthenticatedRequest } from '../middleware/auth';
import EmailTask from '../models/EmailTask';

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

// Middleware to ensure user owns the email task
const mustOwnEmailTask = (): RequestHandler =>
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const taskId = req.params['id'];
    
    try {
      const task = await EmailTask.findById(taskId);
      
      if (!task) {
        res.status(404).json({ error: 'Email task not found' });
        return;
      }

      if (String(task.assignee) !== String(req.user._id)) {
        res.status(403).json({ error: 'You can only modify your own email tasks' });
        return;
      }

      req.emailTask = task;
      next();
    } catch (error) {
      res.status(400).json({ error: 'Invalid email task ID' });
    }
  };

// Email task validation
const emailTaskValidation = [
  check('title')
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ min: 1, max: 200 })
    .withMessage('Title must be between 1 and 200 characters'),
  check('recipient')
    .notEmpty()
    .withMessage('Recipient email is required')
    .isEmail()
    .withMessage('Invalid recipient email format'),
  check('recipientName')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Recipient name must be less than 100 characters'),
  check('subject')
    .notEmpty()
    .withMessage('Email subject is required')
    .isLength({ min: 1, max: 200 })
    .withMessage('Subject must be between 1 and 200 characters'),
  check('emailType')
    .notEmpty()
    .withMessage('Email type is required')
    .isIn(['personal', 'work', 'newsletter', 'follow_up', 'meeting_request', 'other'])
    .withMessage('Invalid email type'),
  check('emailPriority')
    .optional()
    .isIn(['low', 'medium', 'high', 'urgent'])
    .withMessage('Invalid email priority'),
  check('isReply')
    .optional()
    .isBoolean()
    .withMessage('isReply must be a boolean'),
  check('originalEmailId')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Original email ID must be less than 100 characters'),
  check('emailAttachments')
    .optional()
    .isArray()
    .withMessage('Email attachments must be an array'),
  check('draftContent')
    .optional()
    .isLength({ max: 5000 })
    .withMessage('Draft content must be less than 5000 characters'),
  check('followUpDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid follow-up date format'),
  check('emailTemplate')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Email template must be less than 100 characters')
];

const router: Router = express.Router();

// ========================= EMAIL TASK ROUTES =========================

// @route   GET /api/email-tasks
// @desc    Get all email tasks for authenticated user
// @access  Private
router.get('/', authenticate, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!._id;
  const { emailType, emailPriority, status, isReply, page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

  const query: any = { assignee: userId };
  
  if (emailType) query.emailType = emailType;
  if (emailPriority) query.emailPriority = emailPriority;
  if (status) query.status = status;
  if (isReply !== undefined) query.isReply = isReply === 'true';

  const skip = (Number(page) - 1) * Number(limit);
  const sortOptions: any = {};
  sortOptions[sortBy as string] = sortOrder === 'desc' ? -1 : 1;

  const emailTasks = await EmailTask.find(query)
    .skip(skip)
    .limit(Number(limit))
    .sort(sortOptions)
    .populate('assignee', 'name email');

  const total = await EmailTask.countDocuments(query);

  res.status(200).json({
    emailTasks,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / Number(limit))
    }
  });
}));

// @route   GET /api/email-tasks/stats
// @desc    Get email task statistics
// @access  Private
router.get('/stats', authenticate, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!._id;
  const { period = '30' } = req.query; // days

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - Number(period));

  const emailTasks = await EmailTask.find({
    assignee: userId,
    createdAt: { $gte: startDate }
  });

  const stats = {
    totalEmailTasks: emailTasks.length,
    byEmailType: {
      personal: emailTasks.filter(t => t.emailType === 'personal').length,
      work: emailTasks.filter(t => t.emailType === 'work').length,
      newsletter: emailTasks.filter(t => t.emailType === 'newsletter').length,
      follow_up: emailTasks.filter(t => t.emailType === 'follow_up').length,
      meeting_request: emailTasks.filter(t => t.emailType === 'meeting_request').length,
      other: emailTasks.filter(t => t.emailType === 'other').length
    },
    byPriority: {
      low: emailTasks.filter(t => t.emailPriority === 'low').length,
      medium: emailTasks.filter(t => t.emailPriority === 'medium').length,
      high: emailTasks.filter(t => t.emailPriority === 'high').length,
      urgent: emailTasks.filter(t => t.emailPriority === 'urgent').length
    },
    byStatus: {
      pending: emailTasks.filter(t => t.status === 'pending').length,
      in_progress: emailTasks.filter(t => t.status === 'in_progress').length,
      completed: emailTasks.filter(t => t.status === 'completed').length,
      cancelled: emailTasks.filter(t => t.status === 'cancelled').length
    },
    sentEmails: emailTasks.filter(t => t.sentAt).length,
    replies: emailTasks.filter(t => t.isReply).length,
    followUpsNeeded: emailTasks.filter(t => t.needsFollowUp).length,
    overdue: emailTasks.filter(t => t.isOverdue).length,
    averageResponseTime: emailTasks.length > 0 
      ? Math.round(emailTasks.reduce((sum, t) => sum + (t.estimatedDuration || 0), 0) / emailTasks.length)
      : 0
  };

  res.status(200).json(stats);
}));

// @route   POST /api/email-tasks
// @desc    Create a new email task
// @access  Private
router.post('/', authenticate, emailTaskValidation, handleValidationErrors, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const emailTask = new EmailTask({
    ...req.body,
    assignee: req.user!._id,
    taskType: 'email'
  });

  await emailTask.save();
  res.status(201).json(emailTask);
}));

// @route   GET /api/email-tasks/:id
// @desc    Get a specific email task
// @access  Private
router.get('/:id', authenticate, mustOwnEmailTask(), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  res.status(200).json(req.emailTask);
}));

// @route   PUT /api/email-tasks/:id
// @desc    Update a specific email task
// @access  Private
router.put('/:id', authenticate, mustOwnEmailTask(), emailTaskValidation, handleValidationErrors, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const updatedEmailTask = await EmailTask.findByIdAndUpdate(
    req.params['id'],
    { ...req.body },
    { new: true, runValidators: true }
  );

  res.status(200).json(updatedEmailTask);
}));

// @route   DELETE /api/email-tasks/:id
// @desc    Delete a specific email task
// @access  Private
router.delete('/:id', authenticate, mustOwnEmailTask(), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  await EmailTask.findByIdAndDelete(req.params['id']);
  res.status(200).json({ message: 'Email task deleted successfully' });
}));

// @route   POST /api/email-tasks/:id/mark-sent
// @desc    Mark an email as sent
// @access  Private
router.post('/:id/mark-sent', authenticate, mustOwnEmailTask(), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  await req.emailTask!.markAsSent();
  const updatedTask = await EmailTask.findById(req.params['id']);
  
  res.status(200).json(updatedTask);
}));

// @route   POST /api/email-tasks/:id/mark-reply-received
// @desc    Mark a reply as received
// @access  Private
router.post('/:id/mark-reply-received', authenticate, mustOwnEmailTask(), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  await req.emailTask!.markReplyReceived();
  const updatedTask = await EmailTask.findById(req.params['id']);
  
  res.status(200).json(updatedTask);
}));

// @route   POST /api/email-tasks/:id/schedule-follow-up
// @desc    Schedule a follow-up for an email
// @access  Private
router.post('/:id/schedule-follow-up', authenticate, mustOwnEmailTask(), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { followUpDate } = req.body;
  
  if (!followUpDate) {
    res.status(400).json({ error: 'Follow-up date is required' });
    return;
  }

  const date = new Date(followUpDate);
  if (isNaN(date.getTime())) {
    res.status(400).json({ error: 'Invalid follow-up date format' });
    return;
  }

  await req.emailTask!.scheduleFollowUp(date);
  const updatedTask = await EmailTask.findById(req.params['id']);
  
  res.status(200).json(updatedTask);
}));

// @route   GET /api/email-tasks/:id/status
// @desc    Get email task status information
// @access  Private
router.get('/:id/status', authenticate, mustOwnEmailTask(), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const task = req.emailTask!;
  
  res.status(200).json({
    isOverdue: task.isOverdue,
    needsFollowUp: task.needsFollowUp,
    sentAt: task.sentAt,
    readAt: task.readAt,
    replyReceived: task.replyReceived,
    followUpDate: task.followUpDate,
    status: task.status
  });
}));

// @route   GET /api/email-tasks/search/recipients
// @desc    Search email tasks by recipient
// @access  Private
router.get('/search/recipients', authenticate, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { recipient, page = 1, limit = 10 } = req.query;
  
  if (!recipient) {
    res.status(400).json({ error: 'Recipient search term is required' });
    return;
  }

  const userId = req.user!._id;
  const skip = (Number(page) - 1) * Number(limit);

  const emailTasks = await EmailTask.find({
    assignee: userId,
    $or: [
      { recipient: { $regex: recipient, $options: 'i' } },
      { recipientName: { $regex: recipient, $options: 'i' } }
    ]
  })
    .skip(skip)
    .limit(Number(limit))
    .sort({ createdAt: -1 });

  res.status(200).json({
    emailTasks,
    searchTerm: recipient,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total: emailTasks.length
    }
  });
}));

// @route   GET /api/email-tasks/follow-ups-needed
// @desc    Get email tasks that need follow-up
// @access  Private
router.get('/follow-ups-needed', authenticate, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!._id;

  const followUpTasks = await EmailTask.find({
    assignee: userId,
    followUpDate: { $lte: new Date() },
    replyReceived: false,
    status: { $ne: 'completed' }
  })
    .sort({ followUpDate: 1 });

  res.status(200).json({
    followUpTasks,
    total: followUpTasks.length
  });
}));

// @route   GET /api/email-tasks/overdue
// @desc    Get overdue email tasks
// @access  Private
router.get('/overdue', authenticate, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!._id;

  const overdueTasks = await EmailTask.find({
    assignee: userId,
    followUpDate: { $lt: new Date() },
    status: { $ne: 'completed' }
  })
    .sort({ followUpDate: 1 });

  res.status(200).json({
    overdueTasks,
    total: overdueTasks.length
  });
}));

export default router;
