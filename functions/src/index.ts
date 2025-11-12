import { askGPT, cleanHtmlText } from "./utils";

const functions = require("firebase-functions");

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
