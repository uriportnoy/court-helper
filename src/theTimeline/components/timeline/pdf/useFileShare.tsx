import { shareViaWhatsApp } from "@/theTimeline/components/timeline/pdf/share";
import { FileURL } from "@/theTimeline/types";

interface ShareProps {
    file: FileURL;
    fileName?: string;
}
export default function useFileShare({ file, fileName }: ShareProps) {

  const directDownload = async () => {
    try {
      const urlExtRaw = file.url?.split("?")[0]?.split(".").pop() || "";
      const urlExt = urlExtRaw.toLowerCase();
      const res = await fetch(file.url, { mode: "cors" });
      const contentType = res.headers.get("content-type") || "";
      // Prefer MIME-derived extension when available
      const mimeExt =
        contentType.includes(
          "vnd.openxmlformats-officedocument.wordprocessingml.document"
        ) || file.url.includes("/docx/")
          ? "docx"
          : contentType.includes("pdf") || file.url.includes("/pdfs/")
          ? "pdf"
          : contentType.includes("png")
          ? "png"
          : contentType.includes("jpeg")
          ? "jpg"
          : contentType.includes("webp")
          ? "webp"
          : urlExt || "pdf";
      const baseName = fileName || file.label || "document";
      const filename = baseName.toLowerCase().endsWith(`.${mimeExt}`)
        ? baseName
        : `${baseName}.${mimeExt}`;
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(blobUrl);
    } catch {
      // Fallback
      const a = document.createElement("a");
      a.href = file.url;
      const urlExtRaw = file.url?.split("?")[0]?.split(".").pop() || "";
      const extGuess = (urlExtRaw || "pdf").toLowerCase();
      const baseName = file.label || "document";
      a.download = baseName.toLowerCase().endsWith(`.${extGuess}`)
        ? baseName
        : `${baseName}.${extGuess}`;
      a.target = "_blank";
      document.body.appendChild(a);
      a.click();
      a.remove();
    }
  };

  const viaWhatsApp = async () => {
    shareViaWhatsApp(file.url);
  };

   return {
    directDownload,
    viaWhatsApp,
   }
}