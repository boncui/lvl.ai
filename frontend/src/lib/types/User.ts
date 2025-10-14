// Frontend types based on backend User model

// ---------- ENUMS ----------
export enum LifeCategory {
  FITNESS = "Fitness",
  PRODUCTIVITY = "Productivity",
  NUTRITION = "Nutrition",
  FINANCE = "Finance",
  SOCIAL = "Social",
  KNOWLEDGE = "Knowledge",
}

// ---------- INTERFACES ----------
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

export interface IUserPreferences {
  timezone: string;
  dailyGoalXP: number;
  preferredWorkouts?: string[];
  dietaryPreferences?: string[];
  notificationSettings?: {
    email: boolean;
    push: boolean;
  };
}

export interface IUserTasks {
  foodTasks: string[];
  homeworkTasks: string[];
  emailTasks: string[];
  meetingTasks: string[];
  projectTasks: string[];
  personalTasks: string[];
  workTasks: string[];
  healthTasks: string[];
  socialTasks: string[];
  otherTasks: string[];
}

export interface ICalendarEvent {
  title: string;
  start: Date;
  end: Date;
  description?: string;
  source?: string;
}

export interface IUserFinances {
  income: number;
  expenses: number;
  savings: number;
  goals?: string[];
}

export interface IAgentMemory {
  lastConversation?: string;
  suggestions?: string[];
  autoActions?: string[];
}

export interface IFriendRequests {
  sent: string[];
  received: string[];
}

// ---------- MAIN USER INTERFACE ----------
export interface IUser {
  name: string;
  email: string;
  password: string;
  avatar?: string;

  // AI agent memory / preferences
  preferences: IUserPreferences;
  levels: Record<LifeCategory, ILevelProgress>;
  tasks: IUserTasks;
  metrics: IMetric[];
  integrations: IIntegration[];
  calendarEvents?: ICalendarEvent[];
  finances?: IUserFinances;
  agentMemory?: IAgentMemory;

  // Verification & Social
  isEmailVerified: boolean;
  friends: string[];
  friendRequests: IFriendRequests;
  blockedUsers: string[];

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

// ---------- FRONTEND-SPECIFIC TYPES ----------
// These are the types used in the frontend (without Mongoose Document)
export interface User {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  preferences: UserPreferences;
  levels: Record<LifeCategory, LevelProgress>;
  tasks: UserTasks;
  metrics: Metric[];
  integrations: Integration[];
  calendarEvents?: CalendarEvent[];
  finances?: UserFinances;
  agentMemory?: AgentMemory;
  isEmailVerified: boolean;
  friends: string[];
  friendRequests: FriendRequests;
  blockedUsers: string[];
  createdAt: Date;
  updatedAt: Date;
}

// Simplified versions for frontend use
export interface LevelProgress {
  level: number;
  xp: number;
  dailyStreak: number;
  totalCompleted: number;
}

export interface Metric {
  metricType: "workout" | "meal" | "finance" | "study" | "sleep";
  value: number;
  unit?: string;
  date: Date;
  notes?: string;
}

export interface Integration {
  provider: string;
  connected: boolean;
  lastSync?: Date;
  tokens?: Record<string, string>;
}

export interface UserPreferences {
  timezone: string;
  dailyGoalXP: number;
  preferredWorkouts?: string[];
  dietaryPreferences?: string[];
  notificationSettings?: {
    email: boolean;
    push: boolean;
  };
}

export interface UserTasks {
  foodTasks: string[];
  homeworkTasks: string[];
  emailTasks: string[];
  meetingTasks: string[];
  projectTasks: string[];
  personalTasks: string[];
  workTasks: string[];
  healthTasks: string[];
  socialTasks: string[];
  otherTasks: string[];
}

export interface CalendarEvent {
  title: string;
  start: Date;
  end: Date;
  description?: string;
  source?: string;
}

export interface UserFinances {
  income: number;
  expenses: number;
  savings: number;
  goals?: string[];
}

export interface AgentMemory {
  lastConversation?: string;
  suggestions?: string[];
  autoActions?: string[];
}

export interface FriendRequests {
  sent: string[];
  received: string[];
}
