import OpenAI from "openai";
import * as dotenv from "dotenv";

if (process.env.FUNCTIONS_EMULATOR) {
  dotenv.config(); // loads functions/.env when emulating
}

let openaiClient: OpenAI | null = null;
function getOpenAI() {
  if (!openaiClient) {
    const apiKey = process.env.OPENAI_API_KEY || "";
    if (!apiKey) {
      throw new Error(
        "Missing OpenAI API key. Set functions config (prod) or .env/ENV (local)."
      );
    }
    openaiClient = new OpenAI({ apiKey });
  }
  return openaiClient;
}

export async function askGPT(description: string, data: any) {
  const openai = getOpenAI();
  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: description },
      { role: "user", content: data },
    ],
  });
  return completion.choices?.[0]?.message?.content ?? "";
}


