import { getPdfParse, stripMarkdownCodeFences } from "./pdfUtils";
import { askGPT } from "./utils";

export interface ParsedLegalEvent {
  caseNumber: string | null;
  relatedCases: string[];
  content: string; // summary of the document
  date: string | null; // YYYY-MM-DD or null if not found
  title: string;
  subtitle?: string | null;
}

const prompt = `
אתה עוזר משפטי מומחה בניתוח מסמכים משפטיים בעברית.

תקבל טקסט משני חלקים:
1. טקסט שנלקח מאזור העמוד הראשון (first page) – בו יש לרוב כותרת, מספר תיק, תאריך וכד'.
2. טקסט מלא/truncated של המסמך.

על בסיס המידע הזה החזר אובייקט JSON תקין אחד בלבד, ללא טקסט נוסף, ללא Markdown, במבנה הבא בדיוק:

{
  "caseNumber": string | null,
  "relatedCases": string[],
  "content": string,
  "date": string | null,
  "title": string,
  "subtitle": string | null
}

הנחיות לכל שדה:

- "caseNumber":
  - נסה לאתר את מספר התיק העיקרי במסמך (בפורמט ישראלי סטנדרטי, לדוגמה: "12345-01-23", "תלה\"מ 12345-01-24" וכו').
  - אם יש יותר ממספר תיק אחד, בחר את הראשון שמופיע כמספר תיק עיקרי.
  - אם לא הצלחת לזהות מספר תיק – החזר null.

- "relatedCases":
  - כל מספרי התיקים הנוספים שמופיעים במסמך, מלבד ה-caseNumber שנבחר.
  - ללא כפילויות, כולם כמחרוזות.
  - אם אין מספרים נוספים – החזר [].

- "content":
  - זהו שדה התקציר העיקרי.
  - התוכן חייב להיות **קטע HTML בלבד**, המותאם לשיבוץ ישירות בתוך ReactQuill (ללא תגיות <html> או <body>).
  - אל תשתמש בתגיות עם מאפיינים/attributes (ללא class, style וכו'), רק תגיות פשוטות כמו: <p>, <br />, <strong>, <em>, <u>, <ol>, <ul>, <li>, <blockquote>.
  - התחל ישירות מליבת ההכרעה, בניסוחים כגון:
    - "בית המשפט קבע כי ..."
    - "נקבע כי ..."
    - "הוחלט כי ..."
  - אל תכתוב פתיחים סיפוריים כגון:
    - "החלטה בבית משפט לענייני משפחה בתל אביב-יפו בתיק..."
    - "מדובר בסכסוך בין X ל-Y..."
    - "בין התובע A לנתבעת B..."
  - אל תציין ב-content:
    - שם בית המשפט,
    - מספר התיק,
    - שמות הצדדים,
    - שמות באי כוח או נציגים.
  - כלול בסיכום:
    - מה התבקש (בקשה לביטול דיון / פסלות / צו זמני / מזונות וכו').
    - מה בית המשפט קבע בפועל (אישור/דחייה/קבלה חלקית והוראות אופרטיביות).
    - מועדים ודד-ליינים חשובים.
    - סכומים מרכזיים, אם יש.
    - הנימוקים העיקריים בקצרה (1–3 משפטים).
  - שלב 1–3 ציטוטים מרכזיים מתוך ההחלטה, עם מירכאות כפולות בתוך הטקסט, לדוגמה:
    - <p>בית המשפט קבע כי "<strong>אין עוד מקום לעיכוב ההליך</strong>" נוכח טובת הקטינה.</p>

  Formatting rules (VERY IMPORTANT):
  1. Improve readability by:
     - Splitting very long paragraphs (you may add <p>...</p> or <br /> where needed).
     - Keeping all meaningful structure and inline formatting (<p>, <br />, <strong>, <em>, <u>, <ol>, <ul>, <li>, etc.).
  2. Delete list numbers / letters in the plain text (1., 2., a., b.) ONLY if they do not have independent legal meaning.
  3. Highlight the most important parts by wrapping them in <strong>...</strong>, for example:
     - קביעות עובדתיות מרכזיות
     - נימוקים משפטיים עיקריים
     - הפניות להחלטות קודמות / חוות דעת / עו"ס / מומחים
     - מסקנות וסיכומים מהותיים
  4. Do NOT add new arguments, sources or facts that are not in the original text.
  5. Do NOT return Markdown (no **bold**, no \`code\`). Return ONLY HTML suitable for ReactQuill.

  - הפלט של "content" חייב להיות רק HTML (ללא טקסט הסבר מסביב, ללא prefix/suffix).
  
- "date":
  - חפש תאריך בראש העמוד הראשון (first page text בלבד).
  - הפורמט הנדרש בפלט: "YYYY-MM-DD".
  - תוכל להמיר מתבנית ישראלית רגילה (למשל "3.9.2025" → "2025-09-03").
  - אם אין תאריך ברור או שאתה לא בטוח – החזר null.

- "title":
  - כותרת קצרה ועניינית למסמך (עד כ-120 תווים).
  - אם מהטקסט ברור שמדובר ב"החלטה" – דאג שהמילה "החלטה" תופיע ב-title, רצוי בתחילתו, למשל:
    - "החלטה בבקשה לדחיית מועד הדיון"
  - אם מדובר ב"פסק דין" – השתמש ב"פסק דין" בתחילת הכותרת, לדוגמה:
    - "פסק דין בעניין משמורת זמנית"
  - אם יש כותרת מפורשת במסמך – השתמש בה; אחרת גזור כותרת מתוכן ההליך.

- "subtitle":
  - תת-כותרת קצרה (משפט אחד) שמסכמת מהותי את ההחלטה בצורה אנושית, לדוגמה:
    - "דחיית בקשת הנתבעת לעיכוב הדיון, נוכח טובת הקטינה"
    - "קבלת בקשת האב להרחבת זמני השהות באופן חלקי"
  - אם אין צורך – אפשר להחזיר null.

- "type":
  - סוג המסמך ("mine", "notMine", "court", "thirdParty").
    - my name is אורי פורטנוי
    - other side name is עדי סרגוסי
    - try to guess if the document is mine, not mine, court document or third party document
  - אם אין צורך להחזיר סוג מסמך – החזר null.

חשוב מאוד:
- החזר אך ורק JSON תקין אחד, ללא טקסט מסביב, ללא הערות, ללא Markdown.
- ודא שכל השדות קיימים בדיוק בשם שניתן (גם אם הערך null).
`;
/**
 * Accepts a PDF file (Buffer or ArrayBuffer), extracts its text,
 * and returns a structured legal object using GPT.
 */
export async function parsePdfToLegalEvent(
  //   file: Buffer | ArrayBuffer
  fileUrl: string
): Promise<ParsedLegalEvent> {
  const resp = await (global as any).fetch(fileUrl);
  if (!resp?.ok) {
    throw new Error(`Download failed: ${resp?.status} ${resp?.statusText}`);
  }

  const contentType: string = resp.headers.get("content-type") || "";
  if (!contentType.includes("pdf") && !/\.pdf(\?|$)/i.test(fileUrl || "")) {
    throw new Error(
      `URL does not appear to be a PDF (content-type: ${
        contentType || "unknown"
      })`
    );
  }

  const arrayBuf: ArrayBuffer = await resp.arrayBuffer();
  const buf = Buffer.from(arrayBuf);
  // const buf = Buffer.isBuffer(file) ? file : Buffer.from(file as ArrayBuffer);

  const pdfParse = getPdfParse();

  const parsed = await pdfParse(buf);
  const rawText = parsed.text || "";

  // Normalize whitespace
  const normalized = rawText.replace(/\r\n/g, "\n").replace(/\s+/g, " ").trim();

  if (!normalized) {
    throw new Error("PDF appears to have no extractable text");
  }

  // Use the beginning as "first page" approximation for header/date
  const FIRST_PAGE_CHARS = 2000;
  const firstPageText = normalized.slice(0, FIRST_PAGE_CHARS);

  // Truncate the whole text to keep token usage reasonable
  const MAX_CHARS = 14000;
  const fullSnippet = normalized.slice(0, MAX_CHARS);

  const modelInput = `
URL המסמך:
${fileUrl}

עמוד ראשון (first page text):
"""${firstPageText}"""

-----
טקסט מלא (truncated):
"""${fullSnippet}"""
  `.trim();

  const raw = await askGPT(prompt, modelInput);
  const cleaned = stripMarkdownCodeFences(raw || "").trim();

  let result: ParsedLegalEvent;
  try {
    result = JSON.parse(cleaned);
  } catch (err) {
    // אם תרצה תוכל ללוגג את cleaned כדי לדבג מה GPT החזיר
    throw new Error(
      "Failed to parse JSON from GPT response: " + (err as Error).message
    );
  }

  // Sanitize / enforce shape
  const safe: ParsedLegalEvent = {
    caseNumber:
      typeof result.caseNumber === "string" && result.caseNumber.trim()
        ? result.caseNumber.trim()
        : null,
    relatedCases: Array.isArray(result.relatedCases)
      ? Array.from(
          new Set(
            result.relatedCases
              .filter((x) => typeof x === "string" && x.trim())
              .map((x) => x.trim())
          )
        )
      : [],
    content: typeof result.content === "string" ? result.content.trim() : "",
    date:
      typeof result.date === "string" && result.date.trim()
        ? result.date.trim()
        : null,
    title: typeof result.title === "string" ? result.title.trim() : "",
    subtitle:
      result.subtitle == null
        ? null
        : typeof result.subtitle === "string"
        ? result.subtitle.trim()
        : String(result.subtitle),
  };

  return safe;
}
