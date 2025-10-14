import mongoose, { Document, Schema } from 'mongoose';
import { IBaseTask, TaskType, BaseTaskSchema } from './BaseTask';

// ---------- SOCIAL TASK INTERFACE ----------
export interface ISocialTask extends IBaseTask {
  // Social-specific fields
  socialType: 'meetup' | 'party' | 'date' | 'family_gathering' | 'networking' | 'volunteer' | 'community_event' | 'other';
  attendees: mongoose.Types.ObjectId[];
  attendeeNames?: string[]; // For non-user attendees
  eventLocation?: string;
  eventDate: Date;
  eventDuration?: number; // in minutes
  dressCode?: string;
  eventTheme?: string;
  socialGoals?: string[]; // e.g., "network with 3 people", "catch up with family"
  socialNotes?: string;
  photos?: string[]; // URLs to photos from the event
  socialMood?: string; // How the user felt during/after the event
  newConnections?: string[]; // Names of new people met
  followUpActions?: {
    action: string;
    person: string;
    dueDate?: Date;
    completed: boolean;
  }[];
  eventCost?: number;
  actualCost?: number;
  transportation?: string;
  weatherDependent?: boolean;
  indoorOutdoor?: 'indoor' | 'outdoor' | 'mixed';
}

// ---------- SOCIAL TASK SCHEMA ----------
const SocialTaskSchema = new Schema<ISocialTask>({
  // Inherit all base task fields
  ...BaseTaskSchema.obj,
  
  // Social-specific fields
  socialType: {
    type: String,
    enum: ['meetup', 'party', 'date', 'family_gathering', 'networking', 'volunteer', 'community_event', 'other'],
    required: [true, 'Please specify the social type'],
    default: 'other'
  },
  attendees: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  attendeeNames: [{
    type: String,
    trim: true,
    maxlength: [100, 'Attendee name cannot be more than 100 characters']
  }],
  eventLocation: {
    type: String,
    trim: true,
    maxlength: [200, 'Event location cannot be more than 200 characters']
  },
  eventDate: {
    type: Date,
    required: [true, 'Event date is required for social tasks']
  },
  eventDuration: {
    type: Number,
    min: [15, 'Event duration must be at least 15 minutes']
  },
  dressCode: {
    type: String,
    trim: true,
    maxlength: [100, 'Dress code cannot be more than 100 characters']
  },
  eventTheme: {
    type: String,
    trim: true,
    maxlength: [100, 'Event theme cannot be more than 100 characters']
  },
  socialGoals: [{
    type: String,
    trim: true,
    maxlength: [200, 'Social goal cannot be more than 200 characters']
  }],
  socialNotes: {
    type: String,
    trim: true,
    maxlength: [1000, 'Social notes cannot be more than 1000 characters']
  },
  photos: [{
    type: String,
    trim: true
  }],
  socialMood: {
    type: String,
    trim: true,
    maxlength: [100, 'Social mood cannot be more than 100 characters']
  },
  newConnections: [{
    type: String,
    trim: true,
    maxlength: [100, 'Connection name cannot be more than 100 characters']
  }],
  followUpActions: [{
    action: {
      type: String,
      required: true,
      trim: true,
      maxlength: [200, 'Follow-up action cannot be more than 200 characters']
    },
    person: {
      type: String,
      required: true,
      trim: true,
      maxlength: [100, 'Person name cannot be more than 100 characters']
    },
    dueDate: {
      type: Date
    },
    completed: {
      type: Boolean,
      default: false
    }
  }],
  eventCost: {
    type: Number,
    min: [0, 'Event cost cannot be negative']
  },
  actualCost: {
    type: Number,
    min: [0, 'Actual cost cannot be negative']
  },
  transportation: {
    type: String,
    trim: true,
    maxlength: [100, 'Transportation cannot be more than 100 characters']
  },
  weatherDependent: {
    type: Boolean,
    default: false
  },
  indoorOutdoor: {
    type: String,
    enum: ['indoor', 'outdoor', 'mixed'],
    default: 'indoor'
  }
}, {
  timestamps: true
});

// Set default taskType
SocialTaskSchema.add({ taskType: { type: String, default: TaskType.SOCIAL } });

// Social-specific indexes
SocialTaskSchema.index({ assignee: 1, socialType: 1 });
SocialTaskSchema.index({ assignee: 1, eventDate: 1 });
SocialTaskSchema.index({ attendees: 1 });
SocialTaskSchema.index({ eventLocation: 1 });

// Virtual for checking if event is happening soon
SocialTaskSchema.virtual('isHappeningSoon').get(function() {
  if (!this.eventDate) return false;
  const now = new Date();
  const timeDiff = this.eventDate.getTime() - now.getTime();
  const hoursDiff = timeDiff / (1000 * 60 * 60);
  return hoursDiff <= 24 && hoursDiff >= 0; // Within next 24 hours
});

// Virtual for calculating social engagement score
SocialTaskSchema.virtual('socialEngagementScore').get(function() {
  let score = 0;
  if (this.attendees.length > 0) score += this.attendees.length * 2;
  if (this.newConnections.length > 0) score += this.newConnections.length * 5;
  if (this.socialMood && this.socialMood.toLowerCase().includes('positive')) score += 10;
  if (this.followUpActions.length > 0) score += this.followUpActions.length * 3;
  return score;
});

// Method to add attendee
SocialTaskSchema.methods['addAttendee'] = function(userId: string) {
  if (!this.attendees.includes(userId)) {
    this.attendees.push(userId);
  }
  return this['save']();
};

// Method to add new connection
SocialTaskSchema.methods['addNewConnection'] = function(name: string) {
  if (!this.newConnections.includes(name)) {
    this.newConnections.push(name);
  }
  return this['save']();
};

// Method to add follow-up action
SocialTaskSchema.methods['addFollowUpAction'] = function(action: string, person: string, dueDate?: Date) {
  this.followUpActions.push({
    action,
    person,
    dueDate,
    completed: false
  });
  return this['save']();
};

// Method to complete follow-up action
SocialTaskSchema.methods['completeFollowUpAction'] = function(actionIndex: number) {
  if (this.followUpActions[actionIndex]) {
    this.followUpActions[actionIndex].completed = true;
  }
  return this['save']();
};

const SocialTask = mongoose.model<ISocialTask>('SocialTask', SocialTaskSchema);
export default SocialTask;
