import { AxiosResponse } from 'axios';
import apiClient from './client';
import { ApiResponse, PaginatedResponse, BaseTask, TaskType } from '@/types';

// Work Task specific types
export interface WorkTask extends BaseTask {
  taskType: TaskType.WORK;
  workCategory: 'development' | 'design' | 'marketing' | 'sales' | 'support' | 'management' | 'research' | 'other';
  complexity: 'simple' | 'moderate' | 'complex' | 'very_complex';
  estimatedHours: number;
  actualHours?: number;
  client?: {
    name: string;
    email?: string;
    organization?: string;
  };
  project?: {
    name: string;
    code?: string;
    description?: string;
  };
  deliverables: {
    name: string;
    description?: string;
    status: 'pending' | 'in_progress' | 'completed';
    dueDate?: string;
  }[];
  technologies?: string[];
  tools?: string[];
  deadline: string;
  billingInfo?: {
    billable: boolean;
    hourlyRate?: number;
    totalAmount?: number;
    currency?: string;
  };
  timeTracking?: {
    sessions: {
      startTime: string;
      endTime: string;
      duration: number; // in minutes
      description?: string;
    }[];
    totalTime: number; // in minutes
  };
  qualityMetrics?: {
    codeQuality?: number; // 1-5 scale
    designQuality?: number; // 1-5 scale
    clientSatisfaction?: number; // 1-5 scale
    onTimeDelivery: boolean;
  };
}

export interface WorkTaskStats {
  totalTasks: number;
  completedTasks: number;
  averageHours: number;
  billableHours: number;
  workCategoryBreakdown: { category: string; count: number }[];
  clientBreakdown: { client: string; count: number }[];
  averageCompletionTime: number;
  onTimeDeliveryRate: number;
  qualityScore: number;
}

// Work Tasks API endpoints based on backend routes
export class WorkTasksAPI {
  // @route   GET /api/work-tasks
  // @desc    Get all work tasks for the authenticated user
  static async getWorkTasks(params?: {
    workCategory?: 'development' | 'design' | 'marketing' | 'sales' | 'support' | 'management' | 'research' | 'other';
    status?: 'pending' | 'in_progress' | 'review' | 'completed' | 'cancelled';
    priority?: 'low' | 'medium' | 'high' | 'urgent';
    complexity?: 'simple' | 'moderate' | 'complex' | 'very_complex';
    client?: string;
    project?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<WorkTask>> {
    const queryParams = new URLSearchParams();
    
    if (params?.workCategory) queryParams.append('workCategory', params.workCategory);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.priority) queryParams.append('priority', params.priority);
    if (params?.complexity) queryParams.append('complexity', params.complexity);
    if (params?.client) queryParams.append('client', params.client);
    if (params?.project) queryParams.append('project', params.project);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const response: AxiosResponse<PaginatedResponse<WorkTask>> = await apiClient.client.get(
      `/work-tasks?${queryParams.toString()}`
    );
    
    if (response.data.success) {
      return response.data;
    }
    throw new Error(response.data.message || 'Failed to fetch work tasks');
  }

  // @route   GET /api/work-tasks/stats
  // @desc    Get work task statistics
  static async getWorkTaskStats(): Promise<WorkTaskStats> {
    const response: AxiosResponse<ApiResponse<WorkTaskStats>> = await apiClient.client.get('/work-tasks/stats');
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to fetch work task stats');
  }

  // @route   POST /api/work-tasks
  // @desc    Create a new work task
  static async createWorkTask(taskData: {
    title: string;
    description?: string;
    workCategory: 'development' | 'design' | 'marketing' | 'sales' | 'support' | 'management' | 'research' | 'other';
    priority: 'low' | 'medium' | 'high' | 'urgent';
    complexity: 'simple' | 'moderate' | 'complex' | 'very_complex';
    estimatedHours: number;
    deadline: string;
    client?: {
      name: string;
      email?: string;
      organization?: string;
    };
    project?: {
      name: string;
      code?: string;
      description?: string;
    };
    deliverables?: {
      name: string;
      description?: string;
      dueDate?: string;
    }[];
    technologies?: string[];
    tools?: string[];
    billingInfo?: {
      billable: boolean;
      hourlyRate?: number;
      currency?: string;
    };
    tags?: string[];
  }): Promise<WorkTask> {
    const response: AxiosResponse<ApiResponse<WorkTask>> = await apiClient.client.post('/work-tasks', taskData);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to create work task');
  }

  // @route   GET /api/work-tasks/:id
  // @desc    Get a specific work task
  static async getWorkTask(taskId: string): Promise<WorkTask> {
    const response: AxiosResponse<ApiResponse<WorkTask>> = await apiClient.client.get(`/work-tasks/${taskId}`);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to fetch work task');
  }

  // @route   PUT /api/work-tasks/:id
  // @desc    Update a work task
  static async updateWorkTask(taskId: string, taskData: {
    title?: string;
    description?: string;
    workCategory?: 'development' | 'design' | 'marketing' | 'sales' | 'support' | 'management' | 'research' | 'other';
    priority?: 'low' | 'medium' | 'high' | 'urgent';
    complexity?: 'simple' | 'moderate' | 'complex' | 'very_complex';
    estimatedHours?: number;
    actualHours?: number;
    deadline?: string;
    client?: {
      name: string;
      email?: string;
      organization?: string;
    };
    project?: {
      name: string;
      code?: string;
      description?: string;
    };
    deliverables?: {
      name: string;
      description?: string;
      status: 'pending' | 'in_progress' | 'completed';
      dueDate?: string;
    }[];
    technologies?: string[];
    tools?: string[];
    status?: 'pending' | 'in_progress' | 'review' | 'completed' | 'cancelled';
    billingInfo?: {
      billable: boolean;
      hourlyRate?: number;
      totalAmount?: number;
      currency?: string;
    };
    qualityMetrics?: {
      codeQuality?: number;
      designQuality?: number;
      clientSatisfaction?: number;
      onTimeDelivery: boolean;
    };
    tags?: string[];
  }): Promise<WorkTask> {
    const response: AxiosResponse<ApiResponse<WorkTask>> = await apiClient.client.put(`/work-tasks/${taskId}`, taskData);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to update work task');
  }

  // @route   DELETE /api/work-tasks/:id
  // @desc    Delete a work task
  static async deleteWorkTask(taskId: string): Promise<void> {
    const response: AxiosResponse<ApiResponse> = await apiClient.client.delete(`/work-tasks/${taskId}`);
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to delete work task');
    }
  }
}

export default WorkTasksAPI;
