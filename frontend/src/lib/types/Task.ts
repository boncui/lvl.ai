// Frontend types based on simplified backend Task model

// ---------- ENUMS ----------
export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

export enum TaskStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

// ---------- BACKEND TASK INTERFACE ----------
// This matches the backend ITask interface exactly
export interface ITask {
  _id: string;
  title: string;
  description?: string;
  priority: TaskPriority;
  status: TaskStatus;
  taskTime?: Date | string; // When the task is occurring/scheduled
  dueDate?: Date | string; // When the task is due
  completedAt?: Date | string;
  points: number;
  tags: string[];
  userId: string; // User who owns the task
  createdAt: Date | string; // Time of conception
  updatedAt: Date | string;
}

// ---------- FRONTEND TASK TYPE ----------
// Simplified version for frontend use with parsed dates
export interface Task {
  _id: string;
  title: string;
  description?: string;
  priority: TaskPriority;
  status: TaskStatus;
  taskTime?: Date; // When the task is occurring/scheduled
  dueDate?: Date; // When the task is due
  completedAt?: Date;
  points: number;
  tags: string[];
  userId: string;
  createdAt: Date; // Time of conception
  updatedAt: Date;
}

// ---------- TASK CREATE/UPDATE DTOS ----------
export interface CreateTaskDTO {
  title: string;
  description?: string;
  priority?: TaskPriority;
  status?: TaskStatus;
  taskTime?: Date | string;
  dueDate?: Date | string;
  points?: number;
  tags?: string[];
}

export interface UpdateTaskDTO {
  title?: string;
  description?: string;
  priority?: TaskPriority;
  status?: TaskStatus;
  taskTime?: Date | string;
  dueDate?: Date | string;
  points?: number;
  tags?: string[];
}

// ---------- TASK FILTERS ----------
export interface TaskFilters {
  status?: TaskStatus;
  priority?: TaskPriority;
  tag?: string;
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'updatedAt' | 'dueDate' | 'taskTime' | 'priority' | 'points';
  sortOrder?: 'asc' | 'desc';
}

// ---------- TASK STATS ----------
export interface TaskStats {
  totalTasks: number;
  byStatus: Record<string, number>;
  byPriority: Record<string, number>;
  totalPoints: number;
  earnedPoints: number;
  overdue: number;
}

// ---------- API RESPONSE TYPES ----------
export interface TaskResponse {
  success: boolean;
  data: ITask;
}

export interface TasksResponse {
  success: boolean;
  count: number;
  total: number;
  page: number;
  pages: number;
  data: ITask[];
}

export interface TaskStatsResponse {
  success: boolean;
  data: TaskStats;
}

export interface TaskCompleteResponse {
  success: boolean;
  data: ITask;
  message: string;
}

// ---------- HELPER FUNCTIONS ----------
export const parseTaskDates = (task: ITask): Task => ({
  ...task,
  taskTime: task.taskTime ? new Date(task.taskTime) : undefined,
  dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
  completedAt: task.completedAt ? new Date(task.completedAt) : undefined,
  createdAt: new Date(task.createdAt),
  updatedAt: new Date(task.updatedAt),
});

export const isOverdue = (task: Task): boolean => {
  return !!task.dueDate && task.dueDate < new Date() && task.status !== TaskStatus.COMPLETED;
};

export const isUpcoming = (task: Task): boolean => {
  if (task.status === TaskStatus.COMPLETED) return false;
  const now = new Date();
  if (task.taskTime && task.taskTime >= now) return true;
  if (task.dueDate && task.dueDate >= now) return true;
  return false;
};
