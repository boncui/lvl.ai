// backend/src/models/User.ts
import mongoose, { Schema, Document } from "mongoose";
import bcrypt from 'bcryptjs';

// ---------- ENUMS ----------
export enum LifeCategory {
  FITNESS = "Fitness",
  PRODUCTIVITY = "Productivity",
  NUTRITION = "Nutrition",
  FINANCE = "Finance",
  SOCIAL = "Social",
  KNOWLEDGE = "Knowledge",
}

export interface ILevelProgress {
  level: number;
  xp: number;
  dailyStreak: number;
  totalCompleted: number;
}


export interface IMetric {
  metricType: "workout" | "meal" | "finance" | "study" | "sleep";
  value: number;
  unit?: string;
  date: Date;
  notes?: string;
}

export interface IIntegration {
  provider: string; // e.g. Google, Strava, Plaid, OpenAI, Fitbit
  connected: boolean;
  lastSync?: Date;
  tokens?: Record<string, string>;
}

// ---------- MAIN USER SCHEMA ----------
export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  avatar?: string;

  // AI agent memory / preferences
  preferences: {
    timezone: string;
    dailyGoalXP: number;
    preferredWorkouts?: string[];
    dietaryPreferences?: string[];
    notificationSettings?: {
      email: boolean;
      push: boolean;
    };
  };

  // Leveling system progress
  levels: Record<LifeCategory, ILevelProgress>;

  // Task management - references to all task types
  tasks: {
    foodTasks: mongoose.Types.ObjectId[];
    homeworkTasks: mongoose.Types.ObjectId[];
    emailTasks: mongoose.Types.ObjectId[];
    meetingTasks: mongoose.Types.ObjectId[];
    projectTasks: mongoose.Types.ObjectId[];
    personalTasks: mongoose.Types.ObjectId[];
    workTasks: mongoose.Types.ObjectId[];
    healthTasks: mongoose.Types.ObjectId[];
    socialTasks: mongoose.Types.ObjectId[];
    otherTasks: mongoose.Types.ObjectId[];
  };

  // Metrics (quantified self)
  metrics: IMetric[];

  // Integrations
  integrations: IIntegration[];

  // Productivity tracking
  calendarEvents?: {
    title: string;
    start: Date;
    end: Date;
    description?: string;
    source?: string; // e.g., "Google Calendar"
  }[];

  // Financial overview
  finances?: {
    income: number;
    expenses: number;
    savings: number;
    goals?: string[];
  };

  // AI agent memory
  agentMemory?: {
    lastConversation?: string;
    suggestions?: string[];
    autoActions?: string[];
  };

  // Authentication & Security
  isEmailVerified: boolean;
  emailVerificationToken?: string;
  passwordResetToken?: string;
  passwordResetExpires?: Date;

  // Social features
  friends: mongoose.Types.ObjectId[];
  friendRequests: {
    sent: mongoose.Types.ObjectId[];
    received: mongoose.Types.ObjectId[];
  };
  blockedUsers: mongoose.Types.ObjectId[];

  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

// ---------- SCHEMA DEFINITION ----------
const UserSchema = new Schema<IUser>(
  {
    name: { 
      type: String, 
      required: [true, 'Please add a name'],
      trim: true,
      maxlength: [50, 'Name cannot be more than 50 characters']
    },
    email: { 
      type: String, 
      required: [true, 'Please add an email'],
      unique: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please add a valid email'
      ]
    },
    password: { 
      type: String, 
      required: [true, 'Please add a password'],
      minlength: 6,
      select: false
    },
    avatar: { type: String },

    preferences: {
      timezone: { type: String, default: "UTC" },
      dailyGoalXP: { type: Number, default: 100 },
      preferredWorkouts: [{ type: String }],
      dietaryPreferences: [{ type: String }],
      notificationSettings: {
        email: { type: Boolean, default: true },
        push: { type: Boolean, default: false },
      },
    },

    levels: {
      type: Map,
      of: {
        level: { type: Number, default: 1 },
        xp: { type: Number, default: 0 },
        dailyStreak: { type: Number, default: 0 },
        totalCompleted: { type: Number, default: 0 },
      },
      default: {},
    },

    tasks: {
      foodTasks: [{
        type: Schema.Types.ObjectId,
        ref: 'FoodTask'
      }],
      homeworkTasks: [{
        type: Schema.Types.ObjectId,
        ref: 'HomeworkTask'
      }],
      emailTasks: [{
        type: Schema.Types.ObjectId,
        ref: 'EmailTask'
      }],
      meetingTasks: [{
        type: Schema.Types.ObjectId,
        ref: 'MeetingTask'
      }],
      projectTasks: [{
        type: Schema.Types.ObjectId,
        ref: 'ProjectTask'
      }],
      personalTasks: [{
        type: Schema.Types.ObjectId,
        ref: 'Task'
      }],
      workTasks: [{
        type: Schema.Types.ObjectId,
        ref: 'WorkTask'
      }],
      healthTasks: [{
        type: Schema.Types.ObjectId,
        ref: 'HealthTask'
      }],
      socialTasks: [{
        type: Schema.Types.ObjectId,
        ref: 'SocialTask'
      }],
      otherTasks: [{
        type: Schema.Types.ObjectId,
        ref: 'OtherTask'
      }]
    },

    metrics: [
      {
        metricType: { type: String },
        value: { type: Number },
        unit: { type: String },
        date: { type: Date, default: Date.now },
        notes: { type: String },
      },
    ],

    integrations: [
      {
        provider: { type: String },
        connected: { type: Boolean, default: false },
        lastSync: { type: Date },
        tokens: { type: Object },
      },
    ],

    calendarEvents: [
      {
        title: String,
        start: Date,
        end: Date,
        description: String,
        source: String,
      },
    ],

    finances: {
      income: { type: Number, default: 0 },
      expenses: { type: Number, default: 0 },
      savings: { type: Number, default: 0 },
      goals: [{ type: String }],
    },

    agentMemory: {
      lastConversation: String,
      suggestions: [{ type: String }],
      autoActions: [{ type: String }],
    },

    // Authentication & Security
    isEmailVerified: {
      type: Boolean,
      default: false
    },
    emailVerificationToken: String,
    passwordResetToken: String,
    passwordResetExpires: Date,

    // Social features
    friends: [{
      type: Schema.Types.ObjectId,
      ref: 'User'
    }],
    friendRequests: {
      sent: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
      }],
      received: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
      }]
    },
    blockedUsers: [{
      type: Schema.Types.ObjectId,
      ref: 'User'
    }]
  },
  { timestamps: true }
);

// Encrypt password using bcrypt
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Match user entered password to hashed password in database
UserSchema.methods['comparePassword'] = async function(candidatePassword: string): Promise<boolean> {
  return await bcrypt.compare(candidatePassword, this['password']);
};

const User = mongoose.model<IUser>("User", UserSchema);
export default User;