# LVL.AI Task Management API Routes

This document provides comprehensive documentation for all task management API routes in the LVL.AI backend system.

## Table of Contents

- [General Task Routes](#general-task-routes)
- [Food Task Routes](#food-task-routes)
- [Homework Task Routes](#homework-task-routes)
- [Email Task Routes](#email-task-routes)
- [Meeting Task Routes](#meeting-task-routes)
- [Project Task Routes](#project-task-routes)
- [Personal Task Routes](#personal-task-routes)
- [Work Task Routes](#work-task-routes)
- [Health Task Routes](#health-task-routes)
- [Social Task Routes](#social-task-routes)
- [Other Task Routes](#other-task-routes)

## General Task Routes

**Base URL:** `/api/tasks`

### GET `/api/tasks`
Get all tasks for authenticated user with filtering and pagination.

**Query Parameters:**
- `taskType` (optional): Filter by task type
- `status` (optional): Filter by status
- `priority` (optional): Filter by priority
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

**Response:**
```json
{
  "tasks": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25
  }
}
```

### GET `/api/tasks/stats`
Get comprehensive task statistics for authenticated user.

**Query Parameters:**
- `period` (optional): Number of days to analyze (default: 30)

**Response:**
```json
{
  "totalTasks": 150,
  "byType": {
    "food": 25,
    "homework": 30,
    "email": 20,
    "meeting": 15,
    "project": 10,
    "personal": 25,
    "work": 15,
    "health": 5,
    "social": 3,
    "other": 2
  },
  "byStatus": {
    "pending": 50,
    "in_progress": 30,
    "completed": 60,
    "cancelled": 10
  },
  "byPriority": {
    "low": 40,
    "medium": 60,
    "high": 35,
    "urgent": 15
  },
  "totalXP": 1500,
  "overdue": 8
}
```

### POST `/api/tasks`
Create a new task.

**Body:**
```json
{
  "taskType": "food",
  "title": "Task title",
  "description": "Task description",
  "priority": "medium",
  "dueDate": "2024-01-15T10:00:00Z",
  "estimatedDuration": 60,
  "tags": ["tag1", "tag2"],
  "location": "Home"
}
```

### GET `/api/tasks/:taskType/:id`
Get a specific task by type and ID.

### PUT `/api/tasks/:taskType/:id`
Update a specific task.

### DELETE `/api/tasks/:taskType/:id`
Delete a specific task.

### GET `/api/tasks/:taskType`
Get tasks by specific type with filtering.

## Food Task Routes

**Base URL:** `/api/food-tasks`

### GET `/api/food-tasks`
Get all food tasks with filtering.

**Query Parameters:**
- `category`: Filter by food category (Breakfast, Lunch, Dinner, Snack, Drink)
- `healthRating`: Filter by health rating (1-5)
- `page`, `limit`: Pagination
- `sortBy`: Sort field (default: loggedAt)
- `sortOrder`: Sort order (asc/desc, default: desc)

### GET `/api/food-tasks/stats`
Get food task statistics.

**Response:**
```json
{
  "totalFoodTasks": 50,
  "byCategory": {
    "Breakfast": 15,
    "Lunch": 20,
    "Dinner": 10,
    "Snack": 3,
    "Drink": 2
  },
  "byHealthRating": {
    "1": 5,
    "2": 10,
    "3": 15,
    "4": 15,
    "5": 5
  },
  "averageCalories": 450,
  "averageProtein": 25,
  "totalCost": 150.50,
  "healthyMeals": 35,
  "unhealthyMeals": 15
}
```

### POST `/api/food-tasks`
Create a new food task.

**Body:**
```json
{
  "title": "Healthy Breakfast",
  "foodName": "Oatmeal with berries",
  "category": "Breakfast",
  "calories": 300,
  "protein": 12,
  "carbs": 45,
  "fats": 8,
  "healthRating": 4,
  "ingredients": ["oats", "berries", "milk"],
  "cost": 3.50
}
```

### POST `/api/food-tasks/:id/ingredients`
Add an ingredient to a food task.

### PUT `/api/food-tasks/:id/ai-suggestions`
Update AI suggestions for a food task.

### GET `/api/food-tasks/:id/nutritional-density`
Get nutritional density metrics.

### GET `/api/food-tasks/search/ingredients`
Search food tasks by ingredients.

## Homework Task Routes

**Base URL:** `/api/homework-tasks`

### GET `/api/homework-tasks`
Get all homework tasks with filtering.

**Query Parameters:**
- `subject`: Filter by subject
- `assignmentType`: Filter by assignment type
- `difficulty`: Filter by difficulty (easy, medium, hard)
- `status`: Filter by status

### GET `/api/homework-tasks/stats`
Get homework task statistics.

**Response:**
```json
{
  "totalHomeworkTasks": 25,
  "bySubject": {
    "Mathematics": 8,
    "Science": 6,
    "English": 5,
    "History": 4,
    "Art": 2
  },
  "byAssignmentType": {
    "essay": 5,
    "problem_set": 10,
    "project": 6,
    "reading": 3,
    "quiz": 1
  },
  "overdue": 3,
  "averageStudyTime": 120,
  "completionRate": 80
}
```

### POST `/api/homework-tasks`
Create a new homework task.

**Body:**
```json
{
  "title": "Math Problem Set",
  "subject": "Mathematics",
  "assignmentType": "problem_set",
  "difficulty": "medium",
  "dueDate": "2024-01-20T23:59:00Z",
  "estimatedStudyTime": 120,
  "materials": ["textbook", "calculator"],
  "isGroupWork": false
}
```

### POST `/api/homework-tasks/:id/materials`
Add a material to homework task.

### POST `/api/homework-tasks/:id/group-members`
Add a group member to homework task.

### PUT `/api/homework-tasks/:id/study-time`
Update study time for homework task.

### GET `/api/homework-tasks/:id/study-efficiency`
Get study efficiency metrics.

### GET `/api/homework-tasks/upcoming`
Get upcoming homework tasks.

## Email Task Routes

**Base URL:** `/api/email-tasks`

### GET `/api/email-tasks`
Get all email tasks with filtering.

**Query Parameters:**
- `emailType`: Filter by email type
- `emailPriority`: Filter by email priority
- `status`: Filter by status
- `isReply`: Filter by reply status

### GET `/api/email-tasks/stats`
Get email task statistics.

**Response:**
```json
{
  "totalEmailTasks": 40,
  "byEmailType": {
    "personal": 15,
    "work": 20,
    "newsletter": 3,
    "follow_up": 2
  },
  "sentEmails": 35,
  "replies": 8,
  "followUpsNeeded": 5,
  "overdue": 2
}
```

### POST `/api/email-tasks`
Create a new email task.

**Body:**
```json
{
  "title": "Follow up email",
  "recipient": "client@example.com",
  "recipientName": "John Doe",
  "subject": "Project Update",
  "emailType": "work",
  "emailPriority": "high",
  "draftContent": "Dear John, here's the project update...",
  "followUpDate": "2024-01-25T10:00:00Z"
}
```

### POST `/api/email-tasks/:id/mark-sent`
Mark an email as sent.

### POST `/api/email-tasks/:id/mark-reply-received`
Mark a reply as received.

### POST `/api/email-tasks/:id/schedule-follow-up`
Schedule a follow-up for an email.

### GET `/api/email-tasks/follow-ups-needed`
Get email tasks that need follow-up.

## Meeting Task Routes

**Base URL:** `/api/meeting-tasks`

### GET `/api/meeting-tasks`
Get all meeting tasks with filtering.

**Query Parameters:**
- `meetingType`: Filter by meeting type
- `status`: Filter by status
- `recurringMeeting`: Filter by recurring status

### GET `/api/meeting-tasks/stats`
Get meeting task statistics.

**Response:**
```json
{
  "totalMeetingTasks": 20,
  "byMeetingType": {
    "team_meeting": 8,
    "one_on_one": 5,
    "client_meeting": 4,
    "presentation": 2,
    "workshop": 1
  },
  "recurringMeetings": 6,
  "averageDuration": 60,
  "totalActionItems": 45,
  "completedActionItems": 30,
  "happeningNow": 1
}
```

### POST `/api/meeting-tasks`
Create a new meeting task.

**Body:**
```json
{
  "title": "Weekly Team Standup",
  "meetingType": "team_meeting",
  "attendees": ["user1", "user2", "user3"],
  "meetingRoom": "Conference Room A",
  "meetingLink": "https://zoom.us/j/123456789",
  "agenda": ["Review progress", "Discuss blockers", "Plan next week"],
  "meetingDuration": 30,
  "startDate": "2024-01-15T10:00:00Z",
  "dueDate": "2024-01-15T10:30:00Z"
}
```

### POST `/api/meeting-tasks/:id/attendees`
Add an attendee to meeting task.

### POST `/api/meeting-tasks/:id/action-items`
Add an action item to meeting task.

### POST `/api/meeting-tasks/:id/action-items/:actionIndex/complete`
Complete an action item.

### GET `/api/meeting-tasks/happening-now`
Get meetings happening now.

### GET `/api/meeting-tasks/upcoming`
Get upcoming meetings.

## Project Task Routes

**Base URL:** `/api/project-tasks`

### GET `/api/project-tasks`
Get all project tasks with filtering.

**Query Parameters:**
- `projectPhase`: Filter by project phase
- `projectType`: Filter by project type
- `projectStatus`: Filter by project status

### GET `/api/project-tasks/stats`
Get project task statistics.

**Response:**
```json
{
  "totalProjectTasks": 15,
  "byProjectPhase": {
    "planning": 3,
    "development": 8,
    "testing": 2,
    "deployment": 1,
    "completed": 1
  },
  "totalBudget": 50000,
  "totalActualCost": 35000,
  "totalMilestones": 45,
  "completedMilestones": 30,
  "overdueMilestones": 5
}
```

### POST `/api/project-tasks`
Create a new project task.

**Body:**
```json
{
  "title": "Website Redesign",
  "projectName": "Company Website",
  "projectPhase": "development",
  "projectType": "work",
  "teamMembers": ["user1", "user2"],
  "budget": 10000,
  "startDate": "2024-01-01T00:00:00Z",
  "endDate": "2024-03-31T23:59:59Z",
  "repositoryLink": "https://github.com/company/website",
  "clientName": "ABC Corp"
}
```

### POST `/api/project-tasks/:id/milestones`
Add a milestone to project task.

### POST `/api/project-tasks/:id/milestones/:milestoneIndex/complete`
Complete a milestone.

### POST `/api/project-tasks/:id/team-members`
Add a team member to project task.

### POST `/api/project-tasks/:id/dependencies`
Add a dependency to project task.

### GET `/api/project-tasks/overdue-milestones`
Get projects with overdue milestones.

## Personal Task Routes

**Base URL:** `/api/personal-tasks`

### GET `/api/personal-tasks`
Get all personal tasks with filtering.

**Query Parameters:**
- `personalCategory`: Filter by personal category
- `priority`: Filter by priority
- `status`: Filter by status
- `mood`: Filter by mood

### GET `/api/personal-tasks/stats`
Get personal task statistics.

**Response:**
```json
{
  "totalPersonalTasks": 30,
  "byCategory": {
    "self_care": 8,
    "hobby": 6,
    "learning": 5,
    "fitness": 4,
    "social": 3,
    "family": 2,
    "finance": 1,
    "home": 1
  },
  "recurringTasks": 12,
  "totalCost": 250.75,
  "completionRate": 85
}
```

### POST `/api/personal-tasks`
Create a new personal task.

**Body:**
```json
{
  "title": "Morning Yoga",
  "personalCategory": "fitness",
  "priority": "medium",
  "estimatedDuration": 30,
  "isRecurring": true,
  "mood": "motivated",
  "notes": "Focus on flexibility and breathing"
}
```

### GET `/api/personal-tasks/mood-tracking`
Get mood tracking data.

## Work Task Routes

**Base URL:** `/api/work-tasks`

### GET `/api/work-tasks`
Get all work tasks with filtering.

**Query Parameters:**
- `workCategory`: Filter by work category
- `priority`: Filter by priority
- `status`: Filter by status
- `isBillable`: Filter by billable status

### GET `/api/work-tasks/stats`
Get work task statistics.

**Response:**
```json
{
  "totalWorkTasks": 25,
  "byCategory": {
    "meeting": 8,
    "email": 6,
    "documentation": 4,
    "coding": 5,
    "testing": 2
  },
  "billableTasks": 20,
  "totalBillableHours": 120,
  "totalEarnings": 3600,
  "averageHourlyRate": 30,
  "completionRate": 90
}
```

### POST `/api/work-tasks`
Create a new work task.

**Body:**
```json
{
  "title": "Code Review",
  "workCategory": "coding",
  "priority": "high",
  "estimatedDuration": 60,
  "isBillable": true,
  "hourlyRate": 50,
  "clientName": "Tech Corp",
  "projectName": "E-commerce Platform"
}
```

## Health Task Routes

**Base URL:** `/api/health-tasks`

### GET `/api/health-tasks`
Get all health tasks with filtering.

**Query Parameters:**
- `healthCategory`: Filter by health category
- `priority`: Filter by priority
- `status`: Filter by status
- `mood`: Filter by mood

### GET `/api/health-tasks/stats`
Get health task statistics.

**Response:**
```json
{
  "totalHealthTasks": 20,
  "byCategory": {
    "exercise": 8,
    "medical": 4,
    "mental_health": 3,
    "nutrition": 3,
    "sleep": 2
  },
  "averageEnergyLevel": 7,
  "averagePainLevel": 2,
  "recurringTasks": 15,
  "completionRate": 75
}
```

### POST `/api/health-tasks`
Create a new health task.

**Body:**
```json
{
  "title": "Doctor Appointment",
  "healthCategory": "medical",
  "priority": "high",
  "estimatedDuration": 60,
  "mood": "neutral",
  "energyLevel": 6,
  "painLevel": 3,
  "healthNotes": "Annual checkup"
}
```

## Social Task Routes

**Base URL:** `/api/social-tasks`

### GET `/api/social-tasks`
Get all social tasks with filtering.

**Query Parameters:**
- `socialCategory`: Filter by social category
- `priority`: Filter by priority
- `status`: Filter by status
- `mood`: Filter by mood

### GET `/api/social-tasks/stats`
Get social task statistics.

**Response:**
```json
{
  "totalSocialTasks": 15,
  "byCategory": {
    "family": 6,
    "friends": 4,
    "networking": 3,
    "community": 2
  },
  "averageEnergyLevel": 8,
  "recurringTasks": 8,
  "completionRate": 80
}
```

### POST `/api/social-tasks`
Create a new social task.

**Body:**
```json
{
  "title": "Family Dinner",
  "socialCategory": "family",
  "priority": "medium",
  "estimatedDuration": 120,
  "mood": "excited",
  "energyLevel": 9,
  "socialNotes": "Celebrating mom's birthday"
}
```

## Other Task Routes

**Base URL:** `/api/other-tasks`

### GET `/api/other-tasks`
Get all other tasks with filtering.

**Query Parameters:**
- `otherCategory`: Filter by other category
- `priority`: Filter by priority
- `status`: Filter by status
- `mood`: Filter by mood

### GET `/api/other-tasks/stats`
Get other task statistics.

**Response:**
```json
{
  "totalOtherTasks": 10,
  "byCategory": {
    "miscellaneous": 4,
    "errand": 3,
    "shopping": 2,
    "maintenance": 1
  },
  "averageEnergyLevel": 6,
  "recurringTasks": 3,
  "completionRate": 70
}
```

### POST `/api/other-tasks`
Create a new other task.

**Body:**
```json
{
  "title": "Grocery Shopping",
  "otherCategory": "shopping",
  "priority": "medium",
  "estimatedDuration": 90,
  "mood": "neutral",
  "energyLevel": 7,
  "otherNotes": "Need to buy ingredients for dinner"
}
```

## Authentication

All routes require authentication except for the API status endpoint. Include the authentication token in the request headers or cookies as configured in your authentication middleware.

## Error Handling

All routes return appropriate HTTP status codes and error messages:

- `200`: Success
- `201`: Created
- `400`: Bad Request (validation errors)
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `500`: Internal Server Error

Error responses include a descriptive error message:

```json
{
  "error": "Error description"
}
```

## Pagination

Most list endpoints support pagination with the following query parameters:

- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)

Pagination response includes:

```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "pages": 10
  }
}
```

## Filtering and Sorting

Most endpoints support filtering and sorting:

- **Filtering**: Use query parameters to filter results
- **Sorting**: Use `sortBy` and `sortOrder` parameters
- **Search**: Use search endpoints for text-based searches

## Rate Limiting

API endpoints may be subject to rate limiting. Check response headers for rate limit information.
