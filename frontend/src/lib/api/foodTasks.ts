import { AxiosResponse } from 'axios';
import apiClient from './client';
import { ApiResponse, PaginatedResponse, BaseTask, TaskType } from '@/types';

// Food Task specific types
export interface FoodTask extends BaseTask {
  taskType: TaskType.FOOD;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  ingredients: {
    name: string;
    quantity: number;
    unit: string;
    nutritionalInfo?: {
      calories: number;
      protein: number;
      carbs: number;
      fat: number;
    };
  }[];
  nutritionalGoals?: {
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
    fiber?: number;
  };
  dietaryRestrictions?: string[];
  cookingTime?: number; // in minutes
  difficulty?: 'easy' | 'medium' | 'hard';
  cuisine?: string;
  aiSuggestions?: {
    ingredient: string;
    suggestion: string;
    confidence: number;
  }[];
}

export interface FoodTaskStats {
  totalTasks: number;
  completedTasks: number;
  averageCookingTime: number;
  favoriteCuisines: { cuisine: string; count: number }[];
  nutritionalBreakdown: {
    totalCalories: number;
    averageProtein: number;
    averageCarbs: number;
    averageFat: number;
  };
}

export interface IngredientSearchResult {
  name: string;
  nutritionalInfo: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
  };
  commonUnits: string[];
}

export interface NutritionalDensity {
  caloriesPerGram: number;
  proteinPerGram: number;
  overallScore: number;
  recommendations: string[];
}

// Food Tasks API endpoints based on backend routes
export class FoodTasksAPI {
  // @route   GET /api/food-tasks
  // @desc    Get all food tasks for the authenticated user
  static async getFoodTasks(params?: {
    mealType?: 'breakfast' | 'lunch' | 'dinner' | 'snack';
    status?: 'pending' | 'in_progress' | 'completed' | 'cancelled';
    cuisine?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<FoodTask>> {
    const queryParams = new URLSearchParams();
    
    if (params?.mealType) queryParams.append('mealType', params.mealType);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.cuisine) queryParams.append('cuisine', params.cuisine);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const response: AxiosResponse<PaginatedResponse<FoodTask>> = await apiClient.client.get(
      `/food-tasks?${queryParams.toString()}`
    );
    
    if (response.data.success) {
      return response.data;
    }
    throw new Error(response.data.message || 'Failed to fetch food tasks');
  }

  // @route   GET /api/food-tasks/stats
  // @desc    Get food task statistics
  static async getFoodTaskStats(): Promise<FoodTaskStats> {
    const response: AxiosResponse<ApiResponse<FoodTaskStats>> = await apiClient.client.get('/food-tasks/stats');
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to fetch food task stats');
  }

  // @route   POST /api/food-tasks
  // @desc    Create a new food task
  static async createFoodTask(taskData: {
    title: string;
    description?: string;
    mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
    ingredients: {
      name: string;
      quantity: number;
      unit: string;
    }[];
    nutritionalGoals?: {
      calories?: number;
      protein?: number;
      carbs?: number;
      fat?: number;
      fiber?: number;
    };
    dietaryRestrictions?: string[];
    cookingTime?: number;
    difficulty?: 'easy' | 'medium' | 'hard';
    cuisine?: string;
    dueDate?: string;
    priority?: 'low' | 'medium' | 'high' | 'urgent';
    tags?: string[];
  }): Promise<FoodTask> {
    const response: AxiosResponse<ApiResponse<FoodTask>> = await apiClient.client.post('/food-tasks', taskData);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to create food task');
  }

  // @route   GET /api/food-tasks/:id
  // @desc    Get a specific food task
  static async getFoodTask(taskId: string): Promise<FoodTask> {
    const response: AxiosResponse<ApiResponse<FoodTask>> = await apiClient.client.get(`/food-tasks/${taskId}`);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to fetch food task');
  }

  // @route   PUT /api/food-tasks/:id
  // @desc    Update a food task
  static async updateFoodTask(taskId: string, taskData: {
    title?: string;
    description?: string;
    mealType?: 'breakfast' | 'lunch' | 'dinner' | 'snack';
    ingredients?: {
      name: string;
      quantity: number;
      unit: string;
    }[];
    nutritionalGoals?: {
      calories?: number;
      protein?: number;
      carbs?: number;
      fat?: number;
      fiber?: number;
    };
    dietaryRestrictions?: string[];
    cookingTime?: number;
    difficulty?: 'easy' | 'medium' | 'hard';
    cuisine?: string;
    dueDate?: string;
    priority?: 'low' | 'medium' | 'high' | 'urgent';
    tags?: string[];
    status?: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  }): Promise<FoodTask> {
    const response: AxiosResponse<ApiResponse<FoodTask>> = await apiClient.client.put(`/food-tasks/${taskId}`, taskData);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to update food task');
  }

  // @route   DELETE /api/food-tasks/:id
  // @desc    Delete a food task
  static async deleteFoodTask(taskId: string): Promise<void> {
    const response: AxiosResponse<ApiResponse> = await apiClient.client.delete(`/food-tasks/${taskId}`);
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to delete food task');
    }
  }

  // @route   POST /api/food-tasks/:id/ingredients
  // @desc    Add ingredients to a food task
  static async addIngredients(taskId: string, ingredients: {
    name: string;
    quantity: number;
    unit: string;
  }[]): Promise<FoodTask> {
    const response: AxiosResponse<ApiResponse<FoodTask>> = await apiClient.client.post(
      `/food-tasks/${taskId}/ingredients`,
      { ingredients }
    );
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to add ingredients');
  }

  // @route   PUT /api/food-tasks/:id/ai-suggestions
  // @desc    Update AI suggestions for a food task
  static async updateAISuggestions(taskId: string, suggestions: {
    ingredient: string;
    suggestion: string;
    confidence: number;
  }[]): Promise<FoodTask> {
    const response: AxiosResponse<ApiResponse<FoodTask>> = await apiClient.client.put(
      `/food-tasks/${taskId}/ai-suggestions`,
      { suggestions }
    );
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to update AI suggestions');
  }

  // @route   GET /api/food-tasks/:id/nutritional-density
  // @desc    Get nutritional density analysis for a food task
  static async getNutritionalDensity(taskId: string): Promise<NutritionalDensity> {
    const response: AxiosResponse<ApiResponse<NutritionalDensity>> = await apiClient.client.get(
      `/food-tasks/${taskId}/nutritional-density`
    );
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to fetch nutritional density');
  }

  // @route   GET /api/food-tasks/search/ingredients
  // @desc    Search for ingredients
  static async searchIngredients(query: string): Promise<IngredientSearchResult[]> {
    const response: AxiosResponse<ApiResponse<IngredientSearchResult[]>> = await apiClient.client.get(
      `/food-tasks/search/ingredients?q=${encodeURIComponent(query)}`
    );
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to search ingredients');
  }
}

export default FoodTasksAPI;
