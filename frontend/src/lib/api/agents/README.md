# 🤖 Organizer Agent - Frontend API

## Overview

This directory contains the frontend API client and types for interacting with the AI-powered task organizer agent. The agent provides intelligent task organization, prioritization, and productivity insights.

---

## Directory Structure

```
agents/
├── organizerAgent.ts    # Main API client
├── index.ts            # Exports
└── README.md          # This file
```

---

## Quick Start

### 1. Basic Import

```typescript
import { organizerAgentAPI } from '@/lib/api/agents/organizerAgent';
// OR
import { organizerAgentAPI } from '@/lib/api';
```

### 2. Using the Hook (Recommended)

```typescript
import { useOrganizerAgent } from '@/hooks/useOrganizerAgent';

function MyComponent() {
  const { 
    loading, 
    error, 
    chat, 
    getSuggestions,
    getDailyPlan 
  } = useOrganizerAgent();

  const handleGetSuggestions = async () => {
    try {
      const suggestions = await getSuggestions();
      console.log(suggestions);
    } catch (err) {
      console.error('Error:', err);
    }
  };

  return (
    <div>
      <button onClick={handleGetSuggestions} disabled={loading}>
        {loading ? 'Loading...' : 'Get Suggestions'}
      </button>
      {error && <p className="error">{error}</p>}
    </div>
  );
}
```

---

## API Functions

### Chat Functions

#### `chatWithOrganizer(request: ChatRequest): Promise<ChatResponse>`

Send a custom message to the organizer agent with full context.

```typescript
const response = await organizerAgentAPI.chatWithOrganizer({
  message: "What should I focus on today?",
  temperature: 0.7,      // Optional: 0.0-1.0
  maxTokens: 1000,       // Optional: max response length
  provider: 'langchain'  // Optional: 'langchain' or 'openrouter'
});

console.log(response.response); // AI response
```

#### `askOrganizer(message: string): Promise<string>`

Convenience function for quick questions.

```typescript
const answer = await organizerAgentAPI.askOrganizer(
  "Help me prioritize my tasks for today"
);
```

---

### Specialized Functions

#### `getOrganizationSuggestions(): Promise<string>`

Get AI-powered task organization and prioritization suggestions.

```typescript
const suggestions = await organizerAgentAPI.getOrganizationSuggestions();
```

#### `getDailyTaskPlan(): Promise<string>`

Get a daily task plan based on your current tasks and goals.

```typescript
const plan = await organizerAgentAPI.getDailyTaskPlan();
```

#### `getProductivityAnalysis(): Promise<string>`

Analyze your productivity patterns and get insights.

```typescript
const analysis = await organizerAgentAPI.getProductivityAnalysis();
```

#### `getMotivation(): Promise<string>`

Get personalized motivational messages.

```typescript
const motivation = await organizerAgentAPI.getMotivation();
```

---

### Utility Functions

#### `getUserContext(): Promise<ContextResponse>`

Get your complete user context (for debugging).

```typescript
const context = await organizerAgentAPI.getUserContext();
console.log(context.context.user);
console.log(context.context.tasks);
console.log(context.context.stats);
```

#### `testAIProvider(provider?: AIProvider): Promise<ProviderTestResult>`

Test AI provider connectivity.

```typescript
const test = await organizerAgentAPI.testAIProvider('langchain');
console.log(test.testResult.status); // 'connected' or 'error'
```

#### `checkHealth(): Promise<HealthCheckResponse>`

Check organizer agent health and available features.

```typescript
const health = await organizerAgentAPI.checkHealth();
console.log(health.providers); // { langchain: true, openrouter: true }
console.log(health.features);  // Array of available features
```

#### `getAvailableProviders(): Promise<AIProvider[]>`

Get list of available AI providers.

```typescript
const providers = await organizerAgentAPI.getAvailableProviders();
// Returns: ['langchain', 'openrouter']
```

#### `isProviderAvailable(provider: AIProvider): Promise<boolean>`

Check if a specific provider is available.

```typescript
const isAvailable = await organizerAgentAPI.isProviderAvailable('langchain');
```

---

## Using the Hook

The `useOrganizerAgent` hook provides an easy way to use the organizer agent in React components.

### Basic Example

```typescript
import { useOrganizerAgent } from '@/hooks/useOrganizerAgent';

function TaskOrganizerPanel() {
  const { loading, error, getSuggestions, clearError } = useOrganizerAgent();
  const [suggestions, setSuggestions] = useState('');

  const handleGetSuggestions = async () => {
    try {
      const result = await getSuggestions();
      setSuggestions(result);
    } catch (err) {
      // Error is already set in the hook
      console.error(err);
    }
  };

  return (
    <div>
      <button onClick={handleGetSuggestions} disabled={loading}>
        Get Suggestions
      </button>
      
      {error && (
        <div className="error">
          {error}
          <button onClick={clearError}>Dismiss</button>
        </div>
      )}
      
      {loading && <div>Loading...</div>}
      
      {suggestions && (
        <pre className="suggestions">{suggestions}</pre>
      )}
    </div>
  );
}
```

### Chat Example

```typescript
function OrganizerChat() {
  const { loading, chat } = useOrganizerAgent();
  const [message, setMessage] = useState('');
  const [conversation, setConversation] = useState<Array<{role: string, content: string}>>([]);

  const handleSend = async () => {
    if (!message.trim() || loading) return;

    // Add user message
    setConversation(prev => [...prev, { role: 'user', content: message }]);
    
    try {
      const response = await chat(message);
      setConversation(prev => [...prev, { role: 'assistant', content: response }]);
      setMessage('');
    } catch (err) {
      console.error('Chat error:', err);
    }
  };

  return (
    <div className="chat-container">
      <div className="messages">
        {conversation.map((msg, idx) => (
          <div key={idx} className={`message ${msg.role}`}>
            <strong>{msg.role === 'user' ? 'You' : 'Organizer'}:</strong>
            <p>{msg.content}</p>
          </div>
        ))}
      </div>
      
      <div className="input-area">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ask the organizer..."
          disabled={loading}
        />
        <button onClick={handleSend} disabled={loading || !message.trim()}>
          {loading ? 'Sending...' : 'Send'}
        </button>
      </div>
    </div>
  );
}
```

---

## Types

### Request Types

```typescript
interface ChatRequest {
  message: string;
  temperature?: number;      // 0.0-1.0 (creativity level)
  maxTokens?: number;        // Max response length
  provider?: AIProvider;     // 'langchain' | 'openrouter'
}
```

### Response Types

```typescript
interface ChatResponse {
  success: boolean;
  response: string;
  metadata: {
    userId: string;
    timestamp: string;
    model: string;
  };
}

interface OrganizationSuggestionsResponse {
  success: boolean;
  suggestions: string;
  metadata: {
    userId: string;
    timestamp: string;
    type: 'organization_suggestions';
  };
}

// Similar for: DailyPlanResponse, ProductivityAnalysisResponse, MotivationResponse
```

### Context Types

```typescript
interface UserContext {
  userId: string;
  name: string;
  email: string;
  level: number;
  xp: number;
  totalTasksCompleted: number;
  preferences: {
    timezone: string;
    dailyGoalXP: number;
  };
}

interface TaskContext {
  id: string;
  title: string;
  description?: string;
  priority: string;
  status: string;
  dueDate?: string;
  points: number;
  tags: string[];
  isOverdue?: boolean;
  // ... more fields
}
```

---

## Example Components

### 1. Daily Plan Widget

```typescript
function DailyPlanWidget() {
  const { getDailyPlan } = useOrganizerAgent();
  const [plan, setPlan] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadPlan();
  }, []);

  const loadPlan = async () => {
    setIsLoading(true);
    try {
      const result = await getDailyPlan();
      setPlan(result);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="daily-plan-widget">
      <h3>Today's Plan</h3>
      {isLoading ? (
        <div>Loading your plan...</div>
      ) : (
        <div className="plan-content">{plan}</div>
      )}
      <button onClick={loadPlan}>Refresh</button>
    </div>
  );
}
```

### 2. Motivation Banner

```typescript
function MotivationBanner() {
  const { getMotivation } = useOrganizerAgent();
  const [message, setMessage] = useState('');

  useEffect(() => {
    const loadMotivation = async () => {
      try {
        const msg = await getMotivation();
        setMessage(msg);
      } catch (err) {
        console.error(err);
      }
    };
    loadMotivation();
  }, []);

  if (!message) return null;

  return (
    <div className="motivation-banner">
      <span className="icon">💪</span>
      <p>{message}</p>
    </div>
  );
}
```

### 3. Provider Status Indicator

```typescript
function ProviderStatus() {
  const { checkHealth } = useOrganizerAgent();
  const [status, setStatus] = useState<any>(null);

  useEffect(() => {
    const loadStatus = async () => {
      try {
        const health = await checkHealth();
        setStatus(health);
      } catch (err) {
        console.error(err);
      }
    };
    loadStatus();
  }, []);

  if (!status) return null;

  return (
    <div className="provider-status">
      <div>
        LangChain: {status.providers.langchain ? '✅' : '❌'}
      </div>
      <div>
        OpenRouter: {status.providers.openrouter ? '✅' : '❌'}
      </div>
    </div>
  );
}
```

---

## Error Handling

All functions throw errors that can be caught:

```typescript
try {
  const response = await organizerAgentAPI.chatWithOrganizer({
    message: "Help me organize"
  });
} catch (error) {
  if (error instanceof Error) {
    console.error('Error:', error.message);
    // Handle specific errors
    if (error.message.includes('401')) {
      // Not authenticated
    } else if (error.message.includes('500')) {
      // Server error
    }
  }
}
```

---

## Best Practices

### 1. Use the Hook for Components

```typescript
// ✅ Good
const { getSuggestions } = useOrganizerAgent();

// ❌ Avoid direct API calls in components
organizerAgentAPI.getSuggestions();
```

### 2. Handle Loading States

```typescript
const { loading, getSuggestions } = useOrganizerAgent();

<button disabled={loading}>
  {loading ? 'Loading...' : 'Get Suggestions'}
</button>
```

### 3. Clear Errors When Appropriate

```typescript
const { error, clearError } = useOrganizerAgent();

useEffect(() => {
  return () => clearError(); // Clear on unmount
}, []);
```

### 4. Cache Responses

```typescript
const [cachedPlan, setCachedPlan] = useState<{
  data: string;
  timestamp: number;
} | null>(null);

const getPlan = async () => {
  // Check cache (e.g., 5 minutes)
  if (cachedPlan && Date.now() - cachedPlan.timestamp < 300000) {
    return cachedPlan.data;
  }
  
  const plan = await getDailyPlan();
  setCachedPlan({ data: plan, timestamp: Date.now() });
  return plan;
};
```

---

## Authentication

All endpoints (except `/health`) require authentication. The API client automatically includes the JWT token from the auth context.

Ensure the user is authenticated before calling organizer functions:

```typescript
import { useAuth } from '@/contexts/AuthContext';

function MyComponent() {
  const { user } = useAuth();
  const { getSuggestions } = useOrganizerAgent();

  if (!user) {
    return <div>Please log in to use the organizer</div>;
  }

  // ... rest of component
}
```

---

## Support

For issues or questions:
- Check backend logs for API errors
- Verify authentication tokens
- Check API endpoint availability with `/organizer/health`

---

**Status:** ✅ Ready for production use  
**Version:** 1.0.0  
**Last Updated:** October 2025

