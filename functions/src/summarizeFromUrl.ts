import * as mammoth from "mammoth";
import { askGPT } from "./utils";


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

export async function summarizeFromUrl(fileUrl: string): Promise<string> {
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
