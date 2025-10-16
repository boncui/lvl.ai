import { z } from 'zod';

// Password strength validation
const passwordStrengthSchema = z.string()
  .min(6, 'Password must be at least 6 characters')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^a-zA-Z0-9]/, 'Password must contain at least one special character');

// Auth validation schemas
export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50, 'Name cannot exceed 50 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: passwordStrengthSchema,
});

// Task validation schemas
export const taskFormSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title cannot exceed 200 characters'),
  description: z.string().max(1000, 'Description cannot exceed 1000 characters').optional(),
  taskType: z.enum(['food', 'homework', 'email', 'meeting', 'project', 'personal', 'work', 'health', 'social', 'other']),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  dueDate: z.date().optional(),
  startDate: z.date().optional(),
  estimatedDuration: z.number().min(1, 'Duration must be at least 1 minute').optional(),
  tags: z.array(z.string().max(50, 'Tag cannot exceed 50 characters')).default([]),
  location: z.string().max(200, 'Location cannot exceed 200 characters').optional(),
  isRecurring: z.boolean().default(false),
  recurringPattern: z.object({
    frequency: z.enum(['daily', 'weekly', 'monthly', 'yearly']),
    interval: z.number().min(1, 'Interval must be at least 1'),
    daysOfWeek: z.array(z.number().min(0).max(6)).optional(),
    dayOfMonth: z.number().min(1).max(31).optional(),
    endDate: z.date().optional(),
  }).optional(),
  personalCategory: z.enum(['health', 'fitness', 'hobby', 'learning', 'travel', 'family', 'finance', 'home', 'other']).optional(),
  isPrivate: z.boolean().default(false),
  personalNotes: z.string().max(1000, 'Personal notes cannot exceed 1000 characters').optional(),
  energyLevel: z.number().min(1).max(5).optional(),
  weatherDependent: z.boolean().default(false),
  weatherCondition: z.string().max(50, 'Weather condition cannot exceed 50 characters').optional(),
  seasonality: z.array(z.enum(['spring', 'summer', 'fall', 'winter'])).optional(),
  personalGoals: z.array(z.string().max(200, 'Personal goal cannot exceed 200 characters')).optional(),
  cost: z.number().min(0, 'Cost cannot be negative').optional(),
}).refine(
  (data) => {
    if (data.dueDate && data.startDate) {
      return data.dueDate >= data.startDate;
    }
    return true;
  },
  {
    message: 'Due date must be after start date',
    path: ['dueDate'],
  }
);

// User profile validation schema
export const userProfileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50, 'Name cannot exceed 50 characters'),
  email: z.string().email('Please enter a valid email address'),
  preferences: z.object({
    timezone: z.string().default('UTC'),
    dailyGoalXP: z.number().min(1, 'Daily goal must be at least 1 XP').max(1000, 'Daily goal cannot exceed 1000 XP'),
    preferredWorkouts: z.array(z.string()).optional(),
    dietaryPreferences: z.array(z.string()).optional(),
    notificationSettings: z.object({
      email: z.boolean().default(true),
      push: z.boolean().default(false),
    }).optional(),
  }),
});

// Friend request validation schema
export const friendRequestSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
});

// Search and filter validation schemas
export const taskFiltersSchema = z.object({
  status: z.array(z.enum(['pending', 'in_progress', 'completed', 'cancelled'])).optional(),
  priority: z.array(z.enum(['low', 'medium', 'high', 'urgent'])).optional(),
  taskType: z.array(z.enum(['food', 'homework', 'email', 'meeting', 'project', 'personal', 'work', 'health', 'social', 'other'])).optional(),
  tags: z.array(z.string()).optional(),
  assignee: z.array(z.string()).optional(),
  dateRange: z.object({
    start: z.date(),
    end: z.date(),
  }).optional(),
  search: z.string().optional(),
});

export const sortOptionSchema = z.object({
  field: z.string().min(1, 'Sort field is required'),
  direction: z.enum(['asc', 'desc']).default('asc'),
});

// Note validation schema
export const taskNoteSchema = z.object({
  content: z.string().min(1, 'Note content is required').max(500, 'Note cannot exceed 500 characters'),
});

// Reminder validation schema
export const taskReminderSchema = z.object({
  date: z.date().min(new Date(), 'Reminder date must be in the future'),
  message: z.string().max(200, 'Reminder message cannot exceed 200 characters').optional(),
});

// Metric validation schema
export const metricSchema = z.object({
  metricType: z.enum(['workout', 'meal', 'finance', 'study', 'sleep']),
  value: z.number().min(0, 'Value cannot be negative'),
  unit: z.string().optional(),
  date: z.date().default(() => new Date()),
  notes: z.string().max(500, 'Notes cannot exceed 500 characters').optional(),
});

// Integration validation schema
export const integrationSchema = z.object({
  provider: z.string().min(1, 'Provider is required'),
  connected: z.boolean().default(false),
  tokens: z.record(z.string(), z.string()).optional(),
});

// Calendar event validation schema
export const calendarEventSchema = z.object({
  title: z.string().min(1, 'Event title is required').max(200, 'Title cannot exceed 200 characters'),
  start: z.date(),
  end: z.date(),
  description: z.string().max(1000, 'Description cannot exceed 1000 characters').optional(),
  source: z.string().optional(),
}).refine(
  (data) => data.end >= data.start,
  {
    message: 'End date must be after start date',
    path: ['end'],
  }
);

// Financial data validation schema
export const financialDataSchema = z.object({
  income: z.number().min(0, 'Income cannot be negative'),
  expenses: z.number().min(0, 'Expenses cannot be negative'),
  savings: z.number().min(0, 'Savings cannot be negative'),
  goals: z.array(z.string().max(200, 'Goal cannot exceed 200 characters')).optional(),
});

// Export types for use in forms
export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type TaskFormData = z.infer<typeof taskFormSchema>;
export type UserProfileFormData = z.infer<typeof userProfileSchema>;
export type FriendRequestFormData = z.infer<typeof friendRequestSchema>;
export type TaskFiltersFormData = z.infer<typeof taskFiltersSchema>;
export type SortOptionFormData = z.infer<typeof sortOptionSchema>;
export type TaskNoteFormData = z.infer<typeof taskNoteSchema>;
export type TaskReminderFormData = z.infer<typeof taskReminderSchema>;
export type MetricFormData = z.infer<typeof metricSchema>;
export type IntegrationFormData = z.infer<typeof integrationSchema>;
export type CalendarEventFormData = z.infer<typeof calendarEventSchema>;
export type FinancialDataFormData = z.infer<typeof financialDataSchema>;
