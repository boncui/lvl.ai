// backend/src/models/User.ts
import mongoose, { Schema, Document } from "mongoose";
import bcrypt from 'bcryptjs';

// ---------- USER INTERFACE ----------
export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  avatar?: string;

  // Preferences
  preferences: {
    timezone: string;
    dailyGoalXP: number;
    notificationSettings?: {
      email: boolean;
      push: boolean;
    };
  };

  // Leveling system - simple overall XP
  level: number;
  xp: number;
  totalTasksCompleted: number;

  // Tasks - simple array reference
  tasks: mongoose.Types.ObjectId[];

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
      notificationSettings: {
        email: { type: Boolean, default: true },
        push: { type: Boolean, default: false },
      },
    },

    level: {
      type: Number,
      default: 1,
      min: [1, 'Level must be at least 1']
    },
    xp: {
      type: Number,
      default: 0,
      min: [0, 'XP cannot be negative']
    },
    totalTasksCompleted: {
      type: Number,
      default: 0,
      min: [0, 'Total tasks completed cannot be negative']
    },

    tasks: [{
      type: Schema.Types.ObjectId,
      ref: 'Task'
    }],

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
