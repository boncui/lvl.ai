import { AxiosResponse } from 'axios';
import apiClient from './client';
import { BaseTask } from '@/lib/types';

// Health Task specific types
export interface HealthTask extends BaseTask {
  taskType: 'health';
  healthCategory: 'exercise' | 'medical' | 'mental_health' | 'nutrition' | 'sleep';
  mood?: string;
  energyLevel?: number; // 1-5 scale
  painLevel?: number; // 1-10 scale
  healthNotes?: string;
  sleepDuration?: number; // in hours
  sleepQuality?: number; // 1-5 scale
  duration?: number; // exercise duration in minutes
  intensity?: 'low' | 'medium' | 'high';
  heartRate?: number;
  bloodPressure?: {
    systolic: number;
    diastolic: number;
  };
  weight?: number;
  bodyFat?: number;
  medications?: string[];
  symptoms?: string[];
}

export interface HealthTaskStats {
  totalTasks: number;
  byCategory: Record<string, number>;
  byStatus: Record<string, number>;
  byPriority: Record<string, number>;
  totalXP: number;
  overdue: number;
  healthMetrics: {
    averageEnergyLevel: number;
    averagePainLevel: number;
    totalSleepHours: number;
    totalExerciseMinutes: number;
    averageSleepQuality: number;
  };
}

// Health Tasks API endpoints based on backend routes
export class HealthTasksAPI {
  // @route   GET /api/health-tasks
  // @desc    Get all health tasks
  static async getHealthTasks(params?: {
    healthCategory?: 'exercise' | 'medical' | 'mental_health' | 'nutrition' | 'sleep';
    priority?: 'low' | 'medium' | 'high' | 'urgent';
    status?: 'pending' | 'in_progress' | 'completed' | 'cancelled';
    mood?: string;
    page?: number;
    limit?: number;
  }): Promise<{ success: boolean; count: number; total: number; page: number; pages: number; data: HealthTask[] }> {
    const queryParams = new URLSearchParams();
    
    if (params?.healthCategory) queryParams.append('healthCategory', params.healthCategory);
    if (params?.priority) queryParams.append('priority', params.priority);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.mood) queryParams.append('mood', params.mood);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const response: AxiosResponse<{ success: boolean; count: number; total: number; page: number; pages: number; data: HealthTask[] }> = await apiClient.client.get(
      `/health-tasks?${queryParams.toString()}`
    );
    
    return response.data;
  }

  // @route   GET /api/health-tasks/stats
  // @desc    Get health task statistics
  static async getHealthTaskStats(period?: number): Promise<HealthTaskStats> {
    const params = new URLSearchParams();
    if (period) params.append('period', period.toString());

    const response: AxiosResponse<{ success: boolean; data: HealthTaskStats }> = await apiClient.client.get(`/health-tasks/stats?${params.toString()}`);
    return response.data.data;
  }

  // @route   POST /api/health-tasks
  // @desc    Create new health task
  static async createHealthTask(taskData: {
    title: string;
    healthCategory: 'exercise' | 'medical' | 'mental_health' | 'nutrition' | 'sleep';
    priority?: 'low' | 'medium' | 'high' | 'urgent';
    estimatedDuration?: number;
    mood?: string;
    energyLevel?: number;
    painLevel?: number;
    healthNotes?: string;
    sleepDuration?: number;
    sleepQuality?: number;
    duration?: number;
    intensity?: 'low' | 'medium' | 'high';
    heartRate?: number;
    bloodPressure?: {
      systolic: number;
      diastolic: number;
    };
    weight?: number;
    bodyFat?: number;
    medications?: string[];
    symptoms?: string[];
  }): Promise<HealthTask> {
    const response: AxiosResponse<{ success: boolean; data: HealthTask }> = await apiClient.client.post('/health-tasks', taskData);
    return response.data.data;
  }

  // @route   GET /api/health-tasks/:id
  // @desc    Get single health task
  static async getHealthTask(taskId: string): Promise<HealthTask> {
    const response: AxiosResponse<{ success: boolean; data: HealthTask }> = await apiClient.client.get(`/health-tasks/${taskId}`);
    return response.data.data;
  }

  // @route   PUT /api/health-tasks/:id
  // @desc    Update health task
  static async updateHealthTask(taskId: string, taskData: Partial<{
    title: string;
    healthCategory: 'exercise' | 'medical' | 'mental_health' | 'nutrition' | 'sleep';
    priority: 'low' | 'medium' | 'high' | 'urgent';
    estimatedDuration: number;
    mood: string;
    energyLevel: number;
    painLevel: number;
    healthNotes: string;
    sleepDuration: number;
    sleepQuality: number;
    duration: number;
    intensity: 'low' | 'medium' | 'high';
    heartRate: number;
    bloodPressure: {
      systolic: number;
      diastolic: number;
    };
    weight: number;
    bodyFat: number;
    medications: string[];
    symptoms: string[];
  }>): Promise<HealthTask> {
    const response: AxiosResponse<{ success: boolean; data: HealthTask }> = await apiClient.client.put(`/health-tasks/${taskId}`, taskData);
    return response.data.data;
  }

  // @route   DELETE /api/health-tasks/:id
  // @desc    Delete health task
  static async deleteHealthTask(taskId: string): Promise<{ message: string }> {
    const response: AxiosResponse<{ success: boolean; message: string }> = await apiClient.client.delete(`/health-tasks/${taskId}`);
    return response.data;
  }

  // @route   POST /api/health-tasks/:id/notes
  // @desc    Add note to health task
  static async addNote(taskId: string, content: string): Promise<any[]> {
    const response: AxiosResponse<{ success: boolean; data: any[] }> = await apiClient.client.post(`/health-tasks/${taskId}/notes`, { content });
    return response.data.data;
  }

  // @route   POST /api/health-tasks/:id/reminders
  // @desc    Add reminder to health task
  static async addReminder(taskId: string, date: string, message: string): Promise<any[]> {
    const response: AxiosResponse<{ success: boolean; data: any[] }> = await apiClient.client.post(`/health-tasks/${taskId}/reminders`, { date, message });
    return response.data.data;
  }

  // @route   GET /api/health-tasks/overdue
  // @desc    Get overdue health tasks
  static async getOverdueTasks(): Promise<HealthTask[]> {
    const response: AxiosResponse<{ success: boolean; count: number; data: HealthTask[] }> = await apiClient.client.get('/health-tasks/overdue');
    return response.data.data;
  }
}

export default HealthTasksAPI;
