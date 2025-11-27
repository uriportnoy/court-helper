export function getFileNameAndExtension(fileName: string) {
  const regex = /^(.*)\.([^.]+)$/;
  const match = fileName.match(regex);
  if (match) {
    return {
      name: match[1].replaceAll(" ", "_"),
      ext: match[2],
    };
  }
  return null;
}

export const getViewerUrl = (url: string) => {
  // Use Google Docs Viewer for both PDF and DOCX for better compatibility
  return `https://docs.google.com/viewer?url=${encodeURIComponent(
    url
  )}&embedded=true`;
};

export function identifyFileExtension(url: string) {
  const fileExtension = url?.split(".").pop()?.split("?")[0]?.toLowerCase();

  const isPDF =
    fileExtension === "pdf" ||
    url?.includes(".pdf") ||
    url?.includes("pdfs%2F");

  const isDOCX =
    fileExtension === "docx" ||
    fileExtension === "doc" ||
    url?.includes(".docx") ||
    url?.includes(".doc") ||
    url?.includes("docx%2F") || // <– add this
    url?.includes("/docx/");

  return {
    isPDF,
    isDOCX,
  };
}
