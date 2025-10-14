// Task Models Index - Centralized exports for all task types
export { TaskType, TaskPriority, TaskStatus } from './BaseTask';
export type { IBaseTask, BaseTask } from './BaseTask';

// Common Types
export * from './Common';

// Individual Task Models - Import and re-export
export type { IFoodTask, FoodTask } from './FoodTask';
export type { IHomeworkTask, HomeworkTask } from './HomeworkTask';
export type { IEmailTask, EmailTask } from './EmailTask';
export type { IMeetingTask, MeetingTask } from './MeetingTask';
export type { IProjectTask, ProjectTask } from './ProjectTask';
export type { ITask, Task } from './Task';
export type { IWorkTask, WorkTask } from './WorkTask';
export type { IPersonalTask, PersonalTask } from './PersonalTask';
export type { IHealthTask, HealthTask } from './HealthTask';
export type { ISocialTask, SocialTask } from './SocialTask';

// User Models
export { LifeCategory } from './User';
export type { 
  IUser, 
  User, 
  ILevelProgress, 
  LevelProgress, 
  IMetric, 
  Metric, 
  IIntegration, 
  Integration,
  IUserPreferences,
  UserPreferences,
  IUserTasks,
  UserTasks,
  ICalendarEvent,
  CalendarEvent,
  IUserFinances,
  UserFinances,
  IAgentMemory,
  AgentMemory,
  IFriendRequests,
  FriendRequests
} from './User';

// Import types for union types
import type { IFoodTask } from './FoodTask';
import type { IHomeworkTask } from './HomeworkTask';
import type { IEmailTask } from './EmailTask';
import type { IMeetingTask } from './MeetingTask';
import type { IProjectTask } from './ProjectTask';
import type { ITask } from './Task';
import type { IWorkTask } from './WorkTask';
import type { IPersonalTask } from './PersonalTask';
import type { IHealthTask } from './HealthTask';
import type { ISocialTask } from './SocialTask';
import { TaskType } from './BaseTask';

// Union type for all task interfaces
export type AnyTask = 
  | IFoodTask 
  | IHomeworkTask 
  | IEmailTask 
  | IMeetingTask 
  | IProjectTask 
  | ITask 
  | IWorkTask
  | IPersonalTask
  | IHealthTask
  | ISocialTask;

// Import frontend types for union types
import type { FoodTask } from './FoodTask';
import type { HomeworkTask } from './HomeworkTask';
import type { EmailTask } from './EmailTask';
import type { MeetingTask } from './MeetingTask';
import type { ProjectTask } from './ProjectTask';
import type { Task } from './Task';
import type { WorkTask } from './WorkTask';
import type { PersonalTask } from './PersonalTask';
import type { HealthTask } from './HealthTask';
import type { SocialTask } from './SocialTask';

// Union type for all frontend task types
export type AnyFrontendTask = 
  | FoodTask 
  | HomeworkTask 
  | EmailTask 
  | MeetingTask 
  | ProjectTask 
  | Task 
  | WorkTask
  | PersonalTask
  | HealthTask
  | SocialTask;

// Task type mapping for dynamic type selection
export const TaskTypeMapping = {
  [TaskType.FOOD]: 'FoodTask',
  [TaskType.HOMEWORK]: 'HomeworkTask',
  [TaskType.EMAIL]: 'EmailTask',
  [TaskType.MEETING]: 'MeetingTask',
  [TaskType.PROJECT]: 'ProjectTask',
  [TaskType.PERSONAL]: 'PersonalTask',
  [TaskType.WORK]: 'WorkTask',
  [TaskType.HEALTH]: 'HealthTask',
  [TaskType.SOCIAL]: 'SocialTask',
  [TaskType.OTHER]: 'Task',
} as const;