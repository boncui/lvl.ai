import mongoose, { Document, Schema } from 'mongoose';
import { IBaseTask, TaskType, BaseTaskSchema } from './BaseTask';

// ---------- HEALTH TASK INTERFACE ----------
export interface IHealthTask extends IBaseTask {
  // Health-specific fields
  healthCategory: 'exercise' | 'medical' | 'mental_health' | 'nutrition' | 'sleep' | 'preventive' | 'recovery' | 'other';
  healthGoal?: string;
  targetValue?: number;
  actualValue?: number;
  unit?: string; // e.g., 'minutes', 'steps', 'calories', 'kg', 'ml'
  healthProvider?: string; // Doctor, trainer, therapist name
  healthProviderContact?: string;
  medication?: string[];
  symptoms?: string[];
  painLevel?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10; // Pain scale 1-10
  energyLevel?: 1 | 2 | 3 | 4 | 5; // Energy level 1-5
  mood?: string;
  sleepQuality?: 1 | 2 | 3 | 4 | 5; // Sleep quality 1-5
  heartRate?: {
    resting?: number;
    max?: number;
    average?: number;
  };
  bloodPressure?: {
    systolic?: number;
    diastolic?: number;
  };
  weight?: number;
  bodyFat?: number;
  hydration?: number; // in ml
  supplements?: string[];
  sideEffects?: string[];
  followUpDate?: Date;
  healthNotes?: string;
}

// ---------- HEALTH TASK SCHEMA ----------
const HealthTaskSchema = new Schema<IHealthTask>({
  // Inherit all base task fields
  ...BaseTaskSchema.obj,
  
  // Health-specific fields
  healthCategory: {
    type: String,
    enum: ['exercise', 'medical', 'mental_health', 'nutrition', 'sleep', 'preventive', 'recovery', 'other'],
    required: [true, 'Please specify the health category'],
    default: 'other'
  },
  healthGoal: {
    type: String,
    trim: true,
    maxlength: [200, 'Health goal cannot be more than 200 characters']
  },
  targetValue: {
    type: Number,
    min: [0, 'Target value cannot be negative']
  },
  actualValue: {
    type: Number,
    min: [0, 'Actual value cannot be negative']
  },
  unit: {
    type: String,
    trim: true,
    maxlength: [20, 'Unit cannot be more than 20 characters']
  },
  healthProvider: {
    type: String,
    trim: true,
    maxlength: [100, 'Health provider name cannot be more than 100 characters']
  },
  healthProviderContact: {
    type: String,
    trim: true,
    maxlength: [200, 'Contact information cannot be more than 200 characters']
  },
  medication: [{
    type: String,
    trim: true,
    maxlength: [100, 'Medication name cannot be more than 100 characters']
  }],
  symptoms: [{
    type: String,
    trim: true,
    maxlength: [100, 'Symptom description cannot be more than 100 characters']
  }],
  painLevel: {
    type: Number,
    min: [1, 'Pain level must be at least 1'],
    max: [10, 'Pain level cannot be more than 10']
  },
  energyLevel: {
    type: Number,
    enum: [1, 2, 3, 4, 5],
    default: 3
  },
  mood: {
    type: String,
    trim: true,
    maxlength: [100, 'Mood description cannot be more than 100 characters']
  },
  sleepQuality: {
    type: Number,
    enum: [1, 2, 3, 4, 5],
    default: 3
  },
  heartRate: {
    resting: {
      type: Number,
      min: [30, 'Resting heart rate must be at least 30'],
      max: [200, 'Resting heart rate cannot be more than 200']
    },
    max: {
      type: Number,
      min: [50, 'Max heart rate must be at least 50'],
      max: [250, 'Max heart rate cannot be more than 250']
    },
    average: {
      type: Number,
      min: [30, 'Average heart rate must be at least 30'],
      max: [200, 'Average heart rate cannot be more than 200']
    }
  },
  bloodPressure: {
    systolic: {
      type: Number,
      min: [70, 'Systolic pressure must be at least 70'],
      max: [250, 'Systolic pressure cannot be more than 250']
    },
    diastolic: {
      type: Number,
      min: [40, 'Diastolic pressure must be at least 40'],
      max: [150, 'Diastolic pressure cannot be more than 150']
    }
  },
  weight: {
    type: Number,
    min: [20, 'Weight must be at least 20 kg'],
    max: [500, 'Weight cannot be more than 500 kg']
  },
  bodyFat: {
    type: Number,
    min: [1, 'Body fat percentage must be at least 1%'],
    max: [50, 'Body fat percentage cannot be more than 50%']
  },
  hydration: {
    type: Number,
    min: [0, 'Hydration cannot be negative']
  },
  supplements: [{
    type: String,
    trim: true,
    maxlength: [100, 'Supplement name cannot be more than 100 characters']
  }],
  sideEffects: [{
    type: String,
    trim: true,
    maxlength: [200, 'Side effect description cannot be more than 200 characters']
  }],
  followUpDate: {
    type: Date
  },
  healthNotes: {
    type: String,
    trim: true,
    maxlength: [1000, 'Health notes cannot be more than 1000 characters']
  }
}, {
  timestamps: true
});

// Set default taskType
HealthTaskSchema.add({ taskType: { type: String, default: TaskType.HEALTH } });

// Health-specific indexes
HealthTaskSchema.index({ assignee: 1, healthCategory: 1 });
HealthTaskSchema.index({ assignee: 1, followUpDate: 1 });
HealthTaskSchema.index({ healthProvider: 1 });
HealthTaskSchema.index({ painLevel: 1 });

// Virtual for checking if health goal is achieved
HealthTaskSchema.virtual('goalAchieved').get(function() {
  if (!this.targetValue || !this.actualValue) return null;
  return this.actualValue >= this.targetValue;
});

// Virtual for checking if follow-up is needed
HealthTaskSchema.virtual('needsFollowUp').get(function() {
  return this.followUpDate && this.followUpDate < new Date();
});

// Virtual for calculating health progress
HealthTaskSchema.virtual('healthProgress').get(function() {
  if (!this.targetValue || !this.actualValue) return null;
  return (this.actualValue / this.targetValue) * 100;
});

// Method to add symptom
HealthTaskSchema.methods['addSymptom'] = function(symptom: string) {
  if (!this.symptoms.includes(symptom)) {
    this.symptoms.push(symptom);
  }
  return this['save']();
};

// Method to add medication
HealthTaskSchema.methods['addMedication'] = function(medication: string) {
  if (!this.medication.includes(medication)) {
    this.medication.push(medication);
  }
  return this['save']();
};

// Method to update vital signs
HealthTaskSchema.methods['updateVitals'] = function(vitals: {
  heartRate?: { resting?: number; max?: number; average?: number };
  bloodPressure?: { systolic?: number; diastolic?: number };
  weight?: number;
  bodyFat?: number;
}) {
  if (vitals.heartRate) {
    this.heartRate = { ...this.heartRate, ...vitals.heartRate };
  }
  if (vitals.bloodPressure) {
    this.bloodPressure = { ...this.bloodPressure, ...vitals.bloodPressure };
  }
  if (vitals.weight !== undefined) this.weight = vitals.weight;
  if (vitals.bodyFat !== undefined) this.bodyFat = vitals.bodyFat;
  return this['save']();
};

const HealthTask = mongoose.model<IHealthTask>('HealthTask', HealthTaskSchema);
export default HealthTask;
