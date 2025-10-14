import { AxiosResponse } from 'axios';
import apiClient from './client';
import { ApiResponse, PaginatedResponse, BaseTask, TaskType } from '@/types';

// General Task specific types
export interface PersonalTask extends BaseTask {
  taskType: TaskType.PERSONAL;
  personalCategory: 'health' | 'fitness' | 'hobby' | 'learning' | 'travel' | 'family' | 'finance' | 'home' | 'other';
  isPrivate: boolean;
  personalNotes?: string;
  moodBefore?: string;
  moodAfter?: string;
  energyLevel?: 1 | 2 | 3 | 4 | 5;
  weatherDependent?: boolean;
  weatherCondition?: string;
  seasonality?: string[];
  personalGoals?: string[];
  reflection?: string;
  photos?: string[];
  cost?: number;
  actualCost?: number;
}

export interface HealthTask extends BaseTask {
  taskType: TaskType.HEALTH;
  healthCategory: 'exercise' | 'medical' | 'mental_health' | 'nutrition' | 'sleep' | 'prevention' | 'other';
  duration?: number; // in minutes
  intensity?: 'low' | 'medium' | 'high';
  healthMetrics?: {
    heartRate?: number;
    calories?: number;
    steps?: number;
    sleepHours?: number;
    weight?: number;
  };
  medicalInfo?: {
    doctor?: string;
    medication?: string;
    symptoms?: string[];
    notes?: string;
  };
}

export interface SocialTask extends BaseTask {
  taskType: TaskType.SOCIAL;
  socialCategory: 'networking' | 'event' | 'volunteer' | 'community' | 'family' | 'friends' | 'other';
  eventType?: 'party' | 'meeting' | 'conference' | 'workshop' | 'dinner' | 'activity' | 'other';
  attendees?: {
    name: string;
    relationship: string;
    contact?: string;
  }[];
  eventLocation?: {
    name: string;
    address?: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  socialGoals?: string[];
  networkingOpportunities?: string[];
}

export interface OtherTask extends BaseTask {
  taskType: TaskType.OTHER;
  customCategory?: string;
  customFields?: Record<string, unknown>;
}

export interface TaskStats {
  totalTasks: number;
  completedTasks: number;
  overdueTasks: number;
  averageCompletionTime: number;
  taskTypeBreakdown: { type: string; count: number }[];
  priorityBreakdown: { priority: string; count: number }[];
  monthlyTrends: {
    month: string;
    completed: number;
    created: number;
  }[];
  productivityScore: number;
}

export interface PersonalTaskStats {
  totalPersonalTasks: number;
  completedPersonalTasks: number;
  categoryBreakdown: { category: string; count: number }[];
  moodTracking: {
    averageMoodBefore: number;
    averageMoodAfter: number;
    moodImprovement: number;
  };
  energyLevels: { level: number; count: number }[];
  costAnalysis: {
    totalPlannedCost: number;
    totalActualCost: number;
    costVariance: number;
  };
  seasonalPatterns: { season: string; count: number }[];
}

export interface MoodTrackingData {
  date: string;
  tasksCompleted: number;
  averageMoodBefore: number;
  averageMoodAfter: number;
  moodImprovement: number;
  energyLevel: number;
  topCategories: string[];
}

export interface CategorySearchResult {
  category: string;
  description: string;
  commonTasks: string[];
  averageDuration: number;
  typicalGoals: string[];
}

// General Tasks API endpoints based on backend routes
export class TasksAPI {
  // @route   GET /api/tasks
  // @desc    Get all tasks for the authenticated user
  static async getAllTasks(params?: {
    taskType?: 'food' | 'homework' | 'email' | 'meeting' | 'project' | 'personal' | 'work' | 'health' | 'social' | 'other';
    status?: 'pending' | 'in_progress' | 'completed' | 'cancelled';
    priority?: 'low' | 'medium' | 'high' | 'urgent';
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<BaseTask>> {
    const queryParams = new URLSearchParams();
    
    if (params?.taskType) queryParams.append('taskType', params.taskType);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.priority) queryParams.append('priority', params.priority);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const response: AxiosResponse<PaginatedResponse<BaseTask>> = await apiClient.client.get(
      `/tasks?${queryParams.toString()}`
    );
    
    if (response.data.success) {
      return response.data;
    }
    throw new Error(response.data.message || 'Failed to fetch tasks');
  }

  // @route   GET /api/tasks/stats
  // @desc    Get overall task statistics
  static async getTaskStats(): Promise<TaskStats> {
    const response: AxiosResponse<ApiResponse<TaskStats>> = await apiClient.client.get('/tasks/stats');
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to fetch task stats');
  }

  // @route   POST /api/tasks
  // @desc    Create a new task
  static async createTask(taskData: {
    title: string;
    description?: string;
    taskType: 'food' | 'homework' | 'email' | 'meeting' | 'project' | 'personal' | 'work' | 'health' | 'social' | 'other';
    priority: 'low' | 'medium' | 'high' | 'urgent';
    dueDate?: string;
    startDate?: string;
    estimatedDuration?: number;
    tags?: string[];
    location?: string;
    isRecurring?: boolean;
    recurringPattern?: {
      frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
      interval: number;
      daysOfWeek?: number[];
      dayOfMonth?: number;
      endDate?: string;
    };
    // Personal task specific fields
    personalCategory?: 'health' | 'fitness' | 'hobby' | 'learning' | 'travel' | 'family' | 'finance' | 'home' | 'other';
    isPrivate?: boolean;
    personalNotes?: string;
    energyLevel?: 1 | 2 | 3 | 4 | 5;
    weatherDependent?: boolean;
    weatherCondition?: string;
    seasonality?: string[];
    personalGoals?: string[];
    cost?: number;
  }): Promise<BaseTask> {
    const response: AxiosResponse<ApiResponse<BaseTask>> = await apiClient.client.post('/tasks', taskData);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to create task');
  }

  // @route   GET /api/tasks/:taskType/:id
  // @desc    Get a specific task by type and ID
  static async getTask(taskType: string, taskId: string): Promise<BaseTask> {
    const response: AxiosResponse<ApiResponse<BaseTask>> = await apiClient.client.get(`/tasks/${taskType}/${taskId}`);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to fetch task');
  }

  // @route   PUT /api/tasks/:taskType/:id
  // @desc    Update a specific task by type and ID
  static async updateTask(taskType: string, taskId: string, taskData: Partial<BaseTask>): Promise<BaseTask> {
    const response: AxiosResponse<ApiResponse<BaseTask>> = await apiClient.client.put(`/tasks/${taskType}/${taskId}`, taskData);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to update task');
  }

  // @route   DELETE /api/tasks/:taskType/:id
  // @desc    Delete a specific task by type and ID
  static async deleteTask(taskType: string, taskId: string): Promise<void> {
    const response: AxiosResponse<ApiResponse> = await apiClient.client.delete(`/tasks/${taskType}/${taskId}`);
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to delete task');
    }
  }

  // @route   GET /api/tasks/:taskType
  // @desc    Get tasks by specific type
  static async getTasksByType(taskType: string, params?: {
    status?: 'pending' | 'in_progress' | 'completed' | 'cancelled';
    priority?: 'low' | 'medium' | 'high' | 'urgent';
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<BaseTask>> {
    const queryParams = new URLSearchParams();
    
    if (params?.status) queryParams.append('status', params.status);
    if (params?.priority) queryParams.append('priority', params.priority);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const response: AxiosResponse<PaginatedResponse<BaseTask>> = await apiClient.client.get(
      `/tasks/${taskType}?${queryParams.toString()}`
    );
    
    if (response.data.success) {
      return response.data;
    }
    throw new Error(response.data.message || `Failed to fetch ${taskType} tasks`);
  }

  // @route   GET /api/tasks/personal/stats
  // @desc    Get personal task statistics
  static async getPersonalTaskStats(): Promise<PersonalTaskStats> {
    const response: AxiosResponse<ApiResponse<PersonalTaskStats>> = await apiClient.client.get('/tasks/personal/stats');
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to fetch personal task stats');
  }

  // @route   GET /api/tasks/personal/search/category
  // @desc    Search for personal task categories
  static async searchPersonalCategories(query: string): Promise<CategorySearchResult[]> {
    const response: AxiosResponse<ApiResponse<CategorySearchResult[]>> = await apiClient.client.get(
      `/tasks/personal/search/category?q=${encodeURIComponent(query)}`
    );
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to search personal categories');
  }

  // @route   GET /api/tasks/personal/mood-tracking
  // @desc    Get mood tracking data for personal tasks
  static async getMoodTrackingData(params?: {
    startDate?: string;
    endDate?: string;
    groupBy?: 'day' | 'week' | 'month';
  }): Promise<MoodTrackingData[]> {
    const queryParams = new URLSearchParams();
    
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);
    if (params?.groupBy) queryParams.append('groupBy', params.groupBy);

    const response: AxiosResponse<ApiResponse<MoodTrackingData[]>> = await apiClient.client.get(
      `/tasks/personal/mood-tracking?${queryParams.toString()}`
    );
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to fetch mood tracking data');
  }
}

export default TasksAPI;
