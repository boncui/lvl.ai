import { AxiosResponse } from 'axios';
import apiClient from './client';
import { ApiResponse, PaginatedResponse, BaseTask, TaskType } from '@/types';

// Email Task specific types
export interface EmailTask extends BaseTask {
  taskType: TaskType.EMAIL;
  recipient: {
    email: string;
    name?: string;
    organization?: string;
  };
  subject: string;
  emailType: 'outreach' | 'follow_up' | 'response' | 'meeting_request' | 'proposal' | 'thank_you' | 'other';
  content: {
    body: string;
    attachments?: {
      name: string;
      url: string;
      size: number;
    }[];
  };
  sendDate?: string;
  deliveryStatus?: {
    delivered: boolean;
    opened: boolean;
    replied: boolean;
    lastActivity?: string;
  };
  followUp?: {
    scheduledDate: string;
    message: string;
    status: 'pending' | 'sent' | 'cancelled';
  };
  aiSuggestions?: {
    subject: string;
    tone: string;
    keyPoints: string[];
    confidence: number;
  }[];
  responseTracking?: {
    expectedResponseDate?: string;
    actualResponseDate?: string;
    responseReceived: boolean;
  };
}

export interface EmailTaskStats {
  totalTasks: number;
  sentEmails: number;
  deliveredEmails: number;
  openedEmails: number;
  repliedEmails: number;
  averageResponseTime: number;
  emailTypeBreakdown: { type: string; count: number }[];
  responseRate: number;
  openRate: number;
}

export interface EmailStatus {
  status: string;
  deliveryStatus: {
    delivered: boolean;
    opened: boolean;
    replied: boolean;
    lastActivity?: string;
  };
  followUpStatus?: {
    scheduled: boolean;
    nextFollowUp?: string;
  };
}

export interface RecipientSearchResult {
  email: string;
  name?: string;
  organization?: string;
  recentInteractions: number;
  lastContactDate?: string;
}

// Email Tasks API endpoints based on backend routes
export class EmailTasksAPI {
  // @route   GET /api/email-tasks
  // @desc    Get all email tasks for the authenticated user
  static async getEmailTasks(params?: {
    emailType?: 'outreach' | 'follow_up' | 'response' | 'meeting_request' | 'proposal' | 'thank_you' | 'other';
    status?: 'draft' | 'ready_to_send' | 'sent' | 'delivered' | 'opened' | 'replied' | 'cancelled';
    priority?: 'low' | 'medium' | 'high' | 'urgent';
    recipient?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<EmailTask>> {
    const queryParams = new URLSearchParams();
    
    if (params?.emailType) queryParams.append('emailType', params.emailType);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.priority) queryParams.append('priority', params.priority);
    if (params?.recipient) queryParams.append('recipient', params.recipient);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const response: AxiosResponse<PaginatedResponse<EmailTask>> = await apiClient.client.get(
      `/email-tasks?${queryParams.toString()}`
    );
    
    if (response.data.success) {
      return response.data;
    }
    throw new Error(response.data.message || 'Failed to fetch email tasks');
  }

  // @route   GET /api/email-tasks/stats
  // @desc    Get email task statistics
  static async getEmailTaskStats(): Promise<EmailTaskStats> {
    const response: AxiosResponse<ApiResponse<EmailTaskStats>> = await apiClient.client.get('/email-tasks/stats');
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to fetch email task stats');
  }

  // @route   POST /api/email-tasks
  // @desc    Create a new email task
  static async createEmailTask(taskData: {
    title: string;
    description?: string;
    recipient: {
      email: string;
      name?: string;
      organization?: string;
    };
    subject: string;
    emailType: 'outreach' | 'follow_up' | 'response' | 'meeting_request' | 'proposal' | 'thank_you' | 'other';
    priority: 'low' | 'medium' | 'high' | 'urgent';
    content: {
      body: string;
      attachments?: {
        name: string;
        url: string;
        size: number;
      }[];
    };
    dueDate?: string;
    tags?: string[];
  }): Promise<EmailTask> {
    const response: AxiosResponse<ApiResponse<EmailTask>> = await apiClient.client.post('/email-tasks', taskData);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to create email task');
  }

  // @route   GET /api/email-tasks/:id
  // @desc    Get a specific email task
  static async getEmailTask(taskId: string): Promise<EmailTask> {
    const response: AxiosResponse<ApiResponse<EmailTask>> = await apiClient.client.get(`/email-tasks/${taskId}`);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to fetch email task');
  }

  // @route   PUT /api/email-tasks/:id
  // @desc    Update an email task
  static async updateEmailTask(taskId: string, taskData: {
    title?: string;
    description?: string;
    recipient?: {
      email: string;
      name?: string;
      organization?: string;
    };
    subject?: string;
    emailType?: 'outreach' | 'follow_up' | 'response' | 'meeting_request' | 'proposal' | 'thank_you' | 'other';
    priority?: 'low' | 'medium' | 'high' | 'urgent';
    content?: {
      body: string;
      attachments?: {
        name: string;
        url: string;
        size: number;
      }[];
    };
    dueDate?: string;
    tags?: string[];
    status?: 'draft' | 'ready_to_send' | 'sent' | 'delivered' | 'opened' | 'replied' | 'cancelled';
  }): Promise<EmailTask> {
    const response: AxiosResponse<ApiResponse<EmailTask>> = await apiClient.client.put(`/email-tasks/${taskId}`, taskData);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to update email task');
  }

  // @route   DELETE /api/email-tasks/:id
  // @desc    Delete an email task
  static async deleteEmailTask(taskId: string): Promise<void> {
    const response: AxiosResponse<ApiResponse> = await apiClient.client.delete(`/email-tasks/${taskId}`);
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to delete email task');
    }
  }

  // @route   POST /api/email-tasks/:id/mark-sent
  // @desc    Mark an email as sent
  static async markAsSent(taskId: string, sendData?: {
    sendDate?: string;
    deliveryStatus?: {
      delivered: boolean;
      opened: boolean;
      replied: boolean;
    };
  }): Promise<EmailTask> {
    const response: AxiosResponse<ApiResponse<EmailTask>> = await apiClient.client.post(
      `/email-tasks/${taskId}/mark-sent`,
      sendData
    );
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to mark email as sent');
  }

  // @route   POST /api/email-tasks/:id/mark-reply-received
  // @desc    Mark that a reply was received
  static async markReplyReceived(taskId: string, replyData?: {
    replyDate?: string;
    replyContent?: string;
  }): Promise<EmailTask> {
    const response: AxiosResponse<ApiResponse<EmailTask>> = await apiClient.client.post(
      `/email-tasks/${taskId}/mark-reply-received`,
      replyData
    );
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to mark reply as received');
  }

  // @route   POST /api/email-tasks/:id/schedule-follow-up
  // @desc    Schedule a follow-up email
  static async scheduleFollowUp(taskId: string, followUpData: {
    scheduledDate: string;
    message: string;
    priority?: 'low' | 'medium' | 'high' | 'urgent';
  }): Promise<EmailTask> {
    const response: AxiosResponse<ApiResponse<EmailTask>> = await apiClient.client.post(
      `/email-tasks/${taskId}/schedule-follow-up`,
      followUpData
    );
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to schedule follow-up');
  }

  // @route   GET /api/email-tasks/:id/status
  // @desc    Get email status and delivery information
  static async getEmailStatus(taskId: string): Promise<EmailStatus> {
    const response: AxiosResponse<ApiResponse<EmailStatus>> = await apiClient.client.get(`/email-tasks/${taskId}/status`);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to fetch email status');
  }

  // @route   GET /api/email-tasks/search/recipients
  // @desc    Search for email recipients
  static async searchRecipients(query: string): Promise<RecipientSearchResult[]> {
    const response: AxiosResponse<ApiResponse<RecipientSearchResult[]>> = await apiClient.client.get(
      `/email-tasks/search/recipients?q=${encodeURIComponent(query)}`
    );
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to search recipients');
  }

  // @route   GET /api/email-tasks/follow-ups-needed
  // @desc    Get emails that need follow-up
  static async getFollowUpsNeeded(): Promise<EmailTask[]> {
    const response: AxiosResponse<ApiResponse<EmailTask[]>> = await apiClient.client.get('/email-tasks/follow-ups-needed');
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to fetch follow-ups needed');
  }

  // @route   GET /api/email-tasks/overdue
  // @desc    Get overdue email tasks
  static async getOverdueTasks(): Promise<EmailTask[]> {
    const response: AxiosResponse<ApiResponse<EmailTask[]>> = await apiClient.client.get('/email-tasks/overdue');
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to fetch overdue tasks');
  }
}

export default EmailTasksAPI;
