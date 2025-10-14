import mongoose, { Document, Schema } from 'mongoose';
import { IBaseTask, TaskType, BaseTaskSchema } from './BaseTask';

// ---------- OTHER TASK INTERFACE ----------
export interface IOtherTask extends IBaseTask {
  // Other-specific fields (catch-all for miscellaneous tasks)
  customCategory?: string;
  customFields?: {
    [key: string]: any; // Flexible field storage
  };
  miscellaneousNotes?: string;
  relatedTasks?: mongoose.Types.ObjectId[]; // Links to other tasks
  taskSource?: 'manual' | 'imported' | 'ai_generated' | 'template';
  templateUsed?: string;
  originalTaskId?: string; // For imported tasks
  importSource?: string; // e.g., "Google Tasks", "Todoist"
  externalId?: string; // External system ID
  syncStatus?: 'synced' | 'pending_sync' | 'sync_failed';
  lastSyncAt?: Date;
}

// ---------- OTHER TASK SCHEMA ----------
const OtherTaskSchema = new Schema<IOtherTask>({
  // Inherit all base task fields
  ...BaseTaskSchema.obj,
  
  // Other-specific fields
  customCategory: {
    type: String,
    trim: true,
    maxlength: [100, 'Custom category cannot be more than 100 characters']
  },
  customFields: {
    type: Schema.Types.Mixed // Flexible field storage
  },
  miscellaneousNotes: {
    type: String,
    trim: true,
    maxlength: [1000, 'Miscellaneous notes cannot be more than 1000 characters']
  },
  relatedTasks: [{
    type: Schema.Types.ObjectId,
    ref: 'OtherTask'
  }],
  taskSource: {
    type: String,
    enum: ['manual', 'imported', 'ai_generated', 'template'],
    default: 'manual'
  },
  templateUsed: {
    type: String,
    trim: true,
    maxlength: [100, 'Template name cannot be more than 100 characters']
  },
  originalTaskId: {
    type: String,
    trim: true
  },
  importSource: {
    type: String,
    trim: true,
    maxlength: [50, 'Import source cannot be more than 50 characters']
  },
  externalId: {
    type: String,
    trim: true
  },
  syncStatus: {
    type: String,
    enum: ['synced', 'pending_sync', 'sync_failed'],
    default: 'synced'
  },
  lastSyncAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Set default taskType
OtherTaskSchema.add({ taskType: { type: String, default: TaskType.OTHER } });

// Other-specific indexes
OtherTaskSchema.index({ assignee: 1, customCategory: 1 });
OtherTaskSchema.index({ assignee: 1, taskSource: 1 });
OtherTaskSchema.index({ externalId: 1 });
OtherTaskSchema.index({ syncStatus: 1 });

// Virtual for checking if task needs sync
OtherTaskSchema.virtual('needsSync').get(function() {
  return this.syncStatus === 'pending_sync' || this.syncStatus === 'sync_failed';
});

// Virtual for checking if task is imported
OtherTaskSchema.virtual('isImported').get(function() {
  return this.taskSource === 'imported';
});

// Method to add custom field
OtherTaskSchema.methods['addCustomField'] = function(key: string, value: any) {
  if (!this.customFields) {
    this.customFields = {};
  }
  this.customFields[key] = value;
  return this['save']();
};

// Method to remove custom field
OtherTaskSchema.methods['removeCustomField'] = function(key: string) {
  if (this.customFields && this.customFields[key]) {
    delete this.customFields[key];
  }
  return this['save']();
};

// Method to add related task
OtherTaskSchema.methods['addRelatedTask'] = function(taskId: string) {
  if (!this.relatedTasks.includes(taskId)) {
    this.relatedTasks.push(taskId);
  }
  return this['save']();
};

// Method to update sync status
OtherTaskSchema.methods['updateSyncStatus'] = function(status: 'synced' | 'pending_sync' | 'sync_failed') {
  this.syncStatus = status;
  this.lastSyncAt = new Date();
  return this['save']();
};

const OtherTask = mongoose.model<IOtherTask>('OtherTask', OtherTaskSchema);
export default OtherTask;
