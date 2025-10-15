import express, { NextFunction, Request, Response, Router, RequestHandler } from 'express';
import { check, validationResult } from 'express-validator';
import authenticate, { AuthenticatedRequest } from '../middleware/auth';
import FoodTask from '../models/FoodTask';

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

// Middleware to ensure user owns the food task
const mustOwnFoodTask = (): RequestHandler =>
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const taskId = req.params['id'];
    
    try {
      const task = await FoodTask.findById(taskId);
      
      if (!task) {
        res.status(404).json({ error: 'Food task not found' });
        return;
      }

      if (String(task.assignee) !== String(req.user._id)) {
        res.status(403).json({ error: 'You can only modify your own food tasks' });
        return;
      }

      req.foodTask = task;
      next();
    } catch (error) {
      res.status(400).json({ error: 'Invalid food task ID' });
    }
  };

// Food task validation
const foodTaskValidation = [
  check('title')
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ min: 1, max: 200 })
    .withMessage('Title must be between 1 and 200 characters'),
  check('foodName')
    .notEmpty()
    .withMessage('Food name is required')
    .isLength({ min: 1, max: 100 })
    .withMessage('Food name must be between 1 and 100 characters'),
  check('category')
    .notEmpty()
    .withMessage('Food category is required')
    .isIn(['Breakfast', 'Lunch', 'Dinner', 'Snack', 'Drink'])
    .withMessage('Invalid food category'),
  check('calories')
    .notEmpty()
    .withMessage('Calories are required')
    .isInt({ min: 0 })
    .withMessage('Calories must be a non-negative integer'),
  check('protein')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Protein must be a non-negative number'),
  check('carbs')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Carbs must be a non-negative number'),
  check('fats')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Fats must be a non-negative number'),
  check('sugar')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Sugar must be a non-negative number'),
  check('fiber')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Fiber must be a non-negative number'),
  check('cost')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Cost must be a non-negative number'),
  check('cookTime')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Cook time must be a non-negative integer'),
  check('healthRating')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Health rating must be between 1 and 5'),
  check('ingredients')
    .optional()
    .isArray()
    .withMessage('Ingredients must be an array'),
  check('moodAfterEating')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Mood description must be less than 100 characters'),
  check('source')
    .optional()
    .isLength({ max: 50 })
    .withMessage('Source must be less than 50 characters')
];

const router: Router = express.Router();

// ========================= FOOD TASK ROUTES =========================

// @route   GET /api/food-tasks
// @desc    Get all food tasks for authenticated user
// @access  Private
router.get('/', authenticate, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!._id;
  const { category, healthRating, page = 1, limit = 10, sortBy = 'loggedAt', sortOrder = 'desc' } = req.query;

  const query: any = { assignee: userId };
  
  if (category) query.category = category;
  if (healthRating) query.healthRating = Number(healthRating);

  const skip = (Number(page) - 1) * Number(limit);
  const sortOptions: any = {};
  sortOptions[sortBy as string] = sortOrder === 'desc' ? -1 : 1;

  const foodTasks = await FoodTask.find(query)
    .skip(skip)
    .limit(Number(limit))
    .sort(sortOptions)
    .populate('assignee', 'name email');

  const total = await FoodTask.countDocuments(query);

  res.status(200).json({
    foodTasks,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / Number(limit))
    }
  });
}));

// @route   GET /api/food-tasks/stats
// @desc    Get food task statistics
// @access  Private
router.get('/stats', authenticate, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!._id;
  const { period = '30' } = req.query; // days

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - Number(period));

  const foodTasks = await FoodTask.find({
    assignee: userId,
    loggedAt: { $gte: startDate }
  });

  const stats = {
    totalFoodTasks: foodTasks.length,
    byCategory: {
      Breakfast: foodTasks.filter(t => t.category === 'Breakfast').length,
      Lunch: foodTasks.filter(t => t.category === 'Lunch').length,
      Dinner: foodTasks.filter(t => t.category === 'Dinner').length,
      Snack: foodTasks.filter(t => t.category === 'Snack').length,
      Drink: foodTasks.filter(t => t.category === 'Drink').length
    },
    byHealthRating: {
      1: foodTasks.filter(t => t.healthRating === 1).length,
      2: foodTasks.filter(t => t.healthRating === 2).length,
      3: foodTasks.filter(t => t.healthRating === 3).length,
      4: foodTasks.filter(t => t.healthRating === 4).length,
      5: foodTasks.filter(t => t.healthRating === 5).length
    },
    averageCalories: foodTasks.length > 0 
      ? Math.round(foodTasks.reduce((sum, t) => sum + t.calories, 0) / foodTasks.length)
      : 0,
    averageProtein: foodTasks.length > 0 
      ? Math.round(foodTasks.reduce((sum, t) => sum + (t.protein || 0), 0) / foodTasks.length)
      : 0,
    averageCarbs: foodTasks.length > 0 
      ? Math.round(foodTasks.reduce((sum, t) => sum + (t.carbs || 0), 0) / foodTasks.length)
      : 0,
    averageFats: foodTasks.length > 0 
      ? Math.round(foodTasks.reduce((sum, t) => sum + (t.fats || 0), 0) / foodTasks.length)
      : 0,
    totalCost: foodTasks.reduce((sum, t) => sum + (t.cost || 0), 0),
    healthyMeals: foodTasks.filter(t => t.healthRating && t.healthRating >= 3).length,
    unhealthyMeals: foodTasks.filter(t => t.healthRating && t.healthRating < 3).length
  };

  res.status(200).json(stats);
}));

// @route   POST /api/food-tasks
// @desc    Create a new food task
// @access  Private
router.post('/', authenticate, foodTaskValidation, handleValidationErrors, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const foodTask = new FoodTask({
    ...req.body,
    assignee: req.user!._id,
    taskType: 'food'
  });

  await foodTask.save();
  res.status(201).json(foodTask);
}));

// @route   GET /api/food-tasks/:id
// @desc    Get a specific food task
// @access  Private
router.get('/:id', authenticate, mustOwnFoodTask(), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  res.status(200).json(req.foodTask);
}));

// @route   PUT /api/food-tasks/:id
// @desc    Update a specific food task
// @access  Private
router.put('/:id', authenticate, mustOwnFoodTask(), foodTaskValidation, handleValidationErrors, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const updatedFoodTask = await FoodTask.findByIdAndUpdate(
    req.params['id'],
    { ...req.body },
    { new: true, runValidators: true }
  );

  res.status(200).json(updatedFoodTask);
}));

// @route   DELETE /api/food-tasks/:id
// @desc    Delete a specific food task
// @access  Private
router.delete('/:id', authenticate, mustOwnFoodTask(), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  await FoodTask.findByIdAndDelete(req.params['id']);
  res.status(200).json({ message: 'Food task deleted successfully' });
}));

// @route   POST /api/food-tasks/:id/ingredients
// @desc    Add an ingredient to a food task
// @access  Private
router.post('/:id/ingredients', authenticate, mustOwnFoodTask(), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { ingredient } = req.body;
  
  if (!ingredient || typeof ingredient !== 'string') {
    res.status(400).json({ error: 'Valid ingredient is required' });
    return;
  }

  await req.foodTask!.addIngredient(ingredient);
  const updatedTask = await FoodTask.findById(req.params['id']);
  
  res.status(200).json(updatedTask);
}));

// @route   PUT /api/food-tasks/:id/ai-suggestions
// @desc    Update AI suggestions for a food task
// @access  Private
router.put('/:id/ai-suggestions', authenticate, mustOwnFoodTask(), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { substitute, tip } = req.body;
  
  await req.foodTask!.updateAISuggestions(substitute, tip);
  const updatedTask = await FoodTask.findById(req.params['id']);
  
  res.status(200).json(updatedTask);
}));

// @route   GET /api/food-tasks/:id/nutritional-density
// @desc    Get nutritional density for a food task
// @access  Private
router.get('/:id/nutritional-density', authenticate, mustOwnFoodTask(), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const density = req.foodTask!.getNutritionalDensity();
  
  res.status(200).json({ 
    nutritionalDensity: density,
    calories: req.foodTask!.calories,
    totalMacros: req.foodTask!.totalMacros
  });
}));

// @route   GET /api/food-tasks/search/ingredients
// @desc    Search food tasks by ingredients
// @access  Private
router.get('/search/ingredients', authenticate, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { ingredient, page = 1, limit = 10 } = req.query;
  
  if (!ingredient) {
    res.status(400).json({ error: 'Ingredient search term is required' });
    return;
  }

  const userId = req.user!._id;
  const skip = (Number(page) - 1) * Number(limit);

  const foodTasks = await FoodTask.find({
    assignee: userId,
    ingredients: { $regex: ingredient, $options: 'i' }
  })
    .skip(skip)
    .limit(Number(limit))
    .sort({ loggedAt: -1 });

  res.status(200).json({
    foodTasks,
    searchTerm: ingredient,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total: foodTasks.length
    }
  });
}));

export default router;
