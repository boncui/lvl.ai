export type LeaderboardMetric = 'points';
export type LeaderboardWindow = 7 | 30 | 'all';

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  name: string;
  email: string;
  avatar?: string;
  level?: number;
  xp?: number;
  points: number;
  totalTasks: number;
  window: LeaderboardWindow;
}
