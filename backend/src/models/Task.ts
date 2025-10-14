import mongoose, { Schema } from 'mongoose';
import { IBaseTask, TaskType, BaseTaskSchema } from './BaseTask';

// ---------- GENERAL TASK INTERFACE ----------
export interface ITask extends IBaseTask {
  // All fields are inherited from IBaseTask
}

// ---------- GENERAL TASK SCHEMA ----------
const TaskSchema = new Schema<ITask>({
  // Inherit all base task fields
  ...BaseTaskSchema.obj,
}, {
  timestamps: true
});

// Set default taskType
TaskSchema.add({ taskType: { type: String, default: TaskType.OTHER } });

const Task = mongoose.model<ITask>('Task', TaskSchema);
export default Task;
