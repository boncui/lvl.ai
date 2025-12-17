import { Router, Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';
import authenticate from '../middleware/auth';
import GameRun from '@/models/GameRun';

const router = Router();

// @route   POST /api/game/timekiller/score
// @desc    Submit a time killer game score
// @access  Private
router.post(
  '/timekiller/score',
  authenticate,
  [
    body('score').isInt({ min: 0 }).withMessage('score must be a non-negative integer'),
    body('durationMs').isInt({ min: 0 }).withMessage('durationMs must be non-negative'),
  ],
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ success: false, errors: errors.array() });
        return;
      }

      const userId = (req as any).user['id'];
      const { score, durationMs } = req.body;

      const run = await GameRun.create({ userId, score, durationMs });

      res.status(201).json({
        success: true,
        data: {
          id: run._id,
          score: run.score,
          durationMs: run.durationMs,
          createdAt: run.createdAt,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
