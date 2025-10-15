import express, { NextFunction, Request, Response, Router, RequestHandler } from 'express';
import { check, validationResult } from 'express-validator';
import authenticate, { AuthenticatedRequest } from '../middleware/auth';
import ProjectTask from '../models/ProjectTask';
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

// Middleware to ensure user owns the project task
const mustOwnProjectTask = (): RequestHandler =>
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const taskId = req.params['id'];
    
    try {
      const task = await ProjectTask.findById(taskId);
      
      if (!task) {
        res.status(404).json({ error: 'Project task not found' });
        return;
      }

      if (String(task.assignee) !== String(req.user._id)) {
        res.status(403).json({ error: 'You can only modify your own project tasks' });
        return;
      }

      req.projectTask = task;
      next();
    } catch (error) {
      res.status(400).json({ error: 'Invalid project task ID' });
    }
  };

// Project task validation
const projectTaskValidation = [
  check('title')
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ min: 1, max: 200 })
    .withMessage('Title must be between 1 and 200 characters'),
  check('projectName')
    .notEmpty()
    .withMessage('Project name is required')
    .isLength({ min: 1, max: 100 })
    .withMessage('Project name must be between 1 and 100 characters'),
  check('projectPhase')
    .notEmpty()
    .withMessage('Project phase is required')
    .isIn(['planning', 'development', 'testing', 'deployment', 'maintenance', 'completed', 'cancelled'])
    .withMessage('Invalid project phase'),
  check('projectType')
    .optional()
    .isIn(['personal', 'work', 'open_source', 'client_project', 'internal_tool', 'other'])
    .withMessage('Invalid project type'),
  check('teamMembers')
    .optional()
    .isArray()
    .withMessage('Team members must be an array'),
  check('budget')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Budget must be a non-negative number'),
  check('actualCost')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Actual cost must be a non-negative number'),
  check('projectStatus')
    .optional()
    .isIn(['on_track', 'at_risk', 'delayed', 'completed', 'cancelled'])
    .withMessage('Invalid project status'),
  check('repositoryLink')
    .optional()
    .isURL()
    .withMessage('Repository link must be a valid URL'),
  check('liveUrl')
    .optional()
    .isURL()
    .withMessage('Live URL must be a valid URL'),
  check('clientName')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Client name must be less than 100 characters'),
  check('clientContact')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Client contact must be less than 100 characters')
];

const router: Router = express.Router();

// ========================= PROJECT TASK ROUTES =========================

// @route   GET /api/project-tasks
// @desc    Get all project tasks for authenticated user
// @access  Private
router.get('/', authenticate, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!._id;
  const { projectPhase, projectType, projectStatus, page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

  const query: any = { assignee: userId };
  
  if (projectPhase) query.projectPhase = projectPhase;
  if (projectType) query.projectType = projectType;
  if (projectStatus) query.projectStatus = projectStatus;

  const skip = (Number(page) - 1) * Number(limit);
  const sortOptions: any = {};
  sortOptions[sortBy as string] = sortOrder === 'desc' ? -1 : 1;

  const projectTasks = await ProjectTask.find(query)
    .skip(skip)
    .limit(Number(limit))
    .sort(sortOptions)
    .populate('assignee', 'name email')
    .populate('teamMembers', 'name email')
    .populate('dependencies', 'title projectName projectPhase');

  const total = await ProjectTask.countDocuments(query);

  res.status(200).json({
    projectTasks,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / Number(limit))
    }
  });
}));

// @route   GET /api/project-tasks/stats
// @desc    Get project task statistics
// @access  Private
router.get('/stats', authenticate, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!._id;
  const { period = '30' } = req.query; // days

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - Number(period));

  const projectTasks = await ProjectTask.find({
    assignee: userId,
    createdAt: { $gte: startDate }
  });

  const stats = {
    totalProjectTasks: projectTasks.length,
    byProjectPhase: {
      planning: projectTasks.filter(t => t.projectPhase === 'planning').length,
      development: projectTasks.filter(t => t.projectPhase === 'development').length,
      testing: projectTasks.filter(t => t.projectPhase === 'testing').length,
      deployment: projectTasks.filter(t => t.projectPhase === 'deployment').length,
      maintenance: projectTasks.filter(t => t.projectPhase === 'maintenance').length,
      completed: projectTasks.filter(t => t.projectPhase === 'completed').length
    },
    byProjectType: {
      web_app: projectTasks.filter(t => t.projectType === 'web_app').length,
      mobile_app: projectTasks.filter(t => t.projectType === 'mobile_app').length,
      desktop_app: projectTasks.filter(t => t.projectType === 'desktop_app').length,
      api: projectTasks.filter(t => t.projectType === 'api').length,
      database: projectTasks.filter(t => t.projectType === 'database').length,
      infrastructure: projectTasks.filter(t => t.projectType === 'infrastructure').length,
      research: projectTasks.filter(t => t.projectType === 'research').length,
      other: projectTasks.filter(t => t.projectType === 'other').length
    },
    byProjectStatus: {
      on_track: projectTasks.filter(t => t.projectStatus === 'on_track').length,
      at_risk: projectTasks.filter(t => t.projectStatus === 'at_risk').length,
      delayed: projectTasks.filter(t => t.projectStatus === 'delayed').length,
      cancelled: projectTasks.filter(t => t.projectStatus === 'cancelled').length
    },
    totalBudget: projectTasks.reduce((sum, t) => sum + (t.budget || 0), 0),
    totalActualCost: projectTasks.reduce((sum, t) => sum + (t.actualCost || 0), 0),
    averageBudget: projectTasks.length > 0 
      ? Math.round(projectTasks.reduce((sum, t) => sum + (t.budget || 0), 0) / projectTasks.length)
      : 0,
    totalMilestones: projectTasks.reduce((sum, t) => sum + t.milestones.length, 0),
    completedMilestones: projectTasks.reduce((sum, t) => 
      sum + t.milestones.filter(m => m.completed).length, 0),
    overdueMilestones: projectTasks.reduce((sum, t) => 
      sum + t.milestones.filter(m => m.dueDate < new Date() && !m.completed).length, 0)
  };

  res.status(200).json(stats);
}));

// @route   POST /api/project-tasks
// @desc    Create a new project task
// @access  Private
router.post('/', authenticate, projectTaskValidation, handleValidationErrors, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const projectTask = new ProjectTask({
    ...req.body,
    assignee: req.user!._id,
    taskType: 'project'
  });

  await projectTask.save();
  res.status(201).json(projectTask);
}));

// @route   GET /api/project-tasks/:id
// @desc    Get a specific project task
// @access  Private
router.get('/:id', authenticate, mustOwnProjectTask(), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  res.status(200).json(req.projectTask);
}));

// @route   PUT /api/project-tasks/:id
// @desc    Update a specific project task
// @access  Private
router.put('/:id', authenticate, mustOwnProjectTask(), projectTaskValidation, handleValidationErrors, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const updatedProjectTask = await ProjectTask.findByIdAndUpdate(
    req.params['id'],
    { ...req.body },
    { new: true, runValidators: true }
  );

  res.status(200).json(updatedProjectTask);
}));

// @route   DELETE /api/project-tasks/:id
// @desc    Delete a specific project task
// @access  Private
router.delete('/:id', authenticate, mustOwnProjectTask(), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  await ProjectTask.findByIdAndDelete(req.params['id']);
  res.status(200).json({ message: 'Project task deleted successfully' });
}));

// @route   POST /api/project-tasks/:id/milestones
// @desc    Add a milestone to a project task
// @access  Private
router.post('/:id/milestones', authenticate, mustOwnProjectTask(), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { name, dueDate } = req.body;
  
  if (!name || !dueDate) {
    res.status(400).json({ error: 'Milestone name and due date are required' });
    return;
  }

  const dueDateObj = new Date(dueDate);
  if (isNaN(dueDateObj.getTime())) {
    res.status(400).json({ error: 'Invalid due date format' });
    return;
  }

  await req.projectTask!.addMilestone(name, dueDateObj);
  const updatedTask = await ProjectTask.findById(req.params['id']);
  
  res.status(200).json(updatedTask);
}));

// @route   POST /api/project-tasks/:id/milestones/:milestoneIndex/complete
// @desc    Complete a milestone
// @access  Private
router.post('/:id/milestones/:milestoneIndex/complete', authenticate, mustOwnProjectTask(), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const milestoneIndex = Number(req.params['milestoneIndex']);
  
  if (isNaN(milestoneIndex) || milestoneIndex < 0) {
    res.status(400).json({ error: 'Invalid milestone index' });
    return;
  }

  await req.projectTask!.completeMilestone(milestoneIndex);
  const updatedTask = await ProjectTask.findById(req.params['id']);
  
  res.status(200).json(updatedTask);
}));

// @route   POST /api/project-tasks/:id/team-members
// @desc    Add a team member to a project task
// @access  Private
router.post('/:id/team-members', authenticate, mustOwnProjectTask(), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
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

  await req.projectTask!.addTeamMember(userId);
  const updatedTask = await ProjectTask.findById(req.params['id']).populate('teamMembers', 'name email');
  
  res.status(200).json(updatedTask);
}));

// @route   POST /api/project-tasks/:id/dependencies
// @desc    Add a dependency to a project task
// @access  Private
router.post('/:id/dependencies', authenticate, mustOwnProjectTask(), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { dependencyId } = req.body;
  
  if (!dependencyId) {
    res.status(400).json({ error: 'Dependency ID is required' });
    return;
  }

  // Verify the dependency exists
  const dependency = await ProjectTask.findById(dependencyId);
  if (!dependency) {
    res.status(404).json({ error: 'Dependency project not found' });
    return;
  }

  await req.projectTask!.addDependency(dependencyId);
  const updatedTask = await ProjectTask.findById(req.params['id']).populate('dependencies', 'title projectName projectPhase');
  
  res.status(200).json(updatedTask);
}));

// @route   GET /api/project-tasks/:id/progress
// @desc    Get project progress metrics
// @access  Private
router.get('/:id/progress', authenticate, mustOwnProjectTask(), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const task = req.projectTask!;
  
  res.status(200).json({
    projectProgress: task.projectProgress,
    totalMilestones: task.milestones.length,
    completedMilestones: task.milestones.filter((m: any) => m.completed).length,
    overdueMilestones: task.milestones.filter((m: any) => m.dueDate < new Date() && !m.completed).length,
    budgetUtilization: task.budgetUtilization,
    isOverdue: task.isOverdue,
    projectStatus: task.projectStatus
  });
}));

// @route   GET /api/project-tasks/search/projects
// @desc    Search project tasks by project name
// @access  Private
router.get('/search/projects', authenticate, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { projectName, page = 1, limit = 10 } = req.query;
  
  if (!projectName) {
    res.status(400).json({ error: 'Project name search term is required' });
    return;
  }

  const userId = req.user!._id;
  const skip = (Number(page) - 1) * Number(limit);

  const projectTasks = await ProjectTask.find({
    assignee: userId,
    projectName: { $regex: projectName, $options: 'i' }
  })
    .skip(skip)
    .limit(Number(limit))
    .sort({ createdAt: -1 })
    .populate('teamMembers', 'name email');

  res.status(200).json({
    projectTasks,
    searchTerm: projectName,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total: projectTasks.length
    }
  });
}));

// @route   GET /api/project-tasks/overdue-milestones
// @desc    Get projects with overdue milestones
// @access  Private
router.get('/overdue-milestones', authenticate, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!._id;

  const projectsWithOverdueMilestones = await ProjectTask.find({
    assignee: userId,
    'milestones.dueDate': { $lt: new Date() },
    'milestones.completed': false,
    projectPhase: { $ne: 'completed' }
  })
    .populate('teamMembers', 'name email');

  res.status(200).json({
    projectsWithOverdueMilestones,
    total: projectsWithOverdueMilestones.length
  });
}));

export default router;
