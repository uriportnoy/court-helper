// Text cleaning function
export const cleanHtmlContent = async (htmlText: string) => {
  try {
    // api is different on dev
    const apiUrl = getURL();

    const response = await fetch(`${apiUrl}/cleanHtmlText`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ htmlText }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Server error:", errorText);
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    return data.cleanedHtml;
  } catch (error) {
    console.error("Error cleaning HTML:", error);
    throw error;
  }
};

function stripMarkdownCodeFencesClient(text: string) {
  if (!text) return text;
  let t = String(text).trim();
  const fenced = t.match(/^\s*```(?:\w+)?\s*\n([\s\S]*?)\n```\s*$/);
  if (fenced) return fenced[1].trim();
  const anyBlock = t.match(/```(?:html)?\s*\n([\s\S]*?)\n```/i);
  if (anyBlock) return anyBlock[1].trim();
  t = t.replace(/^\s*```(?:\w+)?\s*/g, "").replace(/\s*```$/g, "");
  t = t.replace(/^<pre><code>/i, "").replace(/<\/code><\/pre>$/i, "");
  return t.trim();
}

export const summarizeDocument = async (fileUrl: string) => {
  const apiUrl = getURL();

  const res = await fetch(`${apiUrl}/summarizeDocument`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fileUrl }),
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`HTTP ${res.status} ${t}`);
  }
  const data = await res.json();
  return stripMarkdownCodeFencesClient(data.summary || "");
};

export const readPDFObject = async (fileUrl: string) => {
  const apiUrl = getURL();
  const res = await fetch(`${apiUrl}/readPDFObject`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fileUrl }),
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`HTTP ${res.status} ${t}`);
  }
  const data = await res.json();
  return data.pdfObject;
};

function getURL() {
  // return "https://us-central1-timeline-38aac.cloudfunctions.net";
  const PROJECT_ID = "timeline-38aac";
  return process.env.NODE_ENV === "development"
    ? `http://127.0.0.1:5001/${PROJECT_ID}/us-central1`
    : `https://us-central1-${PROJECT_ID}.cloudfunctions.net`;
}
