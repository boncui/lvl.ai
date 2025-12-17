import { Router, Request, Response, NextFunction } from 'express';
import { query, validationResult } from 'express-validator';
import { PipelineStage } from 'mongoose';
import authenticate from '../middleware/auth';
import Task from '@/models/Task';

const router = Router();

type LeaderboardEntry = {
  userId: string;
  name: string;
  email: string;
  avatar?: string;
  level?: number;
  xp?: number;
  points: number;
  totalTasks: number;
  window: number | 'all';
};

// @route   GET /api/leaderboard
// @desc    Task leaderboard by completed task points in window
// @access  Private
router.get(
  '/',
  authenticate,
  [
    query('window').optional().isIn(['7', '30', 'all']).withMessage('window must be 7, 30, or all'),
  ],
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ success: false, errors: errors.array() });
        return;
      }

      const windowParam = (req.query['window'] as string) || '7';

      const windowValue = windowParam === 'all' ? 'all' : Number(windowParam) || 7;
      const now = new Date();
      const startDate = windowValue === 'all' ? undefined : new Date(now.getTime() - windowValue * 24 * 60 * 60 * 1000);

      const match: Record<string, unknown> = { status: 'completed' };
      if (startDate) {
        match['completedAt'] = { $gte: startDate };
      }

      const pipeline: PipelineStage[] = [
        { $match: match },
        {
          $group: {
            _id: '$userId',
            points: { $sum: '$points' },
            totalTasks: { $sum: 1 },
          },
        },
        { $sort: { points: -1, totalTasks: -1 } },
        { $limit: 50 },
        {
          $lookup: {
            from: 'users',
            localField: '_id',
            foreignField: '_id',
            as: 'user',
          },
        },
        { $unwind: '$user' },
        {
          $project: {
            userId: '$_id',
            name: '$user.name',
            email: '$user.email',
            avatar: '$user.avatar',
            level: '$user.level',
            xp: '$user.xp',
            points: 1,
            totalTasks: 1,
          },
        },
      ];

      const results = (await Task.aggregate(pipeline)) as LeaderboardEntry[];
      const data = results.map((entry, idx) => ({
        ...entry,
        rank: idx + 1,
        window: windowValue,
      }));

      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
