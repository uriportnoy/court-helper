import { FileURL } from "@/theTimeline/common";
import { shareViaWhatsApp } from "@/timeline/components/PDFViewer/utils/share";

interface ShareProps {
    file: FileURL;
}
export default function useFileShare({ file }: ShareProps) {

  const directDownload = async () => {
    try {
      const fileExtension =
        file.url?.split(".").pop()?.split("?")[0]?.toLowerCase() || "pdf";
      const filename = `${file.label || "document"}.${fileExtension}`;
      const res = await fetch(file.url, { mode: "cors" });
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
      a.download = file.label || "document";
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