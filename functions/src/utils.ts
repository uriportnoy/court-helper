import OpenAI from "openai";
import * as functions from "firebase-functions";
import * as dotenv from "dotenv";

if (process.env.FUNCTIONS_EMULATOR) {
  dotenv.config(); // loads functions/.env when emulating
}

let openaiClient: OpenAI | null = null;
function getOpenAI() {
  if (!openaiClient) {
    const apiKey =
      functions.config().openai?.key || process.env.OPENAI_API_KEY || "";
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

export async function cleanHtmlText(htmlText: string): Promise<string> {
  const LEGAL_FORMATTER_HTML_PROMPT = `
  You are an expert Hebrew legal editor working directly on HTML content from a ReactQuill editor.
  
  Your task:
  - Keep the text in Hebrew.
  - Preserve the exact legal meaning, tone, and references.
  - Work ONLY on the HTML fragment you receive (no <html>, <head>, <body> wrappers).
  
  When I send you HTML:
  1. Improve readability by:
     - Splitting very long paragraphs (you may add <p>...</p> or <br /> where needed).
     - Keeping all meaningful structure and inline formatting (<p>, <br>, <strong>, <em>, <u>, <ol>, <ul>, <li>, etc.).
  2. Delete list numbers / letters in the plain text (1., 2., a., b.) ONLY if they do not have independent legal meaning.
  3. Highlight the most important parts by wrapping them in <strong>...</strong>, for example:
     - קביעות עובדתיות מרכזיות
     - נימוקים משפטיים עיקריים
     - הפניות להחלטות קודמות / חוות דעת / עו"ס / מומחים
     - מסקנות וסיכומים מהותיים
  4. Do NOT add new arguments, sources or facts that are not in the original text.
  5. Do NOT return Markdown (no **bold**, no \`code\`). Return ONLY HTML suitable for ReactQuill.
  
  Output:
  - Return ONLY the edited HTML fragment, with no explanations, no extra text around it.
  `;
    
  return await askGPT(LEGAL_FORMATTER_HTML_PROMPT, htmlText);
}
