import express, { NextFunction, Request, Response, Router, RequestHandler } from 'express';
import { check, validationResult } from 'express-validator';
import authenticate, { AuthenticatedRequest } from '../middleware/auth';
import MeetingTask from '../models/MeetingTask';
import User from '../models/User';

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

// Middleware to ensure user owns the meeting task
const mustOwnMeetingTask = (): RequestHandler =>
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const taskId = req.params['id'];
    
    try {
      const task = await MeetingTask.findById(taskId);
      
      if (!task) {
        res.status(404).json({ error: 'Meeting task not found' });
        return;
      }

      if (String(task.assignee) !== String(req.user._id)) {
        res.status(403).json({ error: 'You can only modify your own meeting tasks' });
        return;
      }

      req.meetingTask = task;
      next();
    } catch (error) {
      res.status(400).json({ error: 'Invalid meeting task ID' });
    }
  };

// Meeting task validation
const meetingTaskValidation = [
  check('title')
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ min: 1, max: 200 })
    .withMessage('Title must be between 1 and 200 characters'),
  check('meetingType')
    .notEmpty()
    .withMessage('Meeting type is required')
    .isIn(['team_meeting', 'one_on_one', 'client_meeting', 'interview', 'presentation', 'workshop', 'other'])
    .withMessage('Invalid meeting type'),
  check('attendees')
    .notEmpty()
    .withMessage('At least one attendee is required')
    .isArray({ min: 1 })
    .withMessage('Attendees must be an array with at least one member'),
  check('attendeeEmails')
    .optional()
    .isArray()
    .withMessage('Attendee emails must be an array'),
  check('meetingRoom')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Meeting room must be less than 100 characters'),
  check('meetingLink')
    .optional()
    .isURL()
    .withMessage('Meeting link must be a valid URL'),
  check('agenda')
    .optional()
    .isArray()
    .withMessage('Agenda must be an array'),
  check('meetingDuration')
    .notEmpty()
    .withMessage('Meeting duration is required')
    .isInt({ min: 5 })
    .withMessage('Meeting duration must be at least 5 minutes'),
  check('actualDuration')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Actual duration must be at least 1 minute'),
  check('meetingOutcome')
    .optional()
    .isIn(['successful', 'needs_follow_up', 'cancelled', 'rescheduled'])
    .withMessage('Invalid meeting outcome'),
  check('recurringMeeting')
    .optional()
    .isBoolean()
    .withMessage('recurringMeeting must be a boolean'),
  check('meetingSeriesId')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Meeting series ID must be less than 100 characters')
];

const router: Router = express.Router();

// ========================= MEETING TASK ROUTES =========================

// @route   GET /api/meeting-tasks
// @desc    Get all meeting tasks for authenticated user
// @access  Private
router.get('/', authenticate, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!._id;
  const { meetingType, status, recurringMeeting, page = 1, limit = 10, sortBy = 'startDate', sortOrder = 'asc' } = req.query;

  const query: any = { assignee: userId };
  
  if (meetingType) query.meetingType = meetingType;
  if (status) query.status = status;
  if (recurringMeeting !== undefined) query.recurringMeeting = recurringMeeting === 'true';

  const skip = (Number(page) - 1) * Number(limit);
  const sortOptions: any = {};
  sortOptions[sortBy as string] = sortOrder === 'desc' ? -1 : 1;

  const meetingTasks = await MeetingTask.find(query)
    .skip(skip)
    .limit(Number(limit))
    .sort(sortOptions)
    .populate('assignee', 'name email')
    .populate('attendees', 'name email')
    .populate('actionItems.assignee', 'name email');

  const total = await MeetingTask.countDocuments(query);

  res.status(200).json({
    meetingTasks,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / Number(limit))
    }
  });
}));

// @route   GET /api/meeting-tasks/stats
// @desc    Get meeting task statistics
// @access  Private
router.get('/stats', authenticate, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!._id;
  const { period = '30' } = req.query; // days

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - Number(period));

  const meetingTasks = await MeetingTask.find({
    assignee: userId,
    createdAt: { $gte: startDate }
  });

  const stats = {
    totalMeetingTasks: meetingTasks.length,
    byMeetingType: {
      team_meeting: meetingTasks.filter(t => t.meetingType === 'team_meeting').length,
      one_on_one: meetingTasks.filter(t => t.meetingType === 'one_on_one').length,
      client_meeting: meetingTasks.filter(t => t.meetingType === 'client_meeting').length,
      interview: meetingTasks.filter(t => t.meetingType === 'interview').length,
      presentation: meetingTasks.filter(t => t.meetingType === 'presentation').length,
      workshop: meetingTasks.filter(t => t.meetingType === 'workshop').length,
      other: meetingTasks.filter(t => t.meetingType === 'other').length
    },
    byStatus: {
      pending: meetingTasks.filter(t => t.status === 'pending').length,
      in_progress: meetingTasks.filter(t => t.status === 'in_progress').length,
      completed: meetingTasks.filter(t => t.status === 'completed').length,
      cancelled: meetingTasks.filter(t => t.status === 'cancelled').length
    },
    byOutcome: {
      successful: meetingTasks.filter(t => t.meetingOutcome === 'successful').length,
      needs_follow_up: meetingTasks.filter(t => t.meetingOutcome === 'needs_follow_up').length,
      cancelled: meetingTasks.filter(t => t.meetingOutcome === 'cancelled').length,
      rescheduled: meetingTasks.filter(t => t.meetingOutcome === 'rescheduled').length
    },
    recurringMeetings: meetingTasks.filter(t => t.recurringMeeting).length,
    oneTimeMeetings: meetingTasks.filter(t => !t.recurringMeeting).length,
    averageDuration: meetingTasks.length > 0 
      ? Math.round(meetingTasks.reduce((sum, t) => sum + t.meetingDuration, 0) / meetingTasks.length)
      : 0,
    totalActionItems: meetingTasks.reduce((sum, t) => sum + (t.actionItems?.length || 0), 0),
    completedActionItems: meetingTasks.reduce((sum, t) => 
      sum + (t.actionItems?.filter((item: any) => item.completed).length || 0), 0),
    happeningNow: meetingTasks.filter(t => (t as any).isHappeningNow).length
  };

  res.status(200).json(stats);
}));

// @route   POST /api/meeting-tasks
// @desc    Create a new meeting task
// @access  Private
router.post('/', authenticate, meetingTaskValidation, handleValidationErrors, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const meetingTask = new MeetingTask({
    ...req.body,
    assignee: req.user!._id,
    taskType: 'meeting'
  });

  await meetingTask.save();
  res.status(201).json(meetingTask);
}));

// @route   GET /api/meeting-tasks/:id
// @desc    Get a specific meeting task
// @access  Private
router.get('/:id', authenticate, mustOwnMeetingTask(), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  res.status(200).json(req.meetingTask);
}));

// @route   PUT /api/meeting-tasks/:id
// @desc    Update a specific meeting task
// @access  Private
router.put('/:id', authenticate, mustOwnMeetingTask(), meetingTaskValidation, handleValidationErrors, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const updatedMeetingTask = await MeetingTask.findByIdAndUpdate(
    req.params['id'],
    { ...req.body },
    { new: true, runValidators: true }
  );

  res.status(200).json(updatedMeetingTask);
}));

// @route   DELETE /api/meeting-tasks/:id
// @desc    Delete a specific meeting task
// @access  Private
router.delete('/:id', authenticate, mustOwnMeetingTask(), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  await MeetingTask.findByIdAndDelete(req.params['id']);
  res.status(200).json({ message: 'Meeting task deleted successfully' });
}));

// @route   POST /api/meeting-tasks/:id/attendees
// @desc    Add an attendee to a meeting task
// @access  Private
router.post('/:id/attendees', authenticate, mustOwnMeetingTask(), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { userId } = req.body;
  
  if (!userId) {
    res.status(400).json({ error: 'User ID is required' });
    return;
  }

  // Verify the user exists
  const user = await User.findById(userId);
  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }

  await req.meetingTask!.addAttendee(userId);
  const updatedTask = await MeetingTask.findById(req.params['id']).populate('attendees', 'name email');
  
  res.status(200).json(updatedTask);
}));

// @route   POST /api/meeting-tasks/:id/action-items
// @desc    Add an action item to a meeting task
// @access  Private
router.post('/:id/action-items', authenticate, mustOwnMeetingTask(), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { item, assigneeId, dueDate } = req.body;
  
  if (!item || !assigneeId) {
    res.status(400).json({ error: 'Action item and assignee ID are required' });
    return;
  }

  // Verify the assignee exists
  const assignee = await User.findById(assigneeId);
  if (!assignee) {
    res.status(404).json({ error: 'Assignee not found' });
    return;
  }

  const dueDateObj = dueDate ? new Date(dueDate) : undefined;
  await req.meetingTask!.addActionItem(item, assigneeId, dueDateObj);
  const updatedTask = await MeetingTask.findById(req.params['id']).populate('actionItems.assignee', 'name email');
  
  res.status(200).json(updatedTask);
}));

// @route   POST /api/meeting-tasks/:id/action-items/:actionIndex/complete
// @desc    Complete an action item
// @access  Private
router.post('/:id/action-items/:actionIndex/complete', authenticate, mustOwnMeetingTask(), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const actionIndex = Number(req.params['actionIndex']);
  
  if (isNaN(actionIndex) || actionIndex < 0) {
    res.status(400).json({ error: 'Invalid action item index' });
    return;
  }

  await req.meetingTask!.completeActionItem(actionIndex);
  const updatedTask = await MeetingTask.findById(req.params['id']).populate('actionItems.assignee', 'name email');
  
  res.status(200).json(updatedTask);
}));

// @route   GET /api/meeting-tasks/:id/efficiency
// @desc    Get meeting efficiency metrics
// @access  Private
router.get('/:id/efficiency', authenticate, mustOwnMeetingTask(), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const task = req.meetingTask!;
  
  res.status(200).json({
    meetingEfficiency: task.meetingEfficiency,
    meetingDuration: task.meetingDuration,
    actualDuration: task.actualDuration,
    isHappeningNow: task.isHappeningNow,
    totalActionItems: task.actionItems.length,
    completedActionItems: task.actionItems.filter((item: any) => item.completed).length
  });
}));

// @route   GET /api/meeting-tasks/happening-now
// @desc    Get meetings happening now
// @access  Private
router.get('/happening-now', authenticate, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!._id;

  const happeningNow = await MeetingTask.find({
    assignee: userId,
    status: { $ne: 'completed' }
  })
    .populate('attendees', 'name email')
    .populate('actionItems.assignee', 'name email');

  const currentMeetings = happeningNow.filter(task => (task as any).isHappeningNow);

  res.status(200).json({
    currentMeetings,
    total: currentMeetings.length
  });
}));

// @route   GET /api/meeting-tasks/upcoming
// @desc    Get upcoming meetings
// @access  Private
router.get('/upcoming', authenticate, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!._id;
  const { days = 7 } = req.query;

  const endDate = new Date();
  endDate.setDate(endDate.getDate() + Number(days));

  const upcomingMeetings = await MeetingTask.find({
    assignee: userId,
    startDate: { $lte: endDate, $gte: new Date() },
    status: { $ne: 'completed' }
  })
    .sort({ startDate: 1 })
    .populate('attendees', 'name email');

  res.status(200).json({
    upcomingMeetings,
    period: `${days} days`,
    total: upcomingMeetings.length
  });
}));

// @route   GET /api/meeting-tasks/search/attendees
// @desc    Search meeting tasks by attendees
// @access  Private
router.get('/search/attendees', authenticate, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { attendeeName, page = 1, limit = 10 } = req.query;
  
  if (!attendeeName) {
    res.status(400).json({ error: 'Attendee name search term is required' });
    return;
  }

  const userId = req.user!._id;
  const skip = (Number(page) - 1) * Number(limit);

  // Find users matching the name
  const matchingUsers = await User.find({
    $or: [
      { name: { $regex: attendeeName, $options: 'i' } },
      { email: { $regex: attendeeName, $options: 'i' } }
    ]
  }).select('_id');

  const userIds = matchingUsers.map(user => user._id);

  const meetingTasks = await MeetingTask.find({
    assignee: userId,
    attendees: { $in: userIds }
  })
    .skip(skip)
    .limit(Number(limit))
    .sort({ startDate: 1 })
    .populate('attendees', 'name email');

  res.status(200).json({
    meetingTasks,
    searchTerm: attendeeName,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total: meetingTasks.length
    }
  });
}));

export default router;
