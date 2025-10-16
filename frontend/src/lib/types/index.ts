// Simplified Task Models Index - Centralized exports

// Task Types
export { TaskPriority, TaskStatus } from './Task';
export type { 
  ITask,
  Task,
  CreateTaskDTO,
  UpdateTaskDTO,
  TaskFilters,
  TaskStats,
  TaskResponse,
  TasksResponse,
  TaskStatsResponse,
  TaskCompleteResponse
} from './Task';

// Task Helper Functions
export { parseTaskDates, isOverdue, isUpcoming } from './Task';

// Common Types
export * from './Common';

// User Models
export type { 
  IUser, 
  User,
  UserPreferences,
  FriendRequests,
  RegisterUserDTO,
  LoginUserDTO,
  UpdateUserDTO,
  UpdatePasswordDTO,
  UserResponse,
  AuthResponse
} from './User';

// User Helper Functions
export { parseUserDates, getNextLevelXP, getXPProgress, canLevelUp } from './User';

// Backward compatibility - Legacy exports (will be removed in future)
// These are here temporarily to prevent breaking changes
export { TaskPriority as TaskPriorityLegacy, TaskStatus as TaskStatusLegacy } from './Task';
export type { ITask as BaseTask } from './Task';
