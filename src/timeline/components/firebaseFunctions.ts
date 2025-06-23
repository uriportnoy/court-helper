// api is different on dev
const apiUrl =
  process.env.NODE_ENV === "development"
    ? "http://localhost:5001/timeline-38aac/us-central1"
    : "https://us-central1-timeline-38aac.cloudfunctions.net";

export const invoke = async (urlSuffix: string, data: object) => {
  try {
    const response = await fetch(`${apiUrl}/${urlSuffix}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    return await response.json();
  } catch (error) {
    console.error("Error rewriting text:", error);
  }
};
