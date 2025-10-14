import { AxiosResponse } from 'axios';
import apiClient from './client';
import { ApiResponse, PaginatedResponse, BaseTask, TaskType } from '@/types';

// Project Task specific types
export interface ProjectTask extends BaseTask {
  taskType: TaskType.PROJECT;
  projectType: 'software' | 'research' | 'marketing' | 'design' | 'business' | 'personal' | 'other';
  projectStatus: 'planning' | 'in_progress' | 'on_hold' | 'completed' | 'cancelled';
  complexity: 'simple' | 'moderate' | 'complex' | 'very_complex';
  estimatedHours: number;
  actualHours?: number;
  milestones: {
    name: string;
    description?: string;
    dueDate: string;
    completed: boolean;
    completedDate?: string;
    deliverables: string[];
  }[];
  teamMembers: {
    userId: string;
    name: string;
    email: string;
    role: string;
    responsibilities: string[];
    hoursAllocated?: number;
  }[];
  dependencies: {
    taskId: string;
    taskTitle: string;
    dependencyType: 'blocks' | 'blocked_by' | 'related';
    status: 'pending' | 'completed';
  }[];
  budget?: {
    allocated: number;
    spent: number;
    currency: string;
  };
  resources: {
    name: string;
    type: 'tool' | 'software' | 'hardware' | 'service' | 'other';
    cost?: number;
    url?: string;
    description?: string;
  }[];
  progress: {
    overallProgress: number; // percentage
    milestoneProgress: number; // percentage
    timeProgress: number; // percentage
    lastUpdated: string;
  };
  risks: {
    description: string;
    impact: 'low' | 'medium' | 'high';
    probability: 'low' | 'medium' | 'high';
    mitigation: string;
    status: 'open' | 'mitigated' | 'closed';
  }[];
}

export interface ProjectTaskStats {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  averageDuration: number;
  averageBudget: number;
  projectTypeBreakdown: { type: string; count: number }[];
  teamSizeBreakdown: { size: string; count: number }[];
  milestoneCompletionRate: number;
  budgetUtilizationRate: number;
}

export interface ProjectProgress {
  overallProgress: number;
  milestoneProgress: number;
  timeProgress: number;
  budgetProgress: number;
  teamUtilization: number;
  riskLevel: 'low' | 'medium' | 'high';
  nextMilestone?: {
    name: string;
    dueDate: string;
    daysRemaining: number;
  };
  overdueItems: string[];
}

export interface ProjectSearchResult {
  name: string;
  description: string;
  projectType: string;
  averageDuration: number;
  typicalTeamSize: number;
  commonTechnologies: string[];
}

// Project Tasks API endpoints based on backend routes
export class ProjectTasksAPI {
  // @route   GET /api/project-tasks
  // @desc    Get all project tasks for the authenticated user
  static async getProjectTasks(params?: {
    projectType?: 'software' | 'research' | 'marketing' | 'design' | 'business' | 'personal' | 'other';
    projectStatus?: 'planning' | 'in_progress' | 'on_hold' | 'completed' | 'cancelled';
    priority?: 'low' | 'medium' | 'high' | 'urgent';
    complexity?: 'simple' | 'moderate' | 'complex' | 'very_complex';
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<ProjectTask>> {
    const queryParams = new URLSearchParams();
    
    if (params?.projectType) queryParams.append('projectType', params.projectType);
    if (params?.projectStatus) queryParams.append('projectStatus', params.projectStatus);
    if (params?.priority) queryParams.append('priority', params.priority);
    if (params?.complexity) queryParams.append('complexity', params.complexity);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const response: AxiosResponse<PaginatedResponse<ProjectTask>> = await apiClient.client.get(
      `/project-tasks?${queryParams.toString()}`
    );
    
    if (response.data.success) {
      return response.data;
    }
    throw new Error(response.data.message || 'Failed to fetch project tasks');
  }

  // @route   GET /api/project-tasks/stats
  // @desc    Get project task statistics
  static async getProjectTaskStats(): Promise<ProjectTaskStats> {
    const response: AxiosResponse<ApiResponse<ProjectTaskStats>> = await apiClient.client.get('/project-tasks/stats');
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to fetch project task stats');
  }

  // @route   POST /api/project-tasks
  // @desc    Create a new project task
  static async createProjectTask(taskData: {
    title: string;
    description?: string;
    projectType: 'software' | 'research' | 'marketing' | 'design' | 'business' | 'personal' | 'other';
    projectStatus: 'planning' | 'in_progress' | 'on_hold' | 'completed' | 'cancelled';
    priority: 'low' | 'medium' | 'high' | 'urgent';
    complexity: 'simple' | 'moderate' | 'complex' | 'very_complex';
    estimatedHours: number;
    startDate: string;
    endDate: string;
    budget?: {
      allocated: number;
      currency: string;
    };
    tags?: string[];
  }): Promise<ProjectTask> {
    const response: AxiosResponse<ApiResponse<ProjectTask>> = await apiClient.client.post('/project-tasks', taskData);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to create project task');
  }

  // @route   GET /api/project-tasks/:id
  // @desc    Get a specific project task
  static async getProjectTask(taskId: string): Promise<ProjectTask> {
    const response: AxiosResponse<ApiResponse<ProjectTask>> = await apiClient.client.get(`/project-tasks/${taskId}`);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to fetch project task');
  }

  // @route   PUT /api/project-tasks/:id
  // @desc    Update a project task
  static async updateProjectTask(taskId: string, taskData: {
    title?: string;
    description?: string;
    projectType?: 'software' | 'research' | 'marketing' | 'design' | 'business' | 'personal' | 'other';
    projectStatus?: 'planning' | 'in_progress' | 'on_hold' | 'completed' | 'cancelled';
    priority?: 'low' | 'medium' | 'high' | 'urgent';
    complexity?: 'simple' | 'moderate' | 'complex' | 'very_complex';
    estimatedHours?: number;
    actualHours?: number;
    startDate?: string;
    endDate?: string;
    budget?: {
      allocated: number;
      spent: number;
      currency: string;
    };
    tags?: string[];
  }): Promise<ProjectTask> {
    const response: AxiosResponse<ApiResponse<ProjectTask>> = await apiClient.client.put(`/project-tasks/${taskId}`, taskData);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to update project task');
  }

  // @route   DELETE /api/project-tasks/:id
  // @desc    Delete a project task
  static async deleteProjectTask(taskId: string): Promise<void> {
    const response: AxiosResponse<ApiResponse> = await apiClient.client.delete(`/project-tasks/${taskId}`);
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to delete project task');
    }
  }

  // @route   POST /api/project-tasks/:id/milestones
  // @desc    Add milestones to a project task
  static async addMilestones(taskId: string, milestones: {
    name: string;
    description?: string;
    dueDate: string;
    deliverables: string[];
  }[]): Promise<ProjectTask> {
    const response: AxiosResponse<ApiResponse<ProjectTask>> = await apiClient.client.post(
      `/project-tasks/${taskId}/milestones`,
      { milestones }
    );
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to add milestones');
  }

  // @route   POST /api/project-tasks/:id/milestones/:milestoneIndex/complete
  // @desc    Mark a milestone as complete
  static async completeMilestone(taskId: string, milestoneIndex: number): Promise<ProjectTask> {
    const response: AxiosResponse<ApiResponse<ProjectTask>> = await apiClient.client.post(
      `/project-tasks/${taskId}/milestones/${milestoneIndex}/complete`
    );
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to complete milestone');
  }

  // @route   POST /api/project-tasks/:id/team-members
  // @desc    Add team members to a project task
  static async addTeamMembers(taskId: string, teamMembers: {
    userId: string;
    name: string;
    email: string;
    role: string;
    responsibilities: string[];
    hoursAllocated?: number;
  }[]): Promise<ProjectTask> {
    const response: AxiosResponse<ApiResponse<ProjectTask>> = await apiClient.client.post(
      `/project-tasks/${taskId}/team-members`,
      { teamMembers }
    );
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to add team members');
  }

  // @route   POST /api/project-tasks/:id/dependencies
  // @desc    Add dependencies to a project task
  static async addDependencies(taskId: string, dependencies: {
    taskId: string;
    taskTitle: string;
    dependencyType: 'blocks' | 'blocked_by' | 'related';
  }[]): Promise<ProjectTask> {
    const response: AxiosResponse<ApiResponse<ProjectTask>> = await apiClient.client.post(
      `/project-tasks/${taskId}/dependencies`,
      { dependencies }
    );
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to add dependencies');
  }

  // @route   GET /api/project-tasks/:id/progress
  // @desc    Get project progress analysis
  static async getProjectProgress(taskId: string): Promise<ProjectProgress> {
    const response: AxiosResponse<ApiResponse<ProjectProgress>> = await apiClient.client.get(
      `/project-tasks/${taskId}/progress`
    );
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to fetch project progress');
  }

  // @route   GET /api/project-tasks/search/projects
  // @desc    Search for project templates or examples
  static async searchProjects(query: string): Promise<ProjectSearchResult[]> {
    const response: AxiosResponse<ApiResponse<ProjectSearchResult[]>> = await apiClient.client.get(
      `/project-tasks/search/projects?q=${encodeURIComponent(query)}`
    );
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to search projects');
  }

  // @route   GET /api/project-tasks/overdue-milestones
  // @desc    Get projects with overdue milestones
  static async getOverdueMilestones(): Promise<ProjectTask[]> {
    const response: AxiosResponse<ApiResponse<ProjectTask[]>> = await apiClient.client.get('/project-tasks/overdue-milestones');
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to fetch overdue milestones');
  }
}

export default ProjectTasksAPI;
