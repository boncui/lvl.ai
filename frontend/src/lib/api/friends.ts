import { AxiosResponse } from 'axios';
import apiClient from './client';
import { ApiResponse, User } from '@/lib/types';

// Friends API endpoints based on backend routes
export class FriendsAPI {
  // @route   POST /api/friends/request
  // @desc    Send friend request
  static async sendFriendRequest(recipientId: string): Promise<void> {
    const response: AxiosResponse<ApiResponse> = await apiClient.client.post('/friends/request', {
      recipientId
    });
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to send friend request');
    }
  }

  // @route   PUT /api/friends/accept/:userId
  // @desc    Accept friend request
  static async acceptFriendRequest(userId: string): Promise<void> {
    const response: AxiosResponse<ApiResponse> = await apiClient.client.put(`/friends/accept/${userId}`);
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to accept friend request');
    }
  }

  // @route   PUT /api/friends/decline/:userId
  // @desc    Decline friend request
  static async declineFriendRequest(userId: string): Promise<void> {
    const response: AxiosResponse<ApiResponse> = await apiClient.client.put(`/friends/decline/${userId}`);
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to decline friend request');
    }
  }

  // @route   GET /api/friends
  // @desc    Get all friends
  static async getFriends(): Promise<User[]> {
    const response: AxiosResponse<ApiResponse<User[]>> = await apiClient.client.get('/friends');
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to fetch friends');
  }

  // @route   GET /api/friends/pending
  // @desc    Get pending friend requests
  static async getPendingRequests(): Promise<User[]> {
    const response: AxiosResponse<ApiResponse<User[]>> = await apiClient.client.get('/friends/pending');
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to fetch pending requests');
  }

  // @route   GET /api/friends/sent
  // @desc    Get sent friend requests
  static async getSentRequests(): Promise<User[]> {
    const response: AxiosResponse<ApiResponse<User[]>> = await apiClient.client.get('/friends/sent');
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to fetch sent requests');
  }

  // @route   DELETE /api/friends/:userId
  // @desc    Remove friend
  static async removeFriend(userId: string): Promise<void> {
    const response: AxiosResponse<ApiResponse> = await apiClient.client.delete(`/friends/${userId}`);
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to remove friend');
    }
  }

  // @route   PUT /api/friends/block/:userId
  // @desc    Block user
  static async blockUser(userId: string): Promise<void> {
    const response: AxiosResponse<ApiResponse> = await apiClient.client.put(`/friends/block/${userId}`);
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to block user');
    }
  }

  // @route   PUT /api/friends/unblock/:userId
  // @desc    Unblock user
  static async unblockUser(userId: string): Promise<void> {
    const response: AxiosResponse<ApiResponse> = await apiClient.client.put(`/friends/unblock/${userId}`);
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to unblock user');
    }
  }
}

export default FriendsAPI;
