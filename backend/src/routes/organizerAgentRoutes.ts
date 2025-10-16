import { Router, Request, Response } from 'express';
import organizerAgent from '../ai/agents/organizerAgent';
import authenticate from '../middleware/auth';
import { body, validationResult } from 'express-validator';

const router = Router();

// Type for authenticated request
interface AuthenticatedRequest extends Request {
  user?: {
    _id: string;
    email: string;
    name: string;
  };
}

// ---------- VALIDATION MIDDLEWARE ----------

const chatValidation = [
  body('message')
    .trim()
    .notEmpty()
    .withMessage('Message is required')
    .isLength({ max: 1000 })
    .withMessage('Message cannot exceed 1000 characters'),
];

// ---------- ROUTES ----------

/**
 * @route   POST /api/organizer/chat
 * @desc    Chat with the organizer agent
 * @access  Private
 */
router.post(
  '/chat',
  authenticate,
  chatValidation,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      // Validate input
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          success: false, 
          errors: errors.array() 
        });
      }

      const userId = req.user?._id;
      const { message, temperature, maxTokens, provider } = req.body;

      if (!userId) {
        return res.status(401).json({ 
          success: false, 
          message: 'User not authenticated' 
        });
      }

      // Chat with organizer
      const options: { temperature?: number; maxTokens?: number; provider?: any } = {};
      if (temperature) options.temperature = parseFloat(temperature);
      if (maxTokens) options.maxTokens = parseInt(maxTokens);
      if (provider) options.provider = provider;
      
      const response = await organizerAgent.chatWithOrganizer(
        userId,
        message,
        Object.keys(options).length > 0 ? options : undefined
      );

      return res.json({
        success: true,
        response,
        metadata: {
          userId,
          timestamp: new Date(),
          model: 'deepseek/deepseek-chat',
        },
      });
    } catch (error) {
      console.error('Organizer chat error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to get response from organizer',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
);

/**
 * @route   GET /api/organizer/suggestions
 * @desc    Get task organization suggestions
 * @access  Private
 */
router.get(
  '/suggestions',
  authenticate,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?._id;

      if (!userId) {
        return res.status(401).json({ 
          success: false, 
          message: 'User not authenticated' 
        });
      }

      const suggestions = await organizerAgent.getOrganizationSuggestions(userId);

      return res.json({
        success: true,
        suggestions,
        metadata: {
          userId,
          timestamp: new Date(),
          type: 'organization_suggestions',
        },
      });
    } catch (error) {
      console.error('Error getting suggestions:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to get organization suggestions',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
);

/**
 * @route   GET /api/organizer/daily-plan
 * @desc    Get daily task plan
 * @access  Private
 */
router.get(
  '/daily-plan',
  authenticate,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?._id;

      if (!userId) {
        return res.status(401).json({ 
          success: false, 
          message: 'User not authenticated' 
        });
      }

      const plan = await organizerAgent.getDailyTaskPlan(userId);

      return res.json({
        success: true,
        plan,
        metadata: {
          userId,
          timestamp: new Date(),
          type: 'daily_plan',
          date: new Date().toISOString().split('T')[0],
        },
      });
    } catch (error) {
      console.error('Error getting daily plan:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to get daily plan',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
);

/**
 * @route   GET /api/organizer/productivity-analysis
 * @desc    Analyze productivity patterns
 * @access  Private
 */
router.get(
  '/productivity-analysis',
  authenticate,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?._id;

      if (!userId) {
        return res.status(401).json({ 
          success: false, 
          message: 'User not authenticated' 
        });
      }

      const analysis = await organizerAgent.analyzeProductivity(userId);

      return res.json({
        success: true,
        analysis,
        metadata: {
          userId,
          timestamp: new Date(),
          type: 'productivity_analysis',
        },
      });
    } catch (error) {
      console.error('Error analyzing productivity:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to analyze productivity',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
);

/**
 * @route   GET /api/organizer/motivation
 * @desc    Get motivational message
 * @access  Private
 */
router.get(
  '/motivation',
  authenticate,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?._id;

      if (!userId) {
        return res.status(401).json({ 
          success: false, 
          message: 'User not authenticated' 
        });
      }

      const motivation = await organizerAgent.getMotivation(userId);

      return res.json({
        success: true,
        motivation,
        metadata: {
          userId,
          timestamp: new Date(),
          type: 'motivation',
        },
      });
    } catch (error) {
      console.error('Error getting motivation:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to get motivation',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
);

/**
 * @route   GET /api/organizer/context
 * @desc    Get user context (for debugging/testing)
 * @access  Private
 */
router.get(
  '/context',
  authenticate,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?._id;

      if (!userId) {
        return res.status(401).json({ 
          success: false, 
          message: 'User not authenticated' 
        });
      }

      const context = await organizerAgent.retrieveCompleteContext(userId);

      return res.json({
        success: true,
        context,
        formattedContext: organizerAgent.formatContextForPrompt(context),
      });
    } catch (error) {
      console.error('Error getting context:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to get context',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
);

/**
 * @route   GET /api/organizer/test-provider
 * @desc    Test AI provider connectivity
 * @access  Private
 */
router.get(
  '/test-provider',
  authenticate,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { provider } = req.query;
      
      const testResult = await organizerAgent.testAIProvider(provider as any);
      
      return res.json({
        success: true,
        testResult,
        metadata: {
          timestamp: new Date(),
          type: 'provider_test',
        },
      });
    } catch (error) {
      console.error('Error testing provider:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to test AI provider',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
);

/**
 * @route   GET /api/organizer/health
 * @desc    Check organizer agent health
 * @access  Public
 */
router.get('/health', (_req: Request, res: Response) => {
  const health = {
    status: 'healthy',
    timestamp: new Date(),
    service: 'organizer-agent',
    model: 'deepseek-chat',
    providers: {
      langchain: !!process.env['DEEPSEEK_API_KEY'],
      openrouter: !!process.env['OPENROUTER_API_KEY'],
    },
    features: [
      'chat',
      'organization-suggestions',
      'daily-plan',
      'productivity-analysis',
      'motivation',
      'provider-test',
      'enhanced-langchain-functions',
    ],
  };

  return res.json(health);
});

export default router;

