// Frontend types based on simplified backend User model

// ---------- INTERFACES ----------
export interface IUserPreferences {
  timezone: string;
  dailyGoalXP: number;
  notificationSettings?: {
    email: boolean;
    push: boolean;
  };
}

export interface IFriendRequests {
  sent: string[];
  received: string[];
}

// ---------- BACKEND USER INTERFACE ----------
// This matches the backend IUser interface
export interface IUser {
  _id?: string;
  name: string;
  email: string;
  password?: string; // Optional because it's select: false on backend
  avatar?: string;

  // Preferences
  preferences: IUserPreferences;

  // Leveling system - simple overall XP
  level: number;
  xp: number;
  totalTasksCompleted: number;

  // Tasks - simple array reference
  tasks: string[];

  // Authentication & Security
  isEmailVerified: boolean;
  emailVerificationToken?: string;
  passwordResetToken?: string;
  passwordResetExpires?: Date | string;

  // Social features
  friends: string[];
  friendRequests: IFriendRequests;
  blockedUsers: string[];

  // Timestamps
  createdAt: Date | string;
  updatedAt: Date | string;
}

// ---------- FRONTEND USER TYPE ----------
// Simplified version for frontend use with parsed dates
export interface User {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  preferences: UserPreferences;
  level: number;
  xp: number;
  totalTasksCompleted: number;
  tasks: string[];
  isEmailVerified: boolean;
  friends: string[];
  friendRequests: FriendRequests;
  blockedUsers: string[];
  createdAt: Date;
  updatedAt: Date;
}

// Simplified versions for frontend use
export interface UserPreferences {
  timezone: string;
  dailyGoalXP: number;
  notificationSettings?: {
    email: boolean;
    push: boolean;
  };
}

export interface FriendRequests {
  sent: string[];
  received: string[];
}

// ---------- USER CREATE/UPDATE DTOS ----------
export interface RegisterUserDTO {
  name: string;
  email: string;
  password: string;
}

export interface LoginUserDTO {
  email: string;
  password: string;
}

export interface UpdateUserDTO {
  name?: string;
  email?: string;
  avatar?: string;
  preferences?: Partial<IUserPreferences>;
}

export interface UpdatePasswordDTO {
  currentPassword: string;
  newPassword: string;
}

// ---------- API RESPONSE TYPES ----------
export interface UserResponse {
  success: boolean;
  data: IUser;
  token?: string;
}

export interface AuthResponse {
  success: boolean;
  data: {
    user: IUser;
    token: string;
  };
}

// ---------- HELPER FUNCTIONS ----------
export const parseUserDates = (user: IUser): User => ({
  ...user,
  _id: user._id || '',
  createdAt: new Date(user.createdAt),
  updatedAt: new Date(user.updatedAt),
  passwordResetExpires: undefined, // Don't include security fields in frontend
  emailVerificationToken: undefined,
  passwordResetToken: undefined,
} as User);

export const getNextLevelXP = (level: number): number => {
  // XP required for next level: level * 100
  return level * 100;
};

export const getXPProgress = (user: User): number => {
  const nextLevelXP = getNextLevelXP(user.level);
  return (user.xp / nextLevelXP) * 100;
};

export const canLevelUp = (user: User): boolean => {
  return user.xp >= getNextLevelXP(user.level);
};
