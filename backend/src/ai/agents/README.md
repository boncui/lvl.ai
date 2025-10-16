# Organizer Agent - RAG Task Management Assistant

## Overview

The Organizer Agent is a Retrieval-Augmented Generation (RAG) agent that helps users organize and manage their tasks using AI. It connects to **OpenRouter's DeepSeek free model** and retrieves user data and tasks from the database to provide personalized, context-aware task organization assistance.

## Architecture

```
┌─────────────────┐
│   User Request  │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────┐
│   Organizer Agent               │
│                                 │
│  1. Retrieve User Context       │
│     ├─ User Profile             │
│     ├─ All Tasks                │
│     └─ Statistics               │
│                                 │
│  2. Format Context              │
│     └─ Create AI Prompt         │
│                                 │
│  3. Query OpenRouter            │
│     └─ DeepSeek (Free Model)    │
│                                 │
│  4. Return AI Response          │
└─────────────────────────────────┘
         │
         ▼
┌─────────────────┐
│  AI Response    │
│  to User        │
└─────────────────┘
```

## Key Features

### ✅ Connection
- **OpenRouter Integration**: Uses OpenRouter API for accessing DeepSeek models
- **Free Model**: Uses `deepseek/deepseek-chat` (free tier)
- **Error Handling**: Comprehensive error handling and logging
- **TypeScript**: Fully typed for better developer experience

### ✅ Data Retrieval
- **User Profile**: Retrieves user information (name, level, XP, preferences)
- **Task Management**: Fetches all tasks with status, priority, and deadlines
- **Statistics**: Calculates task statistics (pending, completed, overdue)
- **Context Building**: Formats data into AI-readable prompts

### 🎯 Core Capabilities
1. Task organization and prioritization suggestions
2. Daily task planning
3. Productivity pattern analysis
4. Motivational messages based on user progress
5. Custom chat interactions with full context

## Setup

### 1. Environment Variables

Add to your `.env` file:

```bash
# OpenRouter API Key (Required)
OPENROUTER_API_KEY=your_openrouter_api_key_here

# MongoDB URI (Required)
MONGODB_URI=mongodb://localhost:27017/lvl-ai
```

### 2. Get OpenRouter API Key

1. Visit [OpenRouter.ai](https://openrouter.ai/)
2. Sign up for an account
3. Get your API key from the dashboard
4. DeepSeek's `deepseek-chat` model is **FREE** to use!

### 3. Install Dependencies

```bash
cd backend
npm install
```

Dependencies used:
- `openai` - OpenRouter client (OpenAI SDK compatible)
- `mongoose` - MongoDB ODM
- Existing project dependencies

## Usage

### Import the Agent

```typescript
import organizerAgent from './ai/agents/organizerAgent';
```

### Basic Usage Examples

#### 1. Retrieve User Context (RAG Step)

```typescript
// Get complete user context for RAG
const context = await organizerAgent.retrieveCompleteContext(userId);

console.log(context.user);        // User profile
console.log(context.tasks);       // All tasks
console.log(context.stats);       // Task statistics
```

#### 2. Chat with the Agent

```typescript
// Ask the agent anything about task organization
const response = await organizerAgent.chatWithOrganizer(
  userId,
  "What should I focus on today?"
);

console.log(response);
```

#### 3. Get Organization Suggestions

```typescript
// Get AI-powered task organization suggestions
const suggestions = await organizerAgent.getOrganizationSuggestions(userId);
console.log(suggestions);
```

#### 4. Get Daily Task Plan

```typescript
// Create a daily task plan
const plan = await organizerAgent.getDailyTaskPlan(userId);
console.log(plan);
```

#### 5. Analyze Productivity

```typescript
// Analyze user's productivity patterns
const analysis = await organizerAgent.analyzeProductivity(userId);
console.log(analysis);
```

#### 6. Get Motivation

```typescript
// Get motivational message
const motivation = await organizerAgent.getMotivation(userId);
console.log(motivation);
```

## API Reference

### Core Functions

#### `retrieveUserData(userId: string)`
Retrieves user profile data from the database.

**Returns:** `Promise<UserContext | null>`

#### `retrieveUserTasks(userId: string)`
Retrieves all tasks for a specific user.

**Returns:** `Promise<TaskContext[]>`

#### `retrieveCompleteContext(userId: string)`
Retrieves complete context including user profile, tasks, and statistics.

**Returns:** `Promise<RetrievedContext>`

#### `chatWithOrganizer(userId: string, userMessage: string, options?)`
Main chat interface with the AI agent.

**Parameters:**
- `userId` - User ID
- `userMessage` - User's question or request
- `options` - Optional settings
  - `temperature` - AI temperature (0.0-1.0, default: 0.7)
  - `maxTokens` - Max response length (default: 1000)

**Returns:** `Promise<string>` - AI response

### Specialized Functions

#### `getOrganizationSuggestions(userId: string)`
Get task organization and prioritization suggestions.

#### `getDailyTaskPlan(userId: string)`
Generate a daily task plan.

#### `analyzeProductivity(userId: string)`
Analyze productivity patterns and habits.

#### `getMotivation(userId: string)`
Get motivational messages based on progress.

## Testing

### Run the Test Suite

```bash
# Set test user ID
export TEST_USER_ID=your_user_id_here

# Run tests
npm run test:organizer
# OR
npx ts-node src/ai/agents/testOrganizerAgent.ts
```

### What the Tests Cover

1. ✅ **Data Retrieval Tests** (No API calls)
   - Retrieve user data
   - Retrieve user tasks
   - Retrieve complete context
   - Format context for AI

2. ✅ **AI Integration Tests** (With API calls)
   - Chat with organizer
   - Get organization suggestions
   - Get daily task plan
   - Analyze productivity
   - Get motivation

## Data Flow

### 1. Retrieval Phase (RAG)

```typescript
// Step 1: Retrieve user data
const user = await retrieveUserData(userId);

// Step 2: Retrieve tasks
const tasks = await retrieveUserTasks(userId);

// Step 3: Calculate statistics
const stats = calculateStats(tasks);

// Step 4: Format for AI
const prompt = formatContextForPrompt({ user, tasks, stats });
```

### 2. AI Query Phase

```typescript
// Step 1: Build system prompt with context
const systemPrompt = buildSystemPrompt(context);

// Step 2: Call OpenRouter with DeepSeek model
const response = await openRouterClient.chat.completions.create({
  model: "deepseek/deepseek-chat",
  messages: [
    { role: "system", content: systemPrompt },
    { role: "user", content: userMessage }
  ]
});

// Step 3: Return AI response
return response.choices[0].message.content;
```

## Context Format

The agent formats user context like this:

```
# USER PROFILE
Name: John Doe
Level: 5 | XP: 450
Completed Tasks: 23
Daily Goal: 100 XP
Timezone: UTC

# TASK STATISTICS
Total Tasks: 12
Pending: 5 | In Progress: 2
Completed: 4 | Overdue: 1

# TASK LIST
## PENDING TASKS (5)
1. [HIGH] Complete project proposal
   Description: Write the Q1 project proposal
   Due: 2025-10-18 ⚠️ OVERDUE
   Tags: work, urgent
   Points: 50 XP

2. [MEDIUM] Review pull requests
   Due: 2025-10-20
   Tags: development, code-review
   Points: 30 XP

...
```

This context is provided to the AI to generate personalized responses.

## Error Handling

The agent includes comprehensive error handling:

```typescript
try {
  const response = await organizerAgent.chatWithOrganizer(userId, message);
  // Success
} catch (error) {
  if (error.message.includes("User not found")) {
    // Handle user not found
  } else if (error.message.includes("OpenRouter")) {
    // Handle API error
  } else {
    // Handle other errors
  }
}
```

## Performance Considerations

### Database Queries
- Optimized queries with proper indexing
- Selective field projection (excludes sensitive data)
- Single query per data type

### API Calls
- Free model usage (no cost)
- Configurable token limits
- Request timeout handling
- Retry logic (via OpenAI SDK)

### Caching (Future Enhancement)
Consider implementing caching for:
- User context (TTL: 5 minutes)
- Task statistics (TTL: 2 minutes)
- Recent AI responses (TTL: 1 minute)

## Integration with Routes

### Example Express Route

```typescript
import { Router } from 'express';
import organizerAgent from '../ai/agents/organizerAgent';
import { authenticate } from '../middleware/auth';

const router = Router();

// POST /api/organizer/chat
router.post('/chat', authenticate, async (req, res) => {
  try {
    const userId = req.user._id;
    const { message } = req.body;
    
    const response = await organizerAgent.chatWithOrganizer(userId, message);
    
    res.json({ success: true, response });
  } catch (error) {
    console.error('Organizer agent error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get response from organizer' 
    });
  }
});

// GET /api/organizer/suggestions
router.get('/suggestions', authenticate, async (req, res) => {
  try {
    const userId = req.user._id;
    const suggestions = await organizerAgent.getOrganizationSuggestions(userId);
    
    res.json({ success: true, suggestions });
  } catch (error) {
    console.error('Error getting suggestions:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get suggestions' 
    });
  }
});

export default router;
```

## Security Considerations

### Data Privacy
- ✅ Excludes sensitive fields (passwords, tokens)
- ✅ Validates user IDs before queries
- ✅ User-scoped data retrieval only
- ✅ No data shared between users

### API Security
- ✅ API key stored in environment variables
- ✅ Request authentication required
- ✅ Rate limiting recommended (future)
- ✅ Error messages don't expose internals

## Future Enhancements

### Planned Features
- [ ] **Vector Database**: Add embeddings for semantic task search
- [ ] **Task Similarity**: Find similar tasks using embeddings
- [ ] **Smart Scheduling**: AI-powered task scheduling
- [ ] **Context Caching**: Redis cache for frequently accessed data
- [ ] **Conversation History**: Multi-turn conversations
- [ ] **User Feedback**: Learn from user preferences
- [ ] **Batch Processing**: Process multiple users efficiently
- [ ] **Analytics**: Track agent usage and effectiveness

### Model Upgrades
- [ ] Support multiple AI providers (fallback)
- [ ] A/B test different models
- [ ] Fine-tuned models for task management
- [ ] Support for larger context windows

## Troubleshooting

### Common Issues

#### 1. "User not found"
- Verify the user ID exists in the database
- Check MongoDB connection
- Ensure userId format is valid ObjectId

#### 2. "OpenRouter API error"
- Check OPENROUTER_API_KEY is set
- Verify API key is valid
- Check network connectivity
- Review OpenRouter status page

#### 3. "No response from AI model"
- Check OpenRouter API status
- Verify model name is correct
- Check token limits
- Review error logs

#### 4. Empty task list
- Verify user has tasks in database
- Check task retrieval query
- Ensure userId matches

## Contributing

When contributing to the Organizer Agent:

1. Maintain TypeScript types
2. Add error handling for new functions
3. Update tests for new features
4. Update this README
5. Follow existing code style
6. Add JSDoc comments for public functions

## License

Part of the LVL.AI project.

---

**Last Updated:** October 2025  
**Version:** 1.0.0  
**Status:** Production Ready ✅

