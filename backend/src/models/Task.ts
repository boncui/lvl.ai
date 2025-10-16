import mongoose, { Schema, Document } from 'mongoose';

// ---------- ENUMS ----------
export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

export enum TaskStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

// ---------- TASK INTERFACE ----------
export interface ITask extends Document {
  // Core fields
  title: string;
  description?: string;
  priority: TaskPriority;
  status: TaskStatus;
  
  // Time fields
  taskTime?: Date; // When the task is occurring/scheduled
  dueDate?: Date; // When the task is due
  completedAt?: Date;
  
  // Points/XP
  points: number;
  
  // Organization
  tags: string[];
  
  // User relationship
  userId: mongoose.Types.ObjectId; // User who owns the task
  
  // Timestamps (createdAt = time of conception, updatedAt)
  createdAt: Date;
  updatedAt: Date;
}

// ---------- TASK SCHEMA ----------
const TaskSchema = new Schema<ITask>(
  {
    title: {
      type: String,
      required: [true, 'Please add a task title'],
      trim: true,
      maxlength: [200, 'Title cannot be more than 200 characters']
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Description cannot be more than 1000 characters']
    },
    priority: {
      type: String,
      enum: Object.values(TaskPriority),
      default: TaskPriority.MEDIUM
    },
    status: {
      type: String,
      enum: Object.values(TaskStatus),
      default: TaskStatus.PENDING
    },
    taskTime: {
      type: Date
    },
    dueDate: {
      type: Date
    },
    completedAt: {
      type: Date
    },
    points: {
      type: Number,
      default: 10,
      min: [0, 'Points cannot be negative']
    },
    tags: [{
      type: String,
      trim: true,
      maxlength: [50, 'Tag cannot be more than 50 characters']
    }],
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  { 
    timestamps: true // Automatically adds createdAt and updatedAt
  }
);

// Indexes for better query performance
TaskSchema.index({ userId: 1, status: 1 });
TaskSchema.index({ dueDate: 1 });
TaskSchema.index({ taskTime: 1 });
TaskSchema.index({ priority: 1 });
TaskSchema.index({ tags: 1 });
TaskSchema.index({ createdAt: -1 });

// Virtual for checking if task is overdue
TaskSchema.virtual('isOverdue').get(function() {
  return this.dueDate && this.dueDate < new Date() && this.status !== TaskStatus.COMPLETED;
});

// Pre-save middleware to set completedAt when status changes to completed
TaskSchema.pre('save', function(next) {
  if (this.isModified('status') && this.status === TaskStatus.COMPLETED && !this.completedAt) {
    this.completedAt = new Date();
  }
  next();
});

const Task = mongoose.model<ITask>('Task', TaskSchema);
export default Task;
