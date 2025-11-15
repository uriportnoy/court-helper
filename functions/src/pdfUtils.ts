// Load pdf-parse using require (v1.1.1 exports a simple function)
let cachedPdfParse: null | ((data: Buffer) => Promise<{ text: string }>) = null;
export function getPdfParse() {
  if (cachedPdfParse) return cachedPdfParse;

  const pdfParse = require("pdf-parse");

  if (typeof pdfParse !== "function") {
    throw new Error("Failed to load pdf-parse function");
  }

  cachedPdfParse = pdfParse;
  return pdfParse;
}

export function stripMarkdownCodeFences(text: string): string {
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