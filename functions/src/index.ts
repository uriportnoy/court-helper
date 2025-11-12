import { askGPT, cleanHtmlText } from "./utils";
import * as mammoth from "mammoth";

const functions = require("firebase-functions");

// Load pdf-parse using require (v1.1.1 exports a simple function)
let cachedPdfParse: null | ((data: Buffer) => Promise<{ text: string }>) = null;
function getPdfParse() {
  if (cachedPdfParse) return cachedPdfParse;
  
  const pdfParse = require("pdf-parse");
  
  if (typeof pdfParse !== "function") {
    throw new Error("Failed to load pdf-parse function");
  }
  
  cachedPdfParse = pdfParse;
  return pdfParse;
}


exports.helloWorld = functions.https.onRequest(async (req: any, res: any) => {
  res.send("Hello from Firebase!");
});

exports.retext = functions.https.onRequest(async (req: any, res: any) => {
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
  res.set("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.status(204).send("");
    return;
  }

  const { text } = req.body || req.params;
  if (!text) {
    console.warn("Missing text in request");
    res.status(400).json({ error: "Missing 'text' in request body" });
    return;
  }
  try {
    const rewritten = await askGPT(
      `אתה עורך טקסט בעברית. 
שכתב את הטקסט כך שיהיה תקני, רהוט וברור — אך אל תשנה את תוכנו. 
אם יש שגיאות כתיב  – תקן אותם.
סדר את הטקסט עם תגיות HTML כך שהתוצאה תוצג בצורה ברורה בדפדפן.
השתמש ב־<p> לכל פסקה, הוסף dir="rtl" לכל תגית רלוונטית, והימנע מהוספת מידע חדש.`,
      text,
    );

    console.log("Rewritten text:", rewritten);
    res.status(200).json({ rewritten });
  } catch (err: any) {
    console.error("OpenAI error:", err);
    res
      .status(500)
      .json({ error: "Something went wrong", details: err.message || err });
  }
});

exports.cleanHtmlText = functions.https.onRequest(async (req: any, res: any) => {
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
  res.set("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.status(204).send("");
    return;
  }

  const { htmlText } = req.body;
  if (!htmlText) {
    console.warn("Missing htmlText in request");
    res.status(400).json({ error: "Missing 'htmlText' in request body" });
    return;
  }

  try {
    const cleanedHtml = await cleanHtmlText(htmlText);
    console.log("Cleaned HTML text:", cleanedHtml);
    res.status(200).json({ cleanedHtml });
  } catch (err: any) {
    console.error("OpenAI error:", err);
    res
      .status(500)
      .json({ error: "Something went wrong", details: err.message || err });
  }
});

exports.summarizeDocument = functions.https.onRequest(async (req: any, res: any) => {
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
  res.set("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.status(204).send("");
    return;
  }

  try {
    const { fileUrl } = req.body;
    if (!fileUrl) {
      res.status(400).json({ error: "Missing 'fileUrl' in request body" });
      return;
    }

    const summary = await summarizeFromUrl(fileUrl);
    res.status(200).json({ summary });
  } catch (err: any) {
    console.error("Summarize error:", err);
    res
      .status(500)
      .json({ error: "Something went wrong", details: err?.message || err });
  }
});

async function summarizeFromUrl(fileUrl: string): Promise<string> {
  // use global fetch without bringing DOM types
  const resp = await (global as any).fetch(fileUrl);
  if (!resp?.ok) {
    throw new Error(`Download failed: ${resp?.status} ${resp?.statusText}`);
  }

  const contentType: string = resp.headers.get("content-type") || "";
  const arrayBuf: ArrayBuffer = await resp.arrayBuffer();
  const buf = Buffer.from(arrayBuf);

  let text = "";
  if (contentType.includes("pdf") || /\.pdf(\?|$)/i.test(fileUrl)) {
    const pdfParse = getPdfParse();
    const parsed = await pdfParse(buf);
    text = parsed.text || "";
  } else if (
    contentType.includes("officedocument.wordprocessingml.document") ||
    /\.docx(\?|$)/i.test(fileUrl)
  ) {
    const parsed = await mammoth.extractRawText({ buffer: buf });
    text = parsed.value || "";
  } else if (contentType.startsWith("text/")) {
    text = buf.toString("utf8");
  } else {
    throw new Error(`Unsupported content-type: ${contentType || "unknown"}`);
  }

  const normalized = text.trim().replace(/\s+/g, " ");
  const MAX_CHARS = 12000;
  const snippet = normalized.slice(0, MAX_CHARS);

  const prompt = `אתה מסכם מסמכים משפטיים בעברית. החזר תקציר בעברית בלבד, ללא Markdown או קוד.
- ציין: בית משפט, מספר תיק, שמות הצדדים, מהות ההליך/בקשה.
- הדגש החלטות, מועדים ותאריכים, סכומים, הוראות אופרטיביות.
- החזר פלט תמציתי ומאורגן בפסקאות/נקודות, ללא הוספת מידע חדש.`;

  const summary = await askGPT(prompt, snippet);
  return stripMarkdownCodeFences(summary || "");
}

function stripMarkdownCodeFences(text: string): string {
  if (!text) return text;
  let t = text.trim();
  const fenced = t.match(/^\s*```(?:\w+)?\s*\n([\s\S]*?)\n```\s*$/);
  if (fenced) return fenced[1].trim();
  const anyBlock = t.match(/```(?:html)?\s*\n([\s\S]*?)\n```/i);
  if (anyBlock) return anyBlock[1].trim();
  t = t.replace(/^\s*```(?:\w+)?\s*/g, "").replace(/\s*```$/g, "");
  t = t.replace(/^<pre><code>/i, "").replace(/<\/code><\/pre>$/i, "");
  return t.trim();
}
