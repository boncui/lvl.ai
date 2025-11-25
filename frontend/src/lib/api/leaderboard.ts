import apiClient from './client';
import { LeaderboardEntry, LeaderboardMetric, LeaderboardWindow } from '@/lib/types';

export interface LeaderboardParams {
  window?: LeaderboardWindow;
  metric?: LeaderboardMetric;
}

export class LeaderboardAPI {
  static async getLeaderboard(params: LeaderboardParams = {}): Promise<LeaderboardEntry[]> {
    const query = new URLSearchParams();
    if (params.window) query.append('window', params.window.toString());
    if (params.metric) query.append('metric', params.metric);

    const url = query.toString() ? `/leaderboard?${query.toString()}` : '/leaderboard';
    const response = await apiClient.client.get<{ success: boolean; data: LeaderboardEntry[] }>(url);
    if (response.data.success) {
      return response.data.data;
    }
    throw new Error('Failed to fetch leaderboard');
  }
}

export default LeaderboardAPI;
