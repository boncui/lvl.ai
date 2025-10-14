import { Router } from 'express';
import { body, param, query } from 'express-validator';
import {
  getUsers,
  getUser,
  getMyProfile,
  createUser,
  updateUser,
  updateMyProfile,
  deleteUser,
  getUserTasks,
  addUserTask,
  updateUserTask,
  deleteUserTask,
  getUserMetrics,
  addUserMetric,
  getUserLevels
} from '../controllers/userController';
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
], getUsers);

// @route   GET /api/users/profile/me
// @desc    Get current user profile
// @access  Private
router.get('/profile/me', authenticate, getMyProfile);

// @route   GET /api/users/:id
// @desc    Get single user
// @access  Private/Admin
router.get('/:id', authenticate, authorize('admin'), [
  param('id').isMongoId().withMessage('Please provide a valid user ID')
], getUser);

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
], createUser);

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
], updateMyProfile);

// @route   PUT /api/users/:id
// @desc    Update user
// @access  Private/Admin
router.put('/:id', authenticate, authorize('admin'), [
  param('id').isMongoId().withMessage('Please provide a valid user ID'),
  body('name').optional().notEmpty().withMessage('Name cannot be empty').isLength({ max: 50 }).withMessage('Name cannot exceed 50 characters'),
  body('email').optional().isEmail().withMessage('Please provide a valid email'),
  body('avatar').optional().isURL().withMessage('Avatar must be a valid URL')
], updateUser);

// @route   DELETE /api/users/:id
// @desc    Delete user
// @access  Private/Admin
router.delete('/:id', authenticate, authorize('admin'), [
  param('id').isMongoId().withMessage('Please provide a valid user ID')
], deleteUser);

// @route   GET /api/users/:id/tasks
// @desc    Get user tasks
// @access  Private
router.get('/:id/tasks', authenticate, [
  param('id').isMongoId().withMessage('Please provide a valid user ID'),
  query('category').optional().isIn(['Fitness', 'Productivity', 'Nutrition', 'Finance', 'Social', 'Knowledge']).withMessage('Invalid category'),
  query('completed').optional().isBoolean().withMessage('Completed must be boolean'),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
], getUserTasks);

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
], addUserTask);

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
], updateUserTask);

// @route   DELETE /api/users/:id/tasks/:taskId
// @desc    Delete user task
// @access  Private
router.delete('/:id/tasks/:taskId', authenticate, [
  param('id').isMongoId().withMessage('Please provide a valid user ID'),
  param('taskId').isMongoId().withMessage('Please provide a valid task ID')
], deleteUserTask);

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
], getUserMetrics);

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
], addUserMetric);

// @route   GET /api/users/:id/levels
// @desc    Get user levels
// @access  Private
router.get('/:id/levels', authenticate, [
  param('id').isMongoId().withMessage('Please provide a valid user ID')
], getUserLevels);

export default router;
