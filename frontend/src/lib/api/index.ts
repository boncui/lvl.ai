// Main API client
export { default as apiClient } from './client';

// User API
export { UserAPI } from './users';

// Task APIs
export { default as TasksAPI } from './tasks';
export { default as FoodTasksAPI } from './foodTasks';
export { default as HomeworkTasksAPI } from './homeworkTasks';
export { default as EmailTasksAPI } from './emailTasks';
export { default as MeetingTasksAPI } from './meetingTasks';
export { default as ProjectTasksAPI } from './projectTasks';
export { default as WorkTasksAPI } from './workTasks';

// Friends API
export { default as FriendsAPI } from './friends';

// Hooks
export { useCurrentUserAPI, useAdminUserAPI } from '../../hooks/useUserAPI';
export {
  useTasksAPI,
  useFoodTasksAPI,
  useHomeworkTasksAPI,
  useEmailTasksAPI,
  useMeetingTasksAPI,
  useProjectTasksAPI,
  useWorkTasksAPI,
  useFriendsAPI,
  useAllTaskAPIs,
} from '../../hooks/useTaskAPIs';

// Re-export types for convenience
export type {
  ApiResponse,
  PaginatedResponse,
  User,
  BaseTask,
  Metric,
  LevelProgress,
  UserProfileFormData,
  LoginFormData,
  RegisterFormData,
  TaskFormData,
  FriendRequests,
} from '../../types';

// Re-export task-specific types
export type {
  FoodTask,
  FoodTaskStats,
  IngredientSearchResult,
  NutritionalDensity,
} from './foodTasks';

export type {
  HomeworkTask,
  HomeworkTaskStats,
  StudyEfficiency,
  SubjectSearchResult,
} from './homeworkTasks';

export type {
  EmailTask,
  EmailTaskStats,
  EmailStatus,
  RecipientSearchResult,
} from './emailTasks';

export type {
  MeetingTask,
  MeetingTaskStats,
  MeetingEfficiency,
  AttendeeSearchResult,
} from './meetingTasks';

export type {
  ProjectTask,
  ProjectTaskStats,
  ProjectProgress,
  ProjectSearchResult,
} from './projectTasks';

export type {
  WorkTask,
  WorkTaskStats,
} from './workTasks';

export type {
  PersonalTask,
  HealthTask,
  SocialTask,
  OtherTask,
  TaskStats,
  PersonalTaskStats,
  MoodTrackingData,
  CategorySearchResult,
} from './tasks';
