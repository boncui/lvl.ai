import mongoose, { Schema } from 'mongoose';
import { IBaseTask, TaskType } from './BaseTask';

// ---------- HEALTH TASK INTERFACE ----------
export interface IHealthTask extends IBaseTask {
  // Health-specific fields
  healthCategory: 'exercise' | 'medical' | 'mental_health' | 'nutrition' | 'sleep';
  mood?: string;
  painLevel?: number; // 1-10 scale
  healthNotes?: string;
  symptoms?: string[];
  medications?: string[];
  vitals?: {
    bloodPressure?: string;
    heartRate?: number;
    temperature?: number;
    weight?: number;
    height?: number;
  };
  exerciseType?: string;
  duration?: number; // in minutes
  intensity?: 'low' | 'medium' | 'high';
  caloriesBurned?: number;
  sleepQuality?: 1 | 2 | 3 | 4 | 5; // Poor to Excellent
  sleepDuration?: number; // in hours
  doctorName?: string;
  appointmentDate?: Date;
  followUpRequired?: boolean;
  aiInsights?: {
    recommendation?: string;
    warning?: string;
    trend?: string;
  };
}

// ---------- HEALTH TASK SCHEMA ----------
const HealthTaskSchema = new Schema({
  // Base task fields
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
  taskType: {
    type: String,
    enum: Object.values(TaskType),
    required: [true, 'Please specify task type'],
    default: TaskType.HEALTH
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'completed', 'cancelled'],
    default: 'pending'
  },
  dueDate: {
    type: Date
  },
  startDate: {
    type: Date
  },
  completedAt: {
    type: Date
  },
  estimatedDuration: {
    type: Number,
    min: [1, 'Duration must be at least 1 minute']
  },
  actualDuration: {
    type: Number,
    min: [1, 'Duration must be at least 1 minute']
  },
  tags: [{
    type: String,
    trim: true
  }],
  assignee: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Please specify task assignee']
  },
  assignedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  collaborators: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  parentTask: {
    type: Schema.Types.ObjectId,
    ref: 'HealthTask'
  },
  subtasks: [{
    type: Schema.Types.ObjectId,
    ref: 'HealthTask'
  }],
  location: {
    type: String,
    trim: true
  },
  xpValue: {
    type: Number,
    default: 10,
    min: [1, 'XP value must be at least 1']
  },
  notes: [{
    content: {
      type: String,
      required: true,
      trim: true
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  reminders: [{
    date: {
      type: Date,
      required: true
    },
    message: {
      type: String,
      required: true,
      trim: true
    },
    isSent: {
      type: Boolean,
      default: false
    }
  }],
  attachments: [{
    filename: {
      type: String,
      required: true
    },
    url: {
      type: String,
      required: true
    },
    uploadedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],

  // Health-specific fields
  healthCategory: {
    type: String,
    enum: ['exercise', 'medical', 'mental_health', 'nutrition', 'sleep'],
    required: [true, 'Please specify health category']
  },
  mood: {
    type: String,
    trim: true
  },
  painLevel: {
    type: Number,
    min: [1, 'Pain level must be at least 1'],
    max: [10, 'Pain level cannot exceed 10']
  },
  healthNotes: {
    type: String,
    trim: true,
    maxlength: [2000, 'Health notes cannot exceed 2000 characters']
  },
  symptoms: [{
    type: String,
    trim: true
  }],
  medications: [{
    type: String,
    trim: true
  }],
  vitals: {
    bloodPressure: {
      type: String,
      trim: true
    },
    heartRate: {
      type: Number,
      min: [30, 'Heart rate must be at least 30'],
      max: [200, 'Heart rate cannot exceed 200']
    },
    temperature: {
      type: Number,
      min: [95, 'Temperature must be at least 95°F'],
      max: [110, 'Temperature cannot exceed 110°F']
    },
    weight: {
      type: Number,
      min: [50, 'Weight must be at least 50 lbs'],
      max: [500, 'Weight cannot exceed 500 lbs']
    },
    height: {
      type: Number,
      min: [36, 'Height must be at least 36 inches'],
      max: [84, 'Height cannot exceed 84 inches']
    }
  },
  exerciseType: {
    type: String,
    trim: true
  },
  duration: {
    type: Number,
    min: [1, 'Duration must be at least 1 minute']
  },
  intensity: {
    type: String,
    enum: ['low', 'medium', 'high']
  },
  caloriesBurned: {
    type: Number,
    min: [0, 'Calories burned cannot be negative']
  },
  sleepQuality: {
    type: Number,
    enum: [1, 2, 3, 4, 5]
  },
  sleepDuration: {
    type: Number,
    min: [0, 'Sleep duration cannot be negative'],
    max: [24, 'Sleep duration cannot exceed 24 hours']
  },
  doctorName: {
    type: String,
    trim: true
  },
  appointmentDate: {
    type: Date
  },
  followUpRequired: {
    type: Boolean,
    default: false
  },
  aiInsights: {
    recommendation: {
      type: String,
      trim: true
    },
    warning: {
      type: String,
      trim: true
    },
    trend: {
      type: String,
      trim: true
    }
  }
}, {
  timestamps: true
});

// Indexes for better query performance
HealthTaskSchema.index({ assignee: 1, status: 1 });
HealthTaskSchema.index({ assignee: 1, healthCategory: 1 });
HealthTaskSchema.index({ assignee: 1, dueDate: 1 });
HealthTaskSchema.index({ assignee: 1, createdAt: -1 });

// Virtual for checking if task is overdue
HealthTaskSchema.virtual('isOverdue').get(function() {
  return this.dueDate && this.dueDate < new Date() && this.status !== 'completed';
});

// Method to mark task as completed
HealthTaskSchema.methods['markAsCompleted'] = function() {
  (this as any).status = 'completed';
  (this as any).completedAt = new Date();
  return (this as any).save();
};

// Method to add a note
HealthTaskSchema.methods['addNote'] = function(content: string, userId: string) {
  (this as any).notes.push({
    content,
    createdBy: userId,
    createdAt: new Date()
  });
  return (this as any).save();
};

// Method to add a reminder
HealthTaskSchema.methods['addReminder'] = function(date: Date, message: string) {
  (this as any).reminders.push({
    date,
    message,
    isSent: false
  });
  return (this as any).save();
};

// Method to add a collaborator
HealthTaskSchema.methods['addCollaborator'] = function(userId: string) {
  if (!(this as any).collaborators.includes(userId)) {
    (this as any).collaborators.push(userId);
  }
  return (this as any).save();
};

// Method to remove a collaborator
HealthTaskSchema.methods['removeCollaborator'] = function(userId: string) {
  (this as any).collaborators = (this as any).collaborators.filter((id: any) => id.toString() !== userId);
  return (this as any).save();
};

const HealthTask = mongoose.model<IHealthTask>('HealthTask', HealthTaskSchema);

export default HealthTask;
