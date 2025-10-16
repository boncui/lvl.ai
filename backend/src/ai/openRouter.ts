import OpenAI from "openai";
import { env } from "../config/env";

const client = new OpenAI({
  apiKey: env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
});

export async function testDeepSeek() {
  try {
    const resp = await client.chat.completions.create({
      model: "deepseek/deepseek-chat",
      messages: [
        {
          role: "system",
          content: "You are an Agora Campus Market assistant. Only answer using listing info.",
        },
        { role: "user", content: "Is this chair still available?" },
      ],
    });

    console.log(resp.choices[0]?.message);
    return resp.choices[0]?.message;
  } catch (err) {
    console.error("Error calling DeepSeek via OpenRouter:", err);
    throw err;
  }
}

if (require.main === module) {
  testDeepSeek();
}
