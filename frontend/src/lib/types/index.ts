// API Configuration
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  TIMEOUT: 10000,
} as const;

// Task Configuration
export const TASK_CONFIG = {
  DEFAULT_XP: 10,
  MAX_TITLE_LENGTH: 200,
  MAX_DESCRIPTION_LENGTH: 1000,
  MAX_TAG_LENGTH: 50,
  MAX_NOTE_LENGTH: 500,
  MAX_REMINDER_MESSAGE_LENGTH: 200,
} as const;

// User Configuration
export const USER_CONFIG = {
  MAX_NAME_LENGTH: 50,
  MIN_PASSWORD_LENGTH: 6,
  DEFAULT_DAILY_GOAL_XP: 100,
  MAX_DAILY_GOAL_XP: 1000,
} as const;

// UI Configuration
export const UI_CONFIG = {
  ANIMATION_DURATION: 300,
  DEBOUNCE_DELAY: 500,
  TOAST_DURATION: 5000,
  PAGINATION_LIMIT: 20,
} as const;

// Task Types
export const TASK_TYPES = [
  { value: 'food', label: 'Food & Nutrition', color: 'success' },
  { value: 'homework', label: 'Homework & Study', color: 'primary' },
  { value: 'email', label: 'Email & Communication', color: 'secondary' },
  { value: 'meeting', label: 'Meetings', color: 'warning' },
  { value: 'project', label: 'Projects', color: 'primary' },
  { value: 'personal', label: 'Personal', color: 'secondary' },
  { value: 'work', label: 'Work', color: 'primary' },
  { value: 'health', label: 'Health & Fitness', color: 'success' },
  { value: 'social', label: 'Social', color: 'accent' },
  { value: 'other', label: 'Other', color: 'default' },
] as const;

// Task Priorities
export const TASK_PRIORITIES = [
  { value: 'low', label: 'Low', color: 'secondary' },
  { value: 'medium', label: 'Medium', color: 'default' },
  { value: 'high', label: 'High', color: 'warning' },
  { value: 'urgent', label: 'Urgent', color: 'error' },
] as const;

// Task Statuses
export const TASK_STATUSES = [
  { value: 'pending', label: 'Pending', color: 'secondary' },
  { value: 'in_progress', label: 'In Progress', color: 'warning' },
  { value: 'completed', label: 'Completed', color: 'success' },
  { value: 'cancelled', label: 'Cancelled', color: 'error' },
] as const;

// Life Categories
export const LIFE_CATEGORIES = [
  { value: 'Fitness', label: 'Fitness', color: 'success' },
  { value: 'Productivity', label: 'Productivity', color: 'primary' },
  { value: 'Nutrition', label: 'Nutrition', color: 'success' },
  { value: 'Finance', label: 'Finance', color: 'warning' },
  { value: 'Social', label: 'Social', color: 'accent' },
  { value: 'Knowledge', label: 'Knowledge', color: 'primary' },
] as const;

// Personal Categories
export const PERSONAL_CATEGORIES = [
  { value: 'health', label: 'Health', color: 'success' },
  { value: 'fitness', label: 'Fitness', color: 'success' },
  { value: 'hobby', label: 'Hobby', color: 'secondary' },
  { value: 'learning', label: 'Learning', color: 'primary' },
  { value: 'travel', label: 'Travel', color: 'accent' },
  { value: 'family', label: 'Family', color: 'primary' },
  { value: 'finance', label: 'Finance', color: 'warning' },
  { value: 'home', label: 'Home', color: 'secondary' },
  { value: 'other', label: 'Other', color: 'default' },
] as const;

// Energy Levels
export const ENERGY_LEVELS = [
  { value: 1, label: 'Very Low', color: 'error' },
  { value: 2, label: 'Low', color: 'warning' },
  { value: 3, label: 'Medium', color: 'default' },
  { value: 4, label: 'High', color: 'success' },
  { value: 5, label: 'Very High', color: 'success' },
] as const;

// Recurring Patterns
export const RECURRING_FREQUENCIES = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly' },
] as const;

// Days of Week
export const DAYS_OF_WEEK = [
  { value: 0, label: 'Sunday' },
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
] as const;

// Metric Types
export const METRIC_TYPES = [
  { value: 'workout', label: 'Workout', unit: 'minutes' },
  { value: 'meal', label: 'Meal', unit: 'calories' },
  { value: 'finance', label: 'Finance', unit: 'dollars' },
  { value: 'study', label: 'Study', unit: 'hours' },
  { value: 'sleep', label: 'Sleep', unit: 'hours' },
] as const;

// Integration Providers
export const INTEGRATION_PROVIDERS = [
  { value: 'google', label: 'Google', color: 'primary' },
  { value: 'strava', label: 'Strava', color: 'success' },
  { value: 'plaid', label: 'Plaid', color: 'primary' },
  { value: 'openai', label: 'OpenAI', color: 'secondary' },
  { value: 'fitbit', label: 'Fitbit', color: 'success' },
] as const;

// Notification Types
export const NOTIFICATION_TYPES = [
  { value: 'task_reminder', label: 'Task Reminder', color: 'warning' },
  { value: 'friend_request', label: 'Friend Request', color: 'primary' },
  { value: 'achievement', label: 'Achievement', color: 'success' },
  { value: 'system', label: 'System', color: 'secondary' },
] as const;

// Theme Configuration
export const THEME_CONFIG = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system',
} as const;

// Local Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER_PREFERENCES: 'user_preferences',
  THEME: 'theme',
  SIDEBAR_STATE: 'sidebar_state',
} as const;

// Routes
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  TASKS: '/tasks',
  FRIENDS: '/friends',
  ANALYTICS: '/analytics',
  SETTINGS: '/settings',
  PROFILE: '/profile',
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  FORBIDDEN: 'Access denied.',
  NOT_FOUND: 'Resource not found.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  SERVER_ERROR: 'Server error. Please try again later.',
  UNKNOWN_ERROR: 'An unknown error occurred.',
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  TASK_CREATED: 'Task created successfully!',
  TASK_UPDATED: 'Task updated successfully!',
  TASK_DELETED: 'Task deleted successfully!',
  TASK_COMPLETED: 'Task completed! Great job!',
  USER_UPDATED: 'Profile updated successfully!',
  FRIEND_REQUEST_SENT: 'Friend request sent!',
  FRIEND_REQUEST_ACCEPTED: 'Friend request accepted!',
} as const;
