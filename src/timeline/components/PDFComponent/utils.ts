import { ItemMenuProps } from "../ItemMenu";

export const downloadPDF = async (url: string, fileTitle: string, item: ItemMenuProps) => {
  const downloadName = ((item.title || item.type || 'document') + '_' + fileTitle).replaceAll(' ', '_');  
  const isDocxFile = url.includes('/docx')
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const blob = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = `${downloadName}.${isDocxFile ? 'docx' : 'pdf'}`; // Fallback name if title is undefined
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(blobUrl);
  } catch (error) {
    console.error("Download failed:", error);
    // Fallback to opening in a new tab if direct download fails
    window.open(url, "_blank");
  }
};

