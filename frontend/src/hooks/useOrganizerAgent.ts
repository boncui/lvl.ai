/**
 * useOrganizerAgent Hook
 * React hook for interacting with the AI-powered organizer agent
 */

import { useState, useCallback } from 'react';
import {
  organizerAgentAPI,
  ChatRequest,
  AIProvider,
} from '@/lib/api/agents/organizerAgent';

interface UseOrganizerAgentReturn {
  // States
  loading: boolean;
  error: string | null;
  
  // Chat functions
  chat: (message: string, options?: Omit<ChatRequest, 'message'>) => Promise<string>;
  
  // Specialized functions
  getSuggestions: () => Promise<string>;
  getDailyPlan: () => Promise<string>;
  getAnalysis: () => Promise<string>;
  getMotivation: () => Promise<string>;
  
  // Utility functions
  testProvider: (provider?: AIProvider) => Promise<{ provider: AIProvider; status: string; response?: string }>;
  checkHealth: () => Promise<{ status: string; providers: { langchain: boolean; openrouter: boolean } }>;
  
  // Clear error
  clearError: () => void;
}

/**
 * Hook for interacting with the organizer agent
 */
export function useOrganizerAgent(): UseOrganizerAgentReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Chat with the organizer agent
   */
  const chat = useCallback(async (message: string, options?: Omit<ChatRequest, 'message'>) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await organizerAgentAPI.chatWithOrganizer({
        message,
        ...options,
      });
      return response.response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to chat with organizer';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Get organization suggestions
   */
  const getSuggestions = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await organizerAgentAPI.getOrganizationSuggestions();
      return response.suggestions;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get suggestions';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Get daily task plan
   */
  const getDailyPlan = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await organizerAgentAPI.getDailyTaskPlan();
      return response.plan;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get daily plan';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Get productivity analysis
   */
  const getAnalysis = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await organizerAgentAPI.getProductivityAnalysis();
      return response.analysis;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get analysis';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Get motivational message
   */
  const getMotivation = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await organizerAgentAPI.getMotivation();
      return response.motivation;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get motivation';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Test AI provider connectivity
   */
  const testProvider = useCallback(async (provider?: AIProvider) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await organizerAgentAPI.testAIProvider(provider);
      return response.testResult;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to test provider';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Check organizer agent health
   */
  const checkHealth = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await organizerAgentAPI.checkHealth();
      return {
        status: response.status,
        providers: response.providers,
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to check health';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    chat,
    getSuggestions,
    getDailyPlan,
    getAnalysis,
    getMotivation,
    testProvider,
    checkHealth,
    clearError,
  };
}

export default useOrganizerAgent;

