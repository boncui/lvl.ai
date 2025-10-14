import { AxiosResponse } from 'axios';
import apiClient from './client';
import { ApiResponse, PaginatedResponse, BaseTask, TaskType } from '@/lib/types';

// Meeting Task specific types
export interface MeetingTask extends BaseTask {
  taskType: TaskType.MEETING;
  meetingType: 'one_on_one' | 'team_meeting' | 'client_meeting' | 'standup' | 'retrospective' | 'planning' | 'review' | 'other';
  startTime: string;
  endTime: string;
  duration: number; // in minutes
  meetingLocation: {
    type: 'physical' | 'virtual' | 'hybrid';
    address?: string;
    room?: string;
    meetingLink?: string;
    platform?: string;
  };
  attendees: {
    userId: string;
    name: string;
    email: string;
    role?: string;
    status: 'invited' | 'accepted' | 'declined' | 'tentative';
    responseDate?: string;
  }[];
  agenda: {
    item: string;
    duration?: number;
    presenter?: string;
    completed: boolean;
  }[];
  actionItems: {
    description: string;
    assignee: string;
    dueDate?: string;
    priority: 'low' | 'medium' | 'high';
    completed: boolean;
    completedDate?: string;
  }[];
  meetingNotes?: string;
  recordingUrl?: string;
  followUpRequired: boolean;
  nextMeetingDate?: string;
  meetingEfficiency?: {
    score: number; // 1-5 scale
    productiveTime: number; // in minutes
    distractions: string[];
    recommendations: string[];
  };
}

export interface MeetingTaskStats {
  totalMeetings: number;
  completedMeetings: number;
  averageDuration: number;
  meetingTypeBreakdown: { type: string; count: number }[];
  attendanceRate: number;
  averageEfficiency: number;
  upcomingMeetings: number;
  actionItemsCompleted: number;
}

export interface MeetingEfficiency {
  overallScore: number;
  productiveTime: number;
  distractions: string[];
  recommendations: string[];
  attendanceRate: number;
  agendaCompletionRate: number;
}

export interface AttendeeSearchResult {
  userId: string;
  name: string;
  email: string;
  role?: string;
  recentMeetings: number;
  availability: 'available' | 'busy' | 'unknown';
}

// Meeting Tasks API endpoints based on backend routes
export class MeetingTasksAPI {
  // @route   GET /api/meeting-tasks
  // @desc    Get all meeting tasks for the authenticated user
  static async getMeetingTasks(params?: {
    meetingType?: 'one_on_one' | 'team_meeting' | 'client_meeting' | 'standup' | 'retrospective' | 'planning' | 'review' | 'other';
    status?: 'pending' | 'in_progress' | 'completed' | 'cancelled';
    location?: 'physical' | 'virtual' | 'hybrid';
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<MeetingTask>> {
    const queryParams = new URLSearchParams();
    
    if (params?.meetingType) queryParams.append('meetingType', params.meetingType);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.location) queryParams.append('location', params.location);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const response: AxiosResponse<PaginatedResponse<MeetingTask>> = await apiClient.client.get(
      `/meeting-tasks?${queryParams.toString()}`
    );
    
    if (response.data.success) {
      return response.data;
    }
    throw new Error(response.data.message || 'Failed to fetch meeting tasks');
  }

  // @route   GET /api/meeting-tasks/stats
  // @desc    Get meeting task statistics
  static async getMeetingTaskStats(): Promise<MeetingTaskStats> {
    const response: AxiosResponse<ApiResponse<MeetingTaskStats>> = await apiClient.client.get('/meeting-tasks/stats');
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to fetch meeting task stats');
  }

  // @route   POST /api/meeting-tasks
  // @desc    Create a new meeting task
  static async createMeetingTask(taskData: {
    title: string;
    description?: string;
    meetingType: 'one_on_one' | 'team_meeting' | 'client_meeting' | 'standup' | 'retrospective' | 'planning' | 'review' | 'other';
    startTime: string;
    endTime: string;
    location: {
      type: 'physical' | 'virtual' | 'hybrid';
      address?: string;
      room?: string;
      meetingLink?: string;
      platform?: string;
    };
    agenda?: {
      item: string;
      duration?: number;
      presenter?: string;
    }[];
    priority?: 'low' | 'medium' | 'high' | 'urgent';
    tags?: string[];
  }): Promise<MeetingTask> {
    const response: AxiosResponse<ApiResponse<MeetingTask>> = await apiClient.client.post('/meeting-tasks', taskData);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to create meeting task');
  }

  // @route   GET /api/meeting-tasks/:id
  // @desc    Get a specific meeting task
  static async getMeetingTask(taskId: string): Promise<MeetingTask> {
    const response: AxiosResponse<ApiResponse<MeetingTask>> = await apiClient.client.get(`/meeting-tasks/${taskId}`);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to fetch meeting task');
  }

  // @route   PUT /api/meeting-tasks/:id
  // @desc    Update a meeting task
  static async updateMeetingTask(taskId: string, taskData: {
    title?: string;
    description?: string;
    meetingType?: 'one_on_one' | 'team_meeting' | 'client_meeting' | 'standup' | 'retrospective' | 'planning' | 'review' | 'other';
    startTime?: string;
    endTime?: string;
    location?: {
      type: 'physical' | 'virtual' | 'hybrid';
      address?: string;
      room?: string;
      meetingLink?: string;
      platform?: string;
    };
    priority?: 'low' | 'medium' | 'high' | 'urgent';
    tags?: string[];
    status?: 'pending' | 'in_progress' | 'completed' | 'cancelled';
    meetingNotes?: string;
    recordingUrl?: string;
  }): Promise<MeetingTask> {
    const response: AxiosResponse<ApiResponse<MeetingTask>> = await apiClient.client.put(`/meeting-tasks/${taskId}`, taskData);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to update meeting task');
  }

  // @route   DELETE /api/meeting-tasks/:id
  // @desc    Delete a meeting task
  static async deleteMeetingTask(taskId: string): Promise<void> {
    const response: AxiosResponse<ApiResponse> = await apiClient.client.delete(`/meeting-tasks/${taskId}`);
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to delete meeting task');
    }
  }

  // @route   POST /api/meeting-tasks/:id/attendees
  // @desc    Add attendees to a meeting task
  static async addAttendees(taskId: string, attendees: {
    userId: string;
    name: string;
    email: string;
    role?: string;
  }[]): Promise<MeetingTask> {
    const response: AxiosResponse<ApiResponse<MeetingTask>> = await apiClient.client.post(
      `/meeting-tasks/${taskId}/attendees`,
      { attendees }
    );
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to add attendees');
  }

  // @route   POST /api/meeting-tasks/:id/action-items
  // @desc    Add action items to a meeting task
  static async addActionItems(taskId: string, actionItems: {
    description: string;
    assignee: string;
    dueDate?: string;
    priority: 'low' | 'medium' | 'high';
  }[]): Promise<MeetingTask> {
    const response: AxiosResponse<ApiResponse<MeetingTask>> = await apiClient.client.post(
      `/meeting-tasks/${taskId}/action-items`,
      { actionItems }
    );
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to add action items');
  }

  // @route   POST /api/meeting-tasks/:id/action-items/:actionIndex/complete
  // @desc    Mark an action item as complete
  static async completeActionItem(taskId: string, actionIndex: number): Promise<MeetingTask> {
    const response: AxiosResponse<ApiResponse<MeetingTask>> = await apiClient.client.post(
      `/meeting-tasks/${taskId}/action-items/${actionIndex}/complete`
    );
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to complete action item');
  }

  // @route   GET /api/meeting-tasks/:id/efficiency
  // @desc    Get meeting efficiency analysis
  static async getMeetingEfficiency(taskId: string): Promise<MeetingEfficiency> {
    const response: AxiosResponse<ApiResponse<MeetingEfficiency>> = await apiClient.client.get(
      `/meeting-tasks/${taskId}/efficiency`
    );
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to fetch meeting efficiency');
  }

  // @route   GET /api/meeting-tasks/happening-now
  // @desc    Get meetings happening now
  static async getHappeningNow(): Promise<MeetingTask[]> {
    const response: AxiosResponse<ApiResponse<MeetingTask[]>> = await apiClient.client.get('/meeting-tasks/happening-now');
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to fetch current meetings');
  }

  // @route   GET /api/meeting-tasks/upcoming
  // @desc    Get upcoming meeting tasks
  static async getUpcomingTasks(days?: number): Promise<MeetingTask[]> {
    const queryParams = new URLSearchParams();
    if (days) queryParams.append('days', days.toString());

    const response: AxiosResponse<ApiResponse<MeetingTask[]>> = await apiClient.client.get(
      `/meeting-tasks/upcoming?${queryParams.toString()}`
    );
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to fetch upcoming meetings');
  }

  // @route   GET /api/meeting-tasks/search/attendees
  // @desc    Search for meeting attendees
  static async searchAttendees(query: string): Promise<AttendeeSearchResult[]> {
    const response: AxiosResponse<ApiResponse<AttendeeSearchResult[]>> = await apiClient.client.get(
      `/meeting-tasks/search/attendees?q=${encodeURIComponent(query)}`
    );
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to search attendees');
  }
}

export default MeetingTasksAPI;
