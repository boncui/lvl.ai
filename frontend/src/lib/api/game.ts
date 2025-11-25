import apiClient from './client';

export class GameAPI {
  static async submitTimeKillerScore(score: number, durationMs: number) {
    const response = await apiClient.client.post('/game/timekiller/score', { score, durationMs });
    if (response.data.success) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to submit score');
  }
}

export default GameAPI;
