import { ChatOpenAI } from "@langchain/openai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { env } from "../config/env";

// Lazy initialization - only create client when needed
let deepSeek: ChatOpenAI | null = null;
let prompt: ChatPromptTemplate | null = null;

/**
 * Get or create the DeepSeek client instance
 */
function getDeepSeekClient(): ChatOpenAI {
  // Validate on first use
  if (!env.DEEPSEEK_API_KEY) {
    throw new Error("DEEPSEEK_API_KEY environment variable is required to use LangChain provider");
  }

  if (!deepSeek) {
    deepSeek = new ChatOpenAI({
      model: "deepseek-chat", // DeepSeek's most powerful model
      apiKey: env.DEEPSEEK_API_KEY,
      configuration: {
        baseURL: "https://api.deepseek.com",
      },
      timeout: 30000, // 30 second timeout
      maxRetries: 2, // Retry failed requests up to 2 times
      temperature: 0.7, // Default temperature for natural responses
    });
  }

  return deepSeek;
}

/**
 * Get or create the prompt template
 */
function getPromptTemplate(): ChatPromptTemplate {
  if (!prompt) {
    prompt = ChatPromptTemplate.fromMessages([
      ["system", "{systemPrompt}"],
      ["user", "{userMessage}"],
    ]);
  }
  
  return prompt;
}

export async function askLVLBot(systemPrompt: string, userMessage: string, options?: { temperature?: number }): Promise<string> {
  try {
    if (!systemPrompt || !userMessage) {
      throw new Error("Both systemPrompt and userMessage are required");
    }

    // Create a new instance with custom temperature if provided, or use the cached instance
    const model = options?.temperature !== undefined 
      ? new ChatOpenAI({
          model: "deepseek-chat",
          apiKey: env.DEEPSEEK_API_KEY,
          configuration: {
            baseURL: "https://api.deepseek.com",
          },
          timeout: 30000,
          maxRetries: 2,
          temperature: options.temperature,
        })
      : getDeepSeekClient();

    const promptTemplate = getPromptTemplate();
    const customChain = promptTemplate.pipe(model).pipe(new StringOutputParser());
    const response = await customChain.invoke({ systemPrompt, userMessage });
    
    if (!response || typeof response !== 'string') {
      throw new Error("Invalid response from AI model");
    }

    return response.trim();
  } catch (error) {
    console.error("Error in askLVLBot:", error);
    
    // Return a fallback response instead of throwing
    return "I'm sorry, I'm having trouble processing your request right now. Please try again later or contact support if the issue persists.";
  }
}

export async function generateTaskSuggestions(userInput: string, options?: { temperature?: number }): Promise<string> {
  const systemPrompt = `You are a task management assistant for LVL.AI. Help users break down their goals into actionable, specific tasks. 
  
  Guidelines:
  - Provide clear, achievable task suggestions
  - Break down complex goals into smaller steps
  - Include time estimates when appropriate
  - Suggest task categories (work, personal, health, etc.)
  - Format output as a numbered list
  - Be encouraging and practical`;

  return askLVLBot(systemPrompt, userInput, options);
}

export async function analyzeTask(taskDescription: string, options?: { temperature?: number }): Promise<string> {
  const systemPrompt = `You are a productivity expert analyzing tasks for LVL.AI users. Analyze the given task and provide insights.
  
  Provide:
  - Task complexity assessment
  - Estimated time to complete
  - Required resources or dependencies
  - Potential challenges
  - Success tips
  - Suggested priority level`;

  return askLVLBot(systemPrompt, taskDescription, options);
}

export async function generateMotivationalMessage(taskType: string, options?: { temperature?: number }): Promise<string> {
  const systemPrompt = `You are a motivational coach for LVL.AI. Generate encouraging, personalized messages to help users stay motivated with their tasks.
  
  Guidelines:
  - Be positive and encouraging
  - Reference the specific task type
  - Keep messages concise (1-2 sentences)
  - Use a friendly, supportive tone
  - Avoid generic phrases`;

  return askLVLBot(systemPrompt, `Generate a motivational message for someone working on: ${taskType}`, options);
}

// Quick test
if (require.main === module) {
  askLVLBot(
    "You are a helpful task management assistant for LVL.AI.",
    "Help me plan my day with 3 important tasks"
  ).then(console.log).catch(console.error);
}
