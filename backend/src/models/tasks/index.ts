// Task Models Index - Centralized exports for all task types
export { TaskType, TaskPriority, TaskStatus, IBaseTask, BaseTaskSchema } from './BaseTask';

// Individual Task Models
export { IFoodTask, default as FoodTask } from './FoodTask';
export { IHomeworkTask, default as HomeworkTask } from './HomeworkTask';
export { IEmailTask, default as EmailTask } from './EmailTask';
export { IMeetingTask, default as MeetingTask } from './MeetingTask';
export { IProjectTask, default as ProjectTask } from './ProjectTask';
export { IPersonalTask, default as PersonalTask } from './PersonalTask';
export { IWorkTask, default as WorkTask } from './WorkTask';
export { IHealthTask, default as HealthTask } from './HealthTask';
export { ISocialTask, default as SocialTask } from './SocialTask';
export { IOtherTask, default as OtherTask } from './OtherTask';

// Union type for all task interfaces
export type AnyTask = 
  | IFoodTask 
  | IHomeworkTask 
  | IEmailTask 
  | IMeetingTask 
  | IProjectTask 
  | IPersonalTask 
  | IWorkTask 
  | IHealthTask 
  | ISocialTask 
  | IOtherTask;

// Task model mapping for dynamic model selection
export const TaskModels = {
  [TaskType.FOOD]: FoodTask,
  [TaskType.HOMEWORK]: HomeworkTask,
  [TaskType.EMAIL]: EmailTask,
  [TaskType.MEETING]: MeetingTask,
  [TaskType.PROJECT]: ProjectTask,
  [TaskType.PERSONAL]: PersonalTask,
  [TaskType.WORK]: WorkTask,
  [TaskType.HEALTH]: HealthTask,
  [TaskType.SOCIAL]: SocialTask,
  [TaskType.OTHER]: OtherTask,
} as const;

// Helper function to get task model by type
export const getTaskModel = (taskType: TaskType) => {
  return TaskModels[taskType];
};

// Helper function to create task by type
export const createTaskByType = async (taskType: TaskType, taskData: any) => {
  const Model = getTaskModel(taskType);
  const task = new Model({ ...taskData, taskType });
  return await task.save();
};

// Helper function to query tasks by type
export const getTasksByType = async (taskType: TaskType, query: any = {}) => {
  const Model = getTaskModel(taskType);
  return await Model.find(query);
};
