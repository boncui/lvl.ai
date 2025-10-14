import mongoose, { Document, Schema } from 'mongoose';
import { IBaseTask, TaskType, BaseTaskSchema } from './BaseTask';

// ---------- PERSONAL TASK INTERFACE ----------
export interface IPersonalTask extends IBaseTask {
  // Personal-specific fields
  personalCategory: 'health' | 'fitness' | 'hobby' | 'learning' | 'travel' | 'family' | 'finance' | 'home' | 'other';
  isPrivate: boolean;
  personalNotes?: string;
  moodBefore?: string;
  moodAfter?: string;
  energyLevel?: 1 | 2 | 3 | 4 | 5; // 1 = very low, 5 = very high
  weatherDependent?: boolean;
  weatherCondition?: string;
  seasonality?: string[]; // e.g., ['spring', 'summer']
  personalGoals?: string[];
  reflection?: string;
  photos?: string[]; // URLs to photos
  location?: string; // Specific location for the task
  cost?: number;
  actualCost?: number;
}

// ---------- PERSONAL TASK SCHEMA ----------
const PersonalTaskSchema = new Schema<IPersonalTask>({
  // Inherit all base task fields
  ...BaseTaskSchema.obj,
  
  // Personal-specific fields
  personalCategory: {
    type: String,
    enum: ['health', 'fitness', 'hobby', 'learning', 'travel', 'family', 'finance', 'home', 'other'],
    required: [true, 'Please specify the personal category'],
    default: 'other'
  },
  isPrivate: {
    type: Boolean,
    default: true
  },
  personalNotes: {
    type: String,
    trim: true,
    maxlength: [1000, 'Personal notes cannot be more than 1000 characters']
  },
  moodBefore: {
    type: String,
    trim: true,
    maxlength: [100, 'Mood description cannot be more than 100 characters']
  },
  moodAfter: {
    type: String,
    trim: true,
    maxlength: [100, 'Mood description cannot be more than 100 characters']
  },
  energyLevel: {
    type: Number,
    enum: [1, 2, 3, 4, 5],
    default: 3
  },
  weatherDependent: {
    type: Boolean,
    default: false
  },
  weatherCondition: {
    type: String,
    trim: true,
    maxlength: [50, 'Weather condition cannot be more than 50 characters']
  },
  seasonality: [{
    type: String,
    enum: ['spring', 'summer', 'fall', 'winter'],
    trim: true
  }],
  personalGoals: [{
    type: String,
    trim: true,
    maxlength: [200, 'Personal goal cannot be more than 200 characters']
  }],
  reflection: {
    type: String,
    trim: true,
    maxlength: [1000, 'Reflection cannot be more than 1000 characters']
  },
  photos: [{
    type: String,
    trim: true
  }],
  location: {
    type: String,
    trim: true,
    maxlength: [200, 'Location cannot be more than 200 characters']
  },
  cost: {
    type: Number,
    min: [0, 'Cost cannot be negative']
  },
  actualCost: {
    type: Number,
    min: [0, 'Actual cost cannot be negative']
  }
}, {
  timestamps: true
});

// Set default taskType
PersonalTaskSchema.add({ taskType: { type: String, default: TaskType.PERSONAL } });

// Personal-specific indexes
PersonalTaskSchema.index({ assignee: 1, personalCategory: 1 });
PersonalTaskSchema.index({ assignee: 1, isPrivate: 1 });
PersonalTaskSchema.index({ energyLevel: 1 });
PersonalTaskSchema.index({ seasonality: 1 });

// Virtual for checking if task affects mood positively
PersonalTaskSchema.virtual('improvesMood').get(function() {
  if (!this.moodBefore || !this.moodAfter) return null;
  // Simple mood improvement check - can be enhanced with sentiment analysis
  const positiveMoods = ['happy', 'energized', 'satisfied', 'accomplished', 'relaxed'];
  return positiveMoods.some(mood => this.moodAfter.toLowerCase().includes(mood));
});

// Virtual for checking if task is weather appropriate
PersonalTaskSchema.virtual('isWeatherAppropriate').get(function() {
  if (!this.weatherDependent || !this.weatherCondition) return true;
  // This would integrate with weather API in real implementation
  return true; // Placeholder
});

// Method to add personal goal
PersonalTaskSchema.methods['addPersonalGoal'] = function(goal: string) {
  if (!this.personalGoals.includes(goal)) {
    this.personalGoals.push(goal);
  }
  return this['save']();
};

// Method to add photo
PersonalTaskSchema.methods['addPhoto'] = function(photoUrl: string) {
  if (!this.photos.includes(photoUrl)) {
    this.photos.push(photoUrl);
  }
  return this['save']();
};

// Method to update mood
PersonalTaskSchema.methods['updateMood'] = function(mood: string, isAfter: boolean = false) {
  if (isAfter) {
    this.moodAfter = mood;
  } else {
    this.moodBefore = mood;
  }
  return this['save']();
};

const PersonalTask = mongoose.model<IPersonalTask>('PersonalTask', PersonalTaskSchema);
export default PersonalTask;
