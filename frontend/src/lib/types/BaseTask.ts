// Base Task Types for backward compatibility

export enum TaskType {
  FOOD = 'food',
  HOMEWORK = 'homework',
  EMAIL = 'email',
  MEETING = 'meeting',
  PROJECT = 'project',
  PERSONAL = 'personal',
  WORK = 'work',
  HEALTH = 'health',
  SOCIAL = 'social',
  OTHER = 'other',
}

// Re-export from Task.ts for compatibility
export { TaskPriority, TaskStatus } from './Task';

