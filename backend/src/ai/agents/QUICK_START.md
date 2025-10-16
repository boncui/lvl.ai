# 🚀 Organizer Agent - Quick Start

## 30-Second Setup

```bash
# 1. Add to .env
echo "OPENROUTER_API_KEY=your_key_here" >> .env

# 2. Get your OpenRouter key (free)
# Visit: https://openrouter.ai/keys

# 3. Start the server
npm run dev
```

## Test It (3 ways)

### 1. Health Check (No Auth)
```bash
curl http://localhost:3000/api/organizer/health
```

### 2. Run Test Suite
```bash
export TEST_USER_ID=your_mongodb_user_id
npx ts-node src/ai/agents/testOrganizerAgent.ts
```

### 3. API Call (With Auth)
```bash
# Get JWT token first
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"your@email.com","password":"yourpass"}'

# Then use the organizer
curl http://localhost:3000/api/organizer/suggestions \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 6 Available Endpoints

```
POST   /api/organizer/chat                    # Ask anything
GET    /api/organizer/suggestions             # Get organization tips
GET    /api/organizer/daily-plan              # Get daily plan
GET    /api/organizer/productivity-analysis   # Analyze patterns
GET    /api/organizer/motivation              # Get motivated
GET    /api/organizer/context                 # View your context (debug)
```

## Quick Code Example

```typescript
import organizerAgent from './ai/agents/organizerAgent';

// Get suggestions
const tips = await organizerAgent.getOrganizationSuggestions(userId);

// Chat
const response = await organizerAgent.chatWithOrganizer(
  userId, 
  "What should I focus on?"
);

// Get daily plan
const plan = await organizerAgent.getDailyTaskPlan(userId);
```

## What It Does

1. **Retrieves** your user data and all tasks from MongoDB
2. **Formats** the data into AI-friendly context
3. **Sends** to OpenRouter's DeepSeek (FREE model)
4. **Returns** personalized, context-aware advice

## Cost

**$0.00** - DeepSeek via OpenRouter is completely free! 🎉

## Files

- `organizerAgent.ts` - Main agent (connection + retrieval)
- `testOrganizerAgent.ts` - Test suite
- `README.md` - Full documentation
- `organizerRoutes.ts` - API endpoints (in routes/)

## Example Response

```json
{
  "success": true,
  "suggestions": "Based on your 5 pending tasks and 1 overdue item, here's what I recommend:\n\n1. **Urgent Priority**: Complete the project proposal (OVERDUE) - 50 XP\n2. **High Priority**: Review pull requests (Due tomorrow) - 30 XP\n3. Group similar tasks together...",
  "metadata": {
    "type": "organization_suggestions"
  }
}
```

## Next Steps

1. ✅ Test the health endpoint
2. ✅ Run the test suite with your user ID
3. ✅ Try the API endpoints
4. ✅ Integrate with your frontend
5. ✅ Customize the prompts for your needs

Need help? Check `README.md` or `ORGANIZER_AGENT_GUIDE.md` in the root directory.

