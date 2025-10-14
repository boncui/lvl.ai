// API Response Types
import { User } from './User';
import { TaskType, TaskPriority, TaskStatus } from './BaseTask';
import { LifeCategory, UserPreferences } from './User';

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Auth Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

// Form Types
export interface TaskFormData {
  title: string;
  description?: string;
  taskType: TaskType;
  priority: TaskPriority;
  dueDate?: Date;
  startDate?: Date;
  estimatedDuration?: number;
  tags: string[];
  location?: string;
  isRecurring: boolean;
  recurringPattern?: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
    interval: number;
    daysOfWeek?: number[];
    dayOfMonth?: number;
    endDate?: Date;
  };
  personalCategory?: string;
  isPrivate?: boolean;
  personalNotes?: string;
  energyLevel?: number;
  weatherDependent?: boolean;
  weatherCondition?: string;
  seasonality?: string[];
  personalGoals?: string[];
  cost?: number;
}

export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  name: string;
  email: string;
  password: string;
}

export interface UserProfileFormData {
  name: string;
  email: string;
  preferences: UserPreferences;
}

// UI Component Types
export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface TabItem {
  id: string;
  label: string;
  content: React.ReactNode;
  disabled?: boolean;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  description?: string;
  duration?: number;
}

// Chart and Analytics Types
export interface ChartDataPoint {
  x: string | number;
  y: number;
  label?: string;
}

export interface AnalyticsData {
  totalTasks: number;
  completedTasks: number;
  overdueTasks: number;
  totalXP: number;
  streak: number;
  categoryBreakdown: Record<LifeCategory, number>;
  weeklyProgress: ChartDataPoint[];
  monthlyProgress: ChartDataPoint[];
}

// Notification Types
export interface Notification {
  id: string;
  type: 'task_reminder' | 'friend_request' | 'achievement' | 'system';
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
  actionUrl?: string;
}

// Search and Filter Types
export interface TaskFilters {
  status?: TaskStatus[];
  priority?: TaskPriority[];
  taskType?: TaskType[];
  tags?: string[];
  assignee?: string[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  search?: string;
}

export interface SortOption {
  field: string;
  direction: 'asc' | 'desc';
}

// Theme Types
export interface ThemeConfig {
  mode: 'light' | 'dark' | 'system';
  primaryColor: string;
  accentColor: string;
}

// Error Types
export interface AppError {
  code: string;
  message: string;
  details?: unknown;
}
