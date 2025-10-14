import { useAuth } from '@/contexts/AuthContext';
import {
  TasksAPI,
  FoodTasksAPI,
  HomeworkTasksAPI,
  EmailTasksAPI,
  MeetingTasksAPI,
  ProjectTasksAPI,
  WorkTasksAPI,
  FriendsAPI,
} from '@/lib/api';

// Hook for general tasks
export function useTasksAPI() {
  const { user } = useAuth();
  
  if (!user) {
    return {
      getAllTasks: () => Promise.reject(new Error('User not authenticated')),
      getTaskStats: () => Promise.reject(new Error('User not authenticated')),
      createTask: () => Promise.reject(new Error('User not authenticated')),
      getTask: () => Promise.reject(new Error('User not authenticated')),
      updateTask: () => Promise.reject(new Error('User not authenticated')),
      deleteTask: () => Promise.reject(new Error('User not authenticated')),
      getTasksByType: () => Promise.reject(new Error('User not authenticated')),
      getPersonalTaskStats: () => Promise.reject(new Error('User not authenticated')),
      searchPersonalCategories: () => Promise.reject(new Error('User not authenticated')),
      getMoodTrackingData: () => Promise.reject(new Error('User not authenticated')),
    };
  }

  return TasksAPI;
}

// Hook for food tasks
export function useFoodTasksAPI() {
  const { user } = useAuth();
  
  if (!user) {
    return {
      getFoodTasks: () => Promise.reject(new Error('User not authenticated')),
      getFoodTaskStats: () => Promise.reject(new Error('User not authenticated')),
      createFoodTask: () => Promise.reject(new Error('User not authenticated')),
      getFoodTask: () => Promise.reject(new Error('User not authenticated')),
      updateFoodTask: () => Promise.reject(new Error('User not authenticated')),
      deleteFoodTask: () => Promise.reject(new Error('User not authenticated')),
      addIngredients: () => Promise.reject(new Error('User not authenticated')),
      updateAISuggestions: () => Promise.reject(new Error('User not authenticated')),
      getNutritionalDensity: () => Promise.reject(new Error('User not authenticated')),
      searchIngredients: () => Promise.reject(new Error('User not authenticated')),
    };
  }

  return FoodTasksAPI;
}

// Hook for homework tasks
export function useHomeworkTasksAPI() {
  const { user } = useAuth();
  
  if (!user) {
    return {
      getHomeworkTasks: () => Promise.reject(new Error('User not authenticated')),
      getHomeworkTaskStats: () => Promise.reject(new Error('User not authenticated')),
      createHomeworkTask: () => Promise.reject(new Error('User not authenticated')),
      getHomeworkTask: () => Promise.reject(new Error('User not authenticated')),
      updateHomeworkTask: () => Promise.reject(new Error('User not authenticated')),
      deleteHomeworkTask: () => Promise.reject(new Error('User not authenticated')),
      addMaterials: () => Promise.reject(new Error('User not authenticated')),
      addGroupMembers: () => Promise.reject(new Error('User not authenticated')),
      updateStudyTime: () => Promise.reject(new Error('User not authenticated')),
      getStudyEfficiency: () => Promise.reject(new Error('User not authenticated')),
      searchSubjects: () => Promise.reject(new Error('User not authenticated')),
      getUpcomingTasks: () => Promise.reject(new Error('User not authenticated')),
    };
  }

  return HomeworkTasksAPI;
}

// Hook for email tasks
export function useEmailTasksAPI() {
  const { user } = useAuth();
  
  if (!user) {
    return {
      getEmailTasks: () => Promise.reject(new Error('User not authenticated')),
      getEmailTaskStats: () => Promise.reject(new Error('User not authenticated')),
      createEmailTask: () => Promise.reject(new Error('User not authenticated')),
      getEmailTask: () => Promise.reject(new Error('User not authenticated')),
      updateEmailTask: () => Promise.reject(new Error('User not authenticated')),
      deleteEmailTask: () => Promise.reject(new Error('User not authenticated')),
      markAsSent: () => Promise.reject(new Error('User not authenticated')),
      markReplyReceived: () => Promise.reject(new Error('User not authenticated')),
      scheduleFollowUp: () => Promise.reject(new Error('User not authenticated')),
      getEmailStatus: () => Promise.reject(new Error('User not authenticated')),
      searchRecipients: () => Promise.reject(new Error('User not authenticated')),
      getFollowUpsNeeded: () => Promise.reject(new Error('User not authenticated')),
      getOverdueTasks: () => Promise.reject(new Error('User not authenticated')),
    };
  }

  return EmailTasksAPI;
}

// Hook for meeting tasks
export function useMeetingTasksAPI() {
  const { user } = useAuth();
  
  if (!user) {
    return {
      getMeetingTasks: () => Promise.reject(new Error('User not authenticated')),
      getMeetingTaskStats: () => Promise.reject(new Error('User not authenticated')),
      createMeetingTask: () => Promise.reject(new Error('User not authenticated')),
      getMeetingTask: () => Promise.reject(new Error('User not authenticated')),
      updateMeetingTask: () => Promise.reject(new Error('User not authenticated')),
      deleteMeetingTask: () => Promise.reject(new Error('User not authenticated')),
      addAttendees: () => Promise.reject(new Error('User not authenticated')),
      addActionItems: () => Promise.reject(new Error('User not authenticated')),
      completeActionItem: () => Promise.reject(new Error('User not authenticated')),
      getMeetingEfficiency: () => Promise.reject(new Error('User not authenticated')),
      getHappeningNow: () => Promise.reject(new Error('User not authenticated')),
      getUpcomingTasks: () => Promise.reject(new Error('User not authenticated')),
      searchAttendees: () => Promise.reject(new Error('User not authenticated')),
    };
  }

  return MeetingTasksAPI;
}

// Hook for project tasks
export function useProjectTasksAPI() {
  const { user } = useAuth();
  
  if (!user) {
    return {
      getProjectTasks: () => Promise.reject(new Error('User not authenticated')),
      getProjectTaskStats: () => Promise.reject(new Error('User not authenticated')),
      createProjectTask: () => Promise.reject(new Error('User not authenticated')),
      getProjectTask: () => Promise.reject(new Error('User not authenticated')),
      updateProjectTask: () => Promise.reject(new Error('User not authenticated')),
      deleteProjectTask: () => Promise.reject(new Error('User not authenticated')),
      addMilestones: () => Promise.reject(new Error('User not authenticated')),
      completeMilestone: () => Promise.reject(new Error('User not authenticated')),
      addTeamMembers: () => Promise.reject(new Error('User not authenticated')),
      addDependencies: () => Promise.reject(new Error('User not authenticated')),
      getProjectProgress: () => Promise.reject(new Error('User not authenticated')),
      searchProjects: () => Promise.reject(new Error('User not authenticated')),
      getOverdueMilestones: () => Promise.reject(new Error('User not authenticated')),
    };
  }

  return ProjectTasksAPI;
}

// Hook for work tasks
export function useWorkTasksAPI() {
  const { user } = useAuth();
  
  if (!user) {
    return {
      getWorkTasks: () => Promise.reject(new Error('User not authenticated')),
      getWorkTaskStats: () => Promise.reject(new Error('User not authenticated')),
      createWorkTask: () => Promise.reject(new Error('User not authenticated')),
      getWorkTask: () => Promise.reject(new Error('User not authenticated')),
      updateWorkTask: () => Promise.reject(new Error('User not authenticated')),
      deleteWorkTask: () => Promise.reject(new Error('User not authenticated')),
    };
  }

  return WorkTasksAPI;
}

// Hook for friends
export function useFriendsAPI() {
  const { user } = useAuth();
  
  if (!user) {
    return {
      sendFriendRequest: () => Promise.reject(new Error('User not authenticated')),
      acceptFriendRequest: () => Promise.reject(new Error('User not authenticated')),
      declineFriendRequest: () => Promise.reject(new Error('User not authenticated')),
      getFriends: () => Promise.reject(new Error('User not authenticated')),
      getPendingRequests: () => Promise.reject(new Error('User not authenticated')),
      getSentRequests: () => Promise.reject(new Error('User not authenticated')),
      removeFriend: () => Promise.reject(new Error('User not authenticated')),
      blockUser: () => Promise.reject(new Error('User not authenticated')),
      unblockUser: () => Promise.reject(new Error('User not authenticated')),
    };
  }

  return FriendsAPI;
}

// Combined hook for all task APIs
export function useAllTaskAPIs() {
  return {
    tasks: useTasksAPI(),
    foodTasks: useFoodTasksAPI(),
    homeworkTasks: useHomeworkTasksAPI(),
    emailTasks: useEmailTasksAPI(),
    meetingTasks: useMeetingTasksAPI(),
    projectTasks: useProjectTasksAPI(),
    workTasks: useWorkTasksAPI(),
    friends: useFriendsAPI(),
  };
}
