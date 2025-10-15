// Task Models Index - Centralized exports for all task types
import { TaskType, TaskPriority, TaskStatus, IBaseTask, BaseTaskSchema } from '../BaseTask';
export { TaskType, TaskPriority, TaskStatus, IBaseTask, BaseTaskSchema };

// Individual Task Models - Import and re-export
import FoodTask, { IFoodTask } from '../FoodTask';
import HomeworkTask, { IHomeworkTask } from '../HomeworkTask';
import EmailTask, { IEmailTask } from '../EmailTask';
import MeetingTask, { IMeetingTask } from '../MeetingTask';
import ProjectTask, { IProjectTask } from '../ProjectTask';
import Task, { ITask } from '../Task';
import WorkTask, { IWorkTask } from '../WorkTask';
import HealthTask, { IHealthTask } from '../HealthTask';

export { IFoodTask, FoodTask };
export { IHomeworkTask, HomeworkTask };
export { IEmailTask, EmailTask };
export { IMeetingTask, MeetingTask };
export { IProjectTask, ProjectTask };
export { ITask, Task };
export { IWorkTask, WorkTask };
export { IHealthTask, HealthTask };

// Union type for all task interfaces
export type AnyTask = 
  | IFoodTask 
  | IHomeworkTask 
  | IEmailTask 
  | IMeetingTask 
  | IProjectTask 
  | ITask 
  | IWorkTask
  | IHealthTask;

// Task model mapping for dynamic model selection
export const TaskModels = {
  [TaskType.FOOD]: FoodTask,
  [TaskType.HOMEWORK]: HomeworkTask,
  [TaskType.EMAIL]: EmailTask,
  [TaskType.MEETING]: MeetingTask,
  [TaskType.PROJECT]: ProjectTask,
  [TaskType.PERSONAL]: Task,
  [TaskType.WORK]: WorkTask,
  [TaskType.HEALTH]: HealthTask,
} as const;
