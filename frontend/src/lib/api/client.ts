import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { 
  ApiResponse, 
  PaginatedResponse, 
  User, 
  BaseTask, 
  LoginRequest, 
  RegisterRequest, 
  AuthResponse,
  TaskFormData,
  TaskFilters,
  SortOption
} from '@/types';

class ApiClient {
  public client: AxiosInstance;
  private token: string | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      (config) => {
        if (this.token) {
          config.headers.Authorization = `Bearer ${this.token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Token expired or invalid, clear it
          this.clearToken();
          // Redirect to login if not already there
          if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
            window.location.href = '/login';
          }
        }
        return Promise.reject(error);
      }
    );

    // Load token from localStorage on initialization
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('auth_token');
    }
  }

  setToken(token: string) {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token);
    }
  }

  clearToken() {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
    }
  }

  // Auth endpoints
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response: AxiosResponse<ApiResponse<AuthResponse>> = await this.client.post('/auth/login', credentials);
    if (response.data.success && response.data.data) {
      this.setToken(response.data.data.token);
      return response.data.data;
    }
    throw new Error(response.data.message || 'Login failed');
  }

  async register(userData: RegisterRequest): Promise<AuthResponse> {
    const response: AxiosResponse<ApiResponse<AuthResponse>> = await this.client.post('/auth/register', userData);
    if (response.data.success && response.data.data) {
      this.setToken(response.data.data.token);
      return response.data.data;
    }
    throw new Error(response.data.message || 'Registration failed');
  }

  async logout(): Promise<void> {
    try {
      await this.client.post('/auth/logout');
    } finally {
      this.clearToken();
    }
  }

  async getCurrentUser(): Promise<User> {
    const response: AxiosResponse<ApiResponse<User>> = await this.client.get('/auth/me');
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to get user data');
  }

  // User endpoints
  async updateUser(userId: string, userData: Partial<User>): Promise<User> {
    const response: AxiosResponse<ApiResponse<User>> = await this.client.put(`/users/${userId}`, userData);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to update user');
  }

  async uploadAvatar(userId: string, file: File): Promise<string> {
    const formData = new FormData();
    formData.append('avatar', file);
    
    const response: AxiosResponse<ApiResponse<{ url: string }>> = await this.client.post(
      `/users/${userId}/avatar`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    
    if (response.data.success && response.data.data) {
      return response.data.data.url;
    }
    throw new Error(response.data.message || 'Failed to upload avatar');
  }

  // Task endpoints
  async getTasks(
    filters?: TaskFilters,
    sort?: SortOption,
    page: number = 1,
    limit: number = 20
  ): Promise<PaginatedResponse<BaseTask>> {
    const params = new URLSearchParams();
    
    if (filters) {
      if (filters.status) params.append('status', filters.status.join(','));
      if (filters.priority) params.append('priority', filters.priority.join(','));
      if (filters.taskType) params.append('taskType', filters.taskType.join(','));
      if (filters.tags) params.append('tags', filters.tags.join(','));
      if (filters.search) params.append('search', filters.search);
      if (filters.dateRange) {
        params.append('startDate', filters.dateRange.start.toISOString());
        params.append('endDate', filters.dateRange.end.toISOString());
      }
    }
    
    if (sort) {
      params.append('sortBy', sort.field);
      params.append('sortOrder', sort.direction);
    }
    
    params.append('page', page.toString());
    params.append('limit', limit.toString());

    const response: AxiosResponse<PaginatedResponse<BaseTask>> = await this.client.get(
      `/tasks?${params.toString()}`
    );
    
    if (response.data.success) {
      return response.data;
    }
    throw new Error(response.data.message || 'Failed to fetch tasks');
  }

  async getTask(taskId: string): Promise<BaseTask> {
    const response: AxiosResponse<ApiResponse<BaseTask>> = await this.client.get(`/tasks/${taskId}`);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to fetch task');
  }

  async createTask(taskData: TaskFormData): Promise<BaseTask> {
    const response: AxiosResponse<ApiResponse<BaseTask>> = await this.client.post('/tasks', taskData);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to create task');
  }

  async updateTask(taskId: string, taskData: Partial<TaskFormData>): Promise<BaseTask> {
    const response: AxiosResponse<ApiResponse<BaseTask>> = await this.client.put(`/tasks/${taskId}`, taskData);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to update task');
  }

  async deleteTask(taskId: string): Promise<void> {
    const response: AxiosResponse<ApiResponse> = await this.client.delete(`/tasks/${taskId}`);
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to delete task');
    }
  }

  async completeTask(taskId: string): Promise<BaseTask> {
    const response: AxiosResponse<ApiResponse<BaseTask>> = await this.client.patch(`/tasks/${taskId}/complete`);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to complete task');
  }

  // Task type specific endpoints
  async getFoodTasks(): Promise<BaseTask[]> {
    const response: AxiosResponse<ApiResponse<BaseTask[]>> = await this.client.get('/tasks/food');
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to fetch food tasks');
  }

  async getHomeworkTasks(): Promise<BaseTask[]> {
    const response: AxiosResponse<ApiResponse<BaseTask[]>> = await this.client.get('/tasks/homework');
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to fetch homework tasks');
  }

  async getWorkTasks(): Promise<BaseTask[]> {
    const response: AxiosResponse<ApiResponse<BaseTask[]>> = await this.client.get('/tasks/work');
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to fetch work tasks');
  }

  async getHealthTasks(): Promise<BaseTask[]> {
    const response: AxiosResponse<ApiResponse<BaseTask[]>> = await this.client.get('/tasks/health');
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to fetch health tasks');
  }

  // Friend endpoints
  async getFriends(): Promise<User[]> {
    const response: AxiosResponse<ApiResponse<User[]>> = await this.client.get('/friends');
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to fetch friends');
  }

  async sendFriendRequest(userId: string): Promise<void> {
    const response: AxiosResponse<ApiResponse> = await this.client.post(`/friends/request/${userId}`);
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to send friend request');
    }
  }

  async acceptFriendRequest(userId: string): Promise<void> {
    const response: AxiosResponse<ApiResponse> = await this.client.post(`/friends/accept/${userId}`);
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to accept friend request');
    }
  }

  async rejectFriendRequest(userId: string): Promise<void> {
    const response: AxiosResponse<ApiResponse> = await this.client.post(`/friends/reject/${userId}`);
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to reject friend request');
    }
  }

  async removeFriend(userId: string): Promise<void> {
    const response: AxiosResponse<ApiResponse> = await this.client.delete(`/friends/${userId}`);
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to remove friend');
    }
  }

  // Analytics endpoints
  async getAnalytics(): Promise<Record<string, unknown>> {
    const response: AxiosResponse<ApiResponse<Record<string, unknown>>> = await this.client.get('/analytics');
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to fetch analytics');
  }

  // Utility methods
  isAuthenticated(): boolean {
    return !!this.token;
  }

  getToken(): string | null {
    return this.token;
  }
}

// Create and export a singleton instance
export const apiClient = new ApiClient();
export default apiClient;
