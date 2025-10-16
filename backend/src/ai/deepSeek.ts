import OpenAI from "openai";
import { env } from "../config/env";

const client = new OpenAI({
  apiKey: env.DEEPSEEK_API_KEY,
  baseURL: "https://api.deepseek.com",
});

export async function testDeepSeek() {
  try {
    const response = await client.chat.completions.create({
      model: "deepseek-chat",
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: "Is this chair still available?" },
      ],
    });

    console.log(response.choices[0]?.message);
    return response.choices[0]?.message;
  } catch (error) {
    console.error("Error calling DeepSeek API:", error);
    throw error;
  }
}

export async function chatWithDeepSeek(messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[]) {
  try {
    const response = await client.chat.completions.create({
      model: "deepseek-chat",
      messages: messages,
    });

    return response.choices[0]?.message;
  } catch (error) {
    console.error("Error calling DeepSeek API:", error);
    throw error;
  }
}

export async function generateTaskSuggestion(userInput: string) {
  try {
    const response = await client.chat.completions.create({
      model: "deepseek-chat",
      messages: [
        { 
          role: "system", 
          content: "You are a task management assistant. Help users break down their goals into actionable tasks. Provide clear, specific, and achievable task suggestions." 
        },
        { 
          role: "user", 
          content: `Help me create tasks for: ${userInput}` 
        },
      ],
    });

    return response.choices[0]?.message;
  } catch (error) {
    console.error("Error generating task suggestion:", error);
    throw error;
  }
}

if (require.main === module) {
  testDeepSeek();
}
