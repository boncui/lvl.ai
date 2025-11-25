import { useAuth } from '@/contexts/AuthContext';
import { TaskAPI } from '@/lib/api';

// Simplified hook for tasks
export function useTasksAPI() {
  const { user } = useAuth();
  
  if (!user) {
    return {
      getAllTasks: () => Promise.reject(new Error('User not authenticated')),
      getTaskStats: () => Promise.reject(new Error('User not authenticated')),
      createTask: () => Promise.reject(new Error('User not authenticated')),
      getTaskById: () => Promise.reject(new Error('User not authenticated')),
      updateTask: () => Promise.reject(new Error('User not authenticated')),
      deleteTask: () => Promise.reject(new Error('User not authenticated')),
      getUpcomingTasks: () => Promise.reject(new Error('User not authenticated')),
      getOverdueTasks: () => Promise.reject(new Error('User not authenticated')),
      completeTask: () => Promise.reject(new Error('User not authenticated')),
      getTasksByStatus: () => Promise.reject(new Error('User not authenticated')),
      getTasksByPriority: () => Promise.reject(new Error('User not authenticated')),
      getTasksByTag: () => Promise.reject(new Error('User not authenticated')),
      getPendingTasks: () => Promise.reject(new Error('User not authenticated')),
      getInProgressTasks: () => Promise.reject(new Error('User not authenticated')),
      getCompletedTasks: () => Promise.reject(new Error('User not authenticated')),
      getCancelledTasks: () => Promise.reject(new Error('User not authenticated')),
      searchTasks: () => [],
      filterTasksByTags: () => [],
      filterTasksByDateRange: () => [],
      sortTasks: () => [],
    };
  }

  return TaskAPI;
}

// Combined hook for all APIs
export function useAllAPIs() {
  return {
    tasks: useTasksAPI(),
  };
}

// Backward compatibility exports (will be removed in future)
export const useFoodTasksAPI = useTasksAPI;
export const useHomeworkTasksAPI = useTasksAPI;
export const useEmailTasksAPI = useTasksAPI;
export const useMeetingTasksAPI = useTasksAPI;
export const useProjectTasksAPI = useTasksAPI;
export const useWorkTasksAPI = useTasksAPI;
export const useHealthTasksAPI = useTasksAPI;
export const useAllTaskAPIs = useAllAPIs;
