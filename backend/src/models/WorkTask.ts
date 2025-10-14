import mongoose, { Document, Schema } from 'mongoose';
import { IBaseTask, TaskType, BaseTaskSchema } from './BaseTask';

// ---------- WORK TASK INTERFACE ----------
export interface IWorkTask extends IBaseTask {
  // Work-specific fields
  workCategory: 'development' | 'design' | 'marketing' | 'sales' | 'hr' | 'finance' | 'operations' | 'research' | 'other';
  department?: string;
  manager?: mongoose.Types.ObjectId;
  client?: string;
  projectCode?: string;
  billableHours?: number;
  hourlyRate?: number;
  workPriority: 'low' | 'medium' | 'high' | 'critical';
  deadline: Date; // Required for work tasks
  workStatus: 'not_started' | 'in_progress' | 'review' | 'approved' | 'completed';
  blockers?: string[];
  dependencies?: mongoose.Types.ObjectId[];
  deliverables?: string[];
  workNotes?: string;
  timeTracking?: {
    startTime?: Date;
    endTime?: Date;
    breakTime?: number; // in minutes
    totalTime?: number; // in minutes
  };
  qualityScore?: number; // 1-10 rating
  feedback?: string;
}

// ---------- WORK TASK SCHEMA ----------
const WorkTaskSchema = new Schema<IWorkTask>({
  // Inherit all base task fields
  ...BaseTaskSchema.obj,
  
  // Work-specific fields
  workCategory: {
    type: String,
    enum: ['development', 'design', 'marketing', 'sales', 'hr', 'finance', 'operations', 'research', 'other'],
    required: [true, 'Please specify the work category'],
    default: 'other'
  },
  department: {
    type: String,
    trim: true,
    maxlength: [50, 'Department cannot be more than 50 characters']
  },
  manager: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  client: {
    type: String,
    trim: true,
    maxlength: [100, 'Client name cannot be more than 100 characters']
  },
  projectCode: {
    type: String,
    trim: true,
    maxlength: [20, 'Project code cannot be more than 20 characters']
  },
  billableHours: {
    type: Number,
    min: [0, 'Billable hours cannot be negative']
  },
  hourlyRate: {
    type: Number,
    min: [0, 'Hourly rate cannot be negative']
  },
  workPriority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    required: [true, 'Please specify work priority'],
    default: 'medium'
  },
  deadline: {
    type: Date,
    required: [true, 'Deadline is required for work tasks']
  },
  workStatus: {
    type: String,
    enum: ['not_started', 'in_progress', 'review', 'approved', 'completed'],
    default: 'not_started'
  },
  blockers: [{
    type: String,
    trim: true,
    maxlength: [200, 'Blocker description cannot be more than 200 characters']
  }],
  dependencies: [{
    type: Schema.Types.ObjectId,
    ref: 'WorkTask'
  }],
  deliverables: [{
    type: String,
    trim: true,
    maxlength: [200, 'Deliverable cannot be more than 200 characters']
  }],
  workNotes: {
    type: String,
    trim: true,
    maxlength: [1000, 'Work notes cannot be more than 1000 characters']
  },
  timeTracking: {
    startTime: {
      type: Date
    },
    endTime: {
      type: Date
    },
    breakTime: {
      type: Number,
      min: [0, 'Break time cannot be negative']
    },
    totalTime: {
      type: Number,
      min: [0, 'Total time cannot be negative']
    }
  },
  qualityScore: {
    type: Number,
    min: [1, 'Quality score must be at least 1'],
    max: [10, 'Quality score cannot be more than 10']
  },
  feedback: {
    type: String,
    trim: true,
    maxlength: [500, 'Feedback cannot be more than 500 characters']
  }
}, {
  timestamps: true
});

// Set default taskType
WorkTaskSchema.add({ taskType: { type: String, default: TaskType.WORK } });

// Work-specific indexes
WorkTaskSchema.index({ assignee: 1, workCategory: 1 });
WorkTaskSchema.index({ assignee: 1, workStatus: 1 });
WorkTaskSchema.index({ deadline: 1 });
WorkTaskSchema.index({ projectCode: 1 });
WorkTaskSchema.index({ manager: 1 });

// Virtual for calculating total cost
WorkTaskSchema.virtual('totalCost').get(function() {
  if (!this.billableHours || !this.hourlyRate) return 0;
  return this.billableHours * this.hourlyRate;
});

// Virtual for checking if work task is overdue
WorkTaskSchema.virtual('isOverdue').get(function() {
  return this.deadline && this.deadline < new Date() && this.workStatus !== 'completed';
});

// Virtual for calculating work efficiency
WorkTaskSchema.virtual('workEfficiency').get(function() {
  if (!this.estimatedDuration || !this.timeTracking?.totalTime) return null;
  return (this.estimatedDuration / this.timeTracking.totalTime) * 100;
});

// Method to start time tracking
WorkTaskSchema.methods['startTimeTracking'] = function() {
  this.timeTracking.startTime = new Date();
  this.workStatus = 'in_progress';
  return this['save']();
};

// Method to stop time tracking
WorkTaskSchema.methods['stopTimeTracking'] = function() {
  if (this.timeTracking.startTime) {
    this.timeTracking.endTime = new Date();
    const duration = this.timeTracking.endTime.getTime() - this.timeTracking.startTime.getTime();
    this.timeTracking.totalTime = Math.round(duration / (1000 * 60)); // Convert to minutes
  }
  return this['save']();
};

// Method to add blocker
WorkTaskSchema.methods['addBlocker'] = function(blocker: string) {
  if (!this.blockers.includes(blocker)) {
    this.blockers.push(blocker);
  }
  return this['save']();
};

// Method to remove blocker
WorkTaskSchema.methods['removeBlocker'] = function(blocker: string) {
  this.blockers = this.blockers.filter(b => b !== blocker);
  return this['save']();
};

const WorkTask = mongoose.model<IWorkTask>('WorkTask', WorkTaskSchema);
export default WorkTask;
