// Task API Client - Aligned with backend taskRoutes.ts
import apiClient from './client';
import type {
  ITask,
  CreateTaskDTO,
  UpdateTaskDTO,
} from '@/lib/types';
import { TaskPriority, TaskStatus } from '@/lib/types';

// ---------- TYPES ----------

export interface TaskFilters {
  status?: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  tag?: string;
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'updatedAt' | 'dueDate' | 'taskTime' | 'priority' | 'points';
  sortOrder?: 'asc' | 'desc';
}

export interface TasksResponse {
  success: boolean;
  count: number;
  total: number;
  page: number;
  pages: number;
  data: ITask[];
}

export interface TaskResponse {
  success: boolean;
  data: ITask;
}

export interface TaskStatsResponse {
  success: boolean;
  data: {
    totalTasks: number;
    byStatus: Record<string, number>;
    byPriority: Record<string, number>;
    totalPoints: number;
    earnedPoints: number;
    overdue: number;
  };
}

export interface TaskCompleteResponse {
  success: boolean;
  data: ITask;
  message: string;
}

export interface TaskDeleteResponse {
  success: boolean;
  message: string;
}

// ---------- API FUNCTIONS ----------

/**
 * GET /api/tasks
 * Get all tasks for user with filtering, pagination, and sorting
 * @access Private
 */
export const getAllTasks = async (filters?: TaskFilters): Promise<TasksResponse> => {
  const params = new URLSearchParams();
  
  if (filters) {
    if (filters.status) params.append('status', filters.status);
    if (filters.priority) params.append('priority', filters.priority);
    if (filters.tag) params.append('tag', filters.tag);
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);
  }

  const queryString = params.toString();
  const url = queryString ? `/tasks?${queryString}` : '/tasks';
  
  const response = await apiClient.client.get<TasksResponse>(url);
  return response.data;
};

/**
 * GET /api/tasks/stats
 * Get task statistics
 * @param period - Number of days to look back (default: 30)
 * @access Private
 */
export const getTaskStats = async (period?: number): Promise<TaskStatsResponse> => {
  const url = period ? `/tasks/stats?period=${period}` : '/tasks/stats';
  const response = await apiClient.client.get<TaskStatsResponse>(url);
  return response.data;
};

/**
 * POST /api/tasks
 * Create new task
 * @access Private
 */
export const createTask = async (taskData: CreateTaskDTO): Promise<TaskResponse> => {
  const response = await apiClient.client.post<TaskResponse>('/tasks', taskData);
  return response.data;
};

/**
 * GET /api/tasks/:id
 * Get single task by ID
 * @access Private
 */
export const getTaskById = async (id: string): Promise<TaskResponse> => {
  const response = await apiClient.client.get<TaskResponse>(`/tasks/${id}`);
  return response.data;
};

/**
 * PUT /api/tasks/:id
 * Update task
 * @access Private
 */
export const updateTask = async (
  id: string,
  taskData: UpdateTaskDTO
): Promise<TaskResponse> => {
  const response = await apiClient.client.put<TaskResponse>(`/tasks/${id}`, taskData);
  return response.data;
};

/**
 * DELETE /api/tasks/:id
 * Delete task
 * @access Private
 */
export const deleteTask = async (id: string): Promise<TaskDeleteResponse> => {
  const response = await apiClient.client.delete<TaskDeleteResponse>(`/tasks/${id}`);
  return response.data;
};

/**
 * GET /api/tasks/filter/upcoming
 * Get upcoming tasks (sorted by taskTime or dueDate)
 * Returns tasks with status != completed and taskTime or dueDate >= now
 * Limited to 20 results
 * @access Private
 */
export const getUpcomingTasks = async (): Promise<TasksResponse> => {
  const response = await apiClient.client.get<TasksResponse>('/tasks/filter/upcoming');
  return response.data;
};

/**
 * GET /api/tasks/filter/overdue
 * Get overdue tasks
 * Returns tasks with dueDate < now and status != completed
 * Sorted by dueDate ascending
 * @access Private
 */
export const getOverdueTasks = async (): Promise<TasksResponse> => {
  const response = await apiClient.client.get<TasksResponse>('/tasks/filter/overdue');
  return response.data;
};

/**
 * POST /api/tasks/:id/complete
 * Mark task as complete
 * Automatically awards XP and increments totalTasksCompleted
 * @access Private
 */
export const completeTask = async (id: string): Promise<TaskCompleteResponse> => {
  const response = await apiClient.client.post<TaskCompleteResponse>(
    `/tasks/${id}/complete`,
    {}
  );
  return response.data;
};

// ---------- CONVENIENCE METHODS ----------

/**
 * Get tasks filtered by status
 */
export const getTasksByStatus = async (
  status: TaskStatus
): Promise<TasksResponse> => {
  return getAllTasks({ status });
};

/**
 * Get tasks filtered by priority
 */
export const getTasksByPriority = async (
  priority: TaskPriority
): Promise<TasksResponse> => {
  return getAllTasks({ priority });
};

/**
 * Get tasks filtered by tag
 */
export const getTasksByTag = async (tag: string): Promise<TasksResponse> => {
  return getAllTasks({ tag });
};

/**
 * Get pending tasks
 */
export const getPendingTasks = async (): Promise<TasksResponse> => {
  return getTasksByStatus(TaskStatus.PENDING);
};

/**
 * Get in-progress tasks
 */
export const getInProgressTasks = async (): Promise<TasksResponse> => {
  return getTasksByStatus(TaskStatus.IN_PROGRESS);
};

/**
 * Get completed tasks
 */
export const getCompletedTasks = async (): Promise<TasksResponse> => {
  return getTasksByStatus(TaskStatus.COMPLETED);
};

/**
 * Get cancelled tasks
 */
export const getCancelledTasks = async (): Promise<TasksResponse> => {
  return getTasksByStatus(TaskStatus.CANCELLED);
};

/**
 * Search tasks (client-side filter)
 * Searches in title, description, and tags
 */
export const searchTasks = (tasks: ITask[], query: string): ITask[] => {
  if (!query.trim()) return tasks;
  
  const lowerQuery = query.toLowerCase().trim();
  return tasks.filter(
    (task) =>
      task.title.toLowerCase().includes(lowerQuery) ||
      task.description?.toLowerCase().includes(lowerQuery) ||
      task.tags.some((tag) => tag.toLowerCase().includes(lowerQuery))
  );
};

/**
 * Filter tasks by multiple tags (AND operation)
 */
export const filterTasksByTags = (tasks: ITask[], tags: string[]): ITask[] => {
  if (tags.length === 0) return tasks;
  
  return tasks.filter((task) =>
    tags.every((tag) =>
      task.tags.some((t) => t.toLowerCase() === tag.toLowerCase())
    )
  );
};

/**
 * Filter tasks by date range
 */
export const filterTasksByDateRange = (
  tasks: ITask[],
  startDate?: Date,
  endDate?: Date
): ITask[] => {
  return tasks.filter((task) => {
    if (!task.dueDate) return false;
    
    const dueDate = new Date(task.dueDate);
    
    if (startDate && dueDate < startDate) return false;
    if (endDate && dueDate > endDate) return false;
    
    return true;
  });
};

/**
 * Sort tasks by field
 */
export const sortTasks = (
  tasks: ITask[],
  sortBy: TaskFilters['sortBy'] = 'createdAt',
  sortOrder: 'asc' | 'desc' = 'desc'
): ITask[] => {
  return [...tasks].sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case 'createdAt':
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        break;
      case 'updatedAt':
        comparison = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
        break;
      case 'dueDate':
        if (!a.dueDate && !b.dueDate) comparison = 0;
        else if (!a.dueDate) comparison = 1;
        else if (!b.dueDate) comparison = -1;
        else comparison = new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        break;
      case 'taskTime':
        if (!a.taskTime && !b.taskTime) comparison = 0;
        else if (!a.taskTime) comparison = 1;
        else if (!b.taskTime) comparison = -1;
        else comparison = new Date(a.taskTime).getTime() - new Date(b.taskTime).getTime();
        break;
      case 'priority':
        const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
        comparison = priorityOrder[a.priority] - priorityOrder[b.priority];
        break;
      case 'points':
        comparison = a.points - b.points;
        break;
      default:
        comparison = 0;
    }
    
    return sortOrder === 'asc' ? comparison : -comparison;
  });
};

// Default export with all methods
export default {
  // Main CRUD operations
  getAllTasks,
  getTaskStats,
  createTask,
  getTaskById,
  updateTask,
  deleteTask,
  
  // Special operations
  getUpcomingTasks,
  getOverdueTasks,
  completeTask,
  
  // Convenience filters
  getTasksByStatus,
  getTasksByPriority,
  getTasksByTag,
  getPendingTasks,
  getInProgressTasks,
  getCompletedTasks,
  getCancelledTasks,
  
  // Client-side utilities
  searchTasks,
  filterTasksByTags,
  filterTasksByDateRange,
  sortTasks,
};

