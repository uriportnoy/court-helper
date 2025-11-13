import { askGPT } from "./utils";
import * as prompts from "./prompts";
import { summarizeFromUrl } from "./summarizeFromUrl";
import { cleanHtmlText } from "./cleanHtmlText";

const functions = require("firebase-functions");

const onRequest = (fn: (req: any, res: any) => Promise<void>) =>
  functions.https.onRequest(
    { cors: true, invoker: "public" },
    async (req: any, res: any) => {
      res.set("Access-Control-Allow-Origin", "*");
      res.set("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
      res.set("Access-Control-Allow-Headers", "Content-Type");

      if (req.method === "OPTIONS") {
        res.status(204).send("");
        return;
      }
      return fn(req, res);
    }
  );

exports.helloWorld = onRequest(async (req, res) => {
  res.send("Hello from Firebase!");
});

exports.retext = onRequest(async (req, res) => {
  const { text } = req.body || req.params;
  if (!text) {
    console.warn("Missing text in request");
    res.status(400).json({ error: "Missing 'text' in request body" });
    return;
  }
  try {
    const rewritten = await askGPT(prompts.rewrittenPrompt, text);

    console.log("Rewritten text:", rewritten);
    res.status(200).json({ rewritten });
  } catch (err: any) {
    console.error("OpenAI error:", err);
    res
      .status(500)
      .json({ error: "Something went wrong", details: err.message || err });
  }
});

exports.cleanHtmlText = onRequest(async (req, res) => {
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

exports.summarizeDocument = onRequest(async (req, res) => {
  const { fileUrl } = req.body;
  if (!fileUrl) {
    console.warn("Missing fileUrl in request");
    res.status(400).json({ error: "Missing 'fileUrl' in request body" });
    return;
  }

  try {
    const summary = await summarizeFromUrl(fileUrl);
    res.status(200).json({ summary });
  } catch (err: any) {
    console.error("Summarize error:", err);
    res
      .status(500)
      .json({ error: "Something went wrong", details: err?.message || err });
  }
});
