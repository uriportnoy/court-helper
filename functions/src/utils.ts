import OpenAI from "openai";
import * as functions from "firebase-functions";
import * as dotenv from "dotenv";
if (process.env.FUNCTIONS_EMULATOR) {
  dotenv.config();
}

const openai = new OpenAI({
  apiKey: functions.config().openai?.key,
});
export async function askGPT(description: string, data: any) {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: description,
        },
        {
          role: "user",
          content: data,
        },
      ],
    });

    const rewritten = completion.choices?.[0]?.message?.content ?? "";

    console.log("Rewritten text:", rewritten);
    return rewritten;
  } catch (err: any) {
    console.error("OpenAI error:", err);
    throw new Error(
      "Something went wrong with OpenAI: " + (err.message || err),
    );
  }
}
