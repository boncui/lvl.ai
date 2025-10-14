import { AxiosResponse } from 'axios';
import apiClient from './client';
import { ApiResponse, PaginatedResponse, BaseTask, TaskType } from '@/lib/types';

// Homework Task specific types
export interface HomeworkTask extends BaseTask {
  taskType: TaskType.HOMEWORK;
  subject: string;
  assignmentType: 'essay' | 'project' | 'quiz' | 'exam' | 'reading' | 'problem_set' | 'lab' | 'presentation' | 'other';
  difficulty: 'easy' | 'medium' | 'hard';
  estimatedStudyTime: number; // in minutes
  actualStudyTime?: number; // in minutes
  materials: {
    name: string;
    type: 'textbook' | 'article' | 'video' | 'website' | 'document' | 'other';
    url?: string;
    notes?: string;
  }[];
  groupMembers?: string[]; // User IDs
  grade?: number;
  feedback?: string;
  studySessions?: {
    startTime: string;
    endTime: string;
    duration: number; // in minutes
    efficiency: number; // 1-5 scale
    notes?: string;
  }[];
  aiSuggestions?: {
    studyMethod: string;
    timeEstimate: number;
    resources: string[];
    confidence: number;
  }[];
}

export interface HomeworkTaskStats {
  totalTasks: number;
  completedTasks: number;
  averageStudyTime: number;
  averageGrade: number;
  subjectBreakdown: { subject: string; count: number }[];
  assignmentTypeBreakdown: { type: string; count: number }[];
  studyEfficiency: {
    averageEfficiency: number;
    totalStudyTime: number;
    productiveHours: number;
  };
}

export interface StudyEfficiency {
  overallEfficiency: number;
  averageSessionLength: number;
  peakStudyHours: string[];
  recommendations: string[];
  productivityScore: number;
}

export interface SubjectSearchResult {
  name: string;
  commonAssignments: string[];
  averageDifficulty: number;
  typicalStudyTime: number;
}

// Homework Tasks API endpoints based on backend routes
export class HomeworkTasksAPI {
  // @route   GET /api/homework-tasks
  // @desc    Get all homework tasks for the authenticated user
  static async getHomeworkTasks(params?: {
    subject?: string;
    assignmentType?: 'essay' | 'project' | 'quiz' | 'exam' | 'reading' | 'problem_set' | 'lab' | 'presentation' | 'other';
    status?: 'pending' | 'in_progress' | 'completed' | 'cancelled';
    difficulty?: 'easy' | 'medium' | 'hard';
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<HomeworkTask>> {
    const queryParams = new URLSearchParams();
    
    if (params?.subject) queryParams.append('subject', params.subject);
    if (params?.assignmentType) queryParams.append('assignmentType', params.assignmentType);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.difficulty) queryParams.append('difficulty', params.difficulty);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const response: AxiosResponse<PaginatedResponse<HomeworkTask>> = await apiClient.client.get(
      `/homework-tasks?${queryParams.toString()}`
    );
    
    if (response.data.success) {
      return response.data;
    }
    throw new Error(response.data.message || 'Failed to fetch homework tasks');
  }

  // @route   GET /api/homework-tasks/stats
  // @desc    Get homework task statistics
  static async getHomeworkTaskStats(): Promise<HomeworkTaskStats> {
    const response: AxiosResponse<ApiResponse<HomeworkTaskStats>> = await apiClient.client.get('/homework-tasks/stats');
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to fetch homework task stats');
  }

  // @route   POST /api/homework-tasks
  // @desc    Create a new homework task
  static async createHomeworkTask(taskData: {
    title: string;
    description?: string;
    subject: string;
    assignmentType: 'essay' | 'project' | 'quiz' | 'exam' | 'reading' | 'problem_set' | 'lab' | 'presentation' | 'other';
    difficulty: 'easy' | 'medium' | 'hard';
    estimatedStudyTime: number;
    dueDate: string;
    priority?: 'low' | 'medium' | 'high' | 'urgent';
    tags?: string[];
  }): Promise<HomeworkTask> {
    const response: AxiosResponse<ApiResponse<HomeworkTask>> = await apiClient.client.post('/homework-tasks', taskData);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to create homework task');
  }

  // @route   GET /api/homework-tasks/:id
  // @desc    Get a specific homework task
  static async getHomeworkTask(taskId: string): Promise<HomeworkTask> {
    const response: AxiosResponse<ApiResponse<HomeworkTask>> = await apiClient.client.get(`/homework-tasks/${taskId}`);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to fetch homework task');
  }

  // @route   PUT /api/homework-tasks/:id
  // @desc    Update a homework task
  static async updateHomeworkTask(taskId: string, taskData: {
    title?: string;
    description?: string;
    subject?: string;
    assignmentType?: 'essay' | 'project' | 'quiz' | 'exam' | 'reading' | 'problem_set' | 'lab' | 'presentation' | 'other';
    difficulty?: 'easy' | 'medium' | 'hard';
    estimatedStudyTime?: number;
    dueDate?: string;
    priority?: 'low' | 'medium' | 'high' | 'urgent';
    tags?: string[];
    status?: 'pending' | 'in_progress' | 'completed' | 'cancelled';
    grade?: number;
    feedback?: string;
  }): Promise<HomeworkTask> {
    const response: AxiosResponse<ApiResponse<HomeworkTask>> = await apiClient.client.put(`/homework-tasks/${taskId}`, taskData);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to update homework task');
  }

  // @route   DELETE /api/homework-tasks/:id
  // @desc    Delete a homework task
  static async deleteHomeworkTask(taskId: string): Promise<void> {
    const response: AxiosResponse<ApiResponse> = await apiClient.client.delete(`/homework-tasks/${taskId}`);
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to delete homework task');
    }
  }

  // @route   POST /api/homework-tasks/:id/materials
  // @desc    Add materials to a homework task
  static async addMaterials(taskId: string, materials: {
    name: string;
    type: 'textbook' | 'article' | 'video' | 'website' | 'document' | 'other';
    url?: string;
    notes?: string;
  }[]): Promise<HomeworkTask> {
    const response: AxiosResponse<ApiResponse<HomeworkTask>> = await apiClient.client.post(
      `/homework-tasks/${taskId}/materials`,
      { materials }
    );
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to add materials');
  }

  // @route   POST /api/homework-tasks/:id/group-members
  // @desc    Add group members to a homework task
  static async addGroupMembers(taskId: string, memberIds: string[]): Promise<HomeworkTask> {
    const response: AxiosResponse<ApiResponse<HomeworkTask>> = await apiClient.client.post(
      `/homework-tasks/${taskId}/group-members`,
      { memberIds }
    );
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to add group members');
  }

  // @route   PUT /api/homework-tasks/:id/study-time
  // @desc    Update study time for a homework task
  static async updateStudyTime(taskId: string, studyData: {
    actualStudyTime?: number;
    studySession?: {
      startTime: string;
      endTime: string;
      duration: number;
      efficiency: number;
      notes?: string;
    };
  }): Promise<HomeworkTask> {
    const response: AxiosResponse<ApiResponse<HomeworkTask>> = await apiClient.client.put(
      `/homework-tasks/${taskId}/study-time`,
      studyData
    );
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to update study time');
  }

  // @route   GET /api/homework-tasks/:id/study-efficiency
  // @desc    Get study efficiency analysis for a homework task
  static async getStudyEfficiency(taskId: string): Promise<StudyEfficiency> {
    const response: AxiosResponse<ApiResponse<StudyEfficiency>> = await apiClient.client.get(
      `/homework-tasks/${taskId}/study-efficiency`
    );
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to fetch study efficiency');
  }

  // @route   GET /api/homework-tasks/search/subjects
  // @desc    Search for subjects
  static async searchSubjects(query: string): Promise<SubjectSearchResult[]> {
    const response: AxiosResponse<ApiResponse<SubjectSearchResult[]>> = await apiClient.client.get(
      `/homework-tasks/search/subjects?q=${encodeURIComponent(query)}`
    );
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to search subjects');
  }

  // @route   GET /api/homework-tasks/upcoming
  // @desc    Get upcoming homework tasks
  static async getUpcomingTasks(days?: number): Promise<HomeworkTask[]> {
    const queryParams = new URLSearchParams();
    if (days) queryParams.append('days', days.toString());

    const response: AxiosResponse<ApiResponse<HomeworkTask[]>> = await apiClient.client.get(
      `/homework-tasks/upcoming?${queryParams.toString()}`
    );
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to fetch upcoming tasks');
  }
}

export default HomeworkTasksAPI;
