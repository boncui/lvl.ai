import { AxiosResponse } from 'axios';
import apiClient from './client';
import { ApiResponse, PaginatedResponse, BaseTask, TaskType } from '@/lib/types';

// Food Task specific types
export interface FoodTask extends BaseTask {
  taskType: 'food';
  foodName: string;
  category: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack' | 'Drink';
  calories: number;
  protein?: number;
  carbs?: number;
  fats?: number;
  sugar?: number;
  fiber?: number;
  cost?: number;
  cookTime?: number;
  healthRating?: number;
  ingredients: string[];
  moodAfterEating?: string;
  source?: string;
  aiSuggestions?: {
    substitute?: string;
    tip?: string;
  };
}

export interface FoodTaskStats {
  totalFoodTasks: number;
  byCategory: {
    Breakfast: number;
    Lunch: number;
    Dinner: number;
    Snack: number;
    Drink: number;
  };
  byHealthRating: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
  averageCalories: number;
  averageProtein: number;
  averageCarbs: number;
  averageFats: number;
  totalCost: number;
  healthyMeals: number;
  unhealthyMeals: number;
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
  nutritionalDensity: number;
  calories: number;
  totalMacros: {
    protein: number;
    carbs: number;
    fats: number;
  };
}

// Food Tasks API endpoints based on backend routes
export class FoodTasksAPI {
  // @route   GET /api/food-tasks
  // @desc    Get all food tasks for the authenticated user
  static async getFoodTasks(params?: {
    category?: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack' | 'Drink';
    healthRating?: number;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<{ foodTasks: FoodTask[]; pagination: { page: number; limit: number; total: number; pages: number } }> {
    const queryParams = new URLSearchParams();
    
    if (params?.category) queryParams.append('category', params.category);
    if (params?.healthRating) queryParams.append('healthRating', params.healthRating.toString());
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);

    const response: AxiosResponse<{ foodTasks: FoodTask[]; pagination: { page: number; limit: number; total: number; pages: number } }> = await apiClient.client.get(
      `/food-tasks?${queryParams.toString()}`
    );
    
    return response.data;
  }

  // @route   GET /api/food-tasks/stats
  // @desc    Get food task statistics
  static async getFoodTaskStats(period?: number): Promise<FoodTaskStats> {
    const params = new URLSearchParams();
    if (period) params.append('period', period.toString());

    const response: AxiosResponse<FoodTaskStats> = await apiClient.client.get(`/food-tasks/stats?${params.toString()}`);
    return response.data;
  }

  // @route   POST /api/food-tasks
  // @desc    Create a new food task
  static async createFoodTask(taskData: {
    title: string;
    foodName: string;
    category: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack' | 'Drink';
    calories: number;
    protein?: number;
    carbs?: number;
    fats?: number;
    sugar?: number;
    fiber?: number;
    cost?: number;
    cookTime?: number;
    healthRating?: number;
    ingredients?: string[];
    moodAfterEating?: string;
    source?: string;
  }): Promise<FoodTask> {
    const response: AxiosResponse<FoodTask> = await apiClient.client.post('/food-tasks', taskData);
    return response.data;
  }

  // @route   GET /api/food-tasks/:id
  // @desc    Get a specific food task
  static async getFoodTask(taskId: string): Promise<FoodTask> {
    const response: AxiosResponse<FoodTask> = await apiClient.client.get(`/food-tasks/${taskId}`);
    return response.data;
  }

  // @route   PUT /api/food-tasks/:id
  // @desc    Update a food task
  static async updateFoodTask(taskId: string, taskData: Partial<{
    title: string;
    foodName: string;
    category: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack' | 'Drink';
    calories: number;
    protein?: number;
    carbs?: number;
    fats?: number;
    sugar?: number;
    fiber?: number;
    cost?: number;
    cookTime?: number;
    healthRating?: number;
    ingredients?: string[];
    moodAfterEating?: string;
    source?: string;
  }>): Promise<FoodTask> {
    const response: AxiosResponse<FoodTask> = await apiClient.client.put(`/food-tasks/${taskId}`, taskData);
    return response.data;
  }

  // @route   DELETE /api/food-tasks/:id
  // @desc    Delete a food task
  static async deleteFoodTask(taskId: string): Promise<{ message: string }> {
    const response: AxiosResponse<{ message: string }> = await apiClient.client.delete(`/food-tasks/${taskId}`);
    return response.data;
  }

  // @route   POST /api/food-tasks/:id/ingredients
  // @desc    Add an ingredient to a food task
  static async addIngredient(taskId: string, ingredient: string): Promise<FoodTask> {
    const response: AxiosResponse<FoodTask> = await apiClient.client.post(`/food-tasks/${taskId}/ingredients`, { ingredient });
    return response.data;
  }

  // @route   PUT /api/food-tasks/:id/ai-suggestions
  // @desc    Update AI suggestions for a food task
  static async updateAISuggestions(taskId: string, suggestions: {
    substitute?: string;
    tip?: string;
  }): Promise<FoodTask> {
    const response: AxiosResponse<FoodTask> = await apiClient.client.put(`/food-tasks/${taskId}/ai-suggestions`, suggestions);
    return response.data;
  }

  // @route   GET /api/food-tasks/:id/nutritional-density
  // @desc    Get nutritional density analysis for a food task
  static async getNutritionalDensity(taskId: string): Promise<NutritionalDensity> {
    const response: AxiosResponse<NutritionalDensity> = await apiClient.client.get(`/food-tasks/${taskId}/nutritional-density`);
    return response.data;
  }

  // @route   GET /api/food-tasks/search/ingredients
  // @desc    Search food tasks by ingredients
  static async searchByIngredients(ingredient: string, page: number = 1, limit: number = 10): Promise<{
    foodTasks: FoodTask[];
    searchTerm: string;
    pagination: { page: number; limit: number; total: number };
  }> {
    const params = new URLSearchParams();
    params.append('ingredient', ingredient);
    params.append('page', page.toString());
    params.append('limit', limit.toString());

    const response: AxiosResponse<{
      foodTasks: FoodTask[];
      searchTerm: string;
      pagination: { page: number; limit: number; total: number };
    }> = await apiClient.client.get(`/food-tasks/search/ingredients?${params.toString()}`);
    return response.data;
  }
}

export default FoodTasksAPI;
