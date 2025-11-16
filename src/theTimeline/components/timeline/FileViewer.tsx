import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  X,
  Download,
  Maximize2,
  Minimize2,
  ExternalLink,
  RotateCw,
  Share,
} from "lucide-react";
import { summarizeDocument } from "@/timeline/firebase/functions";
import ShareMenu from "@/timeline/components/PDFViewer/ShareMenu";
import { AnimatePresence } from "framer-motion";

interface FileViewerProps {
  file: {
    url: string;
    label: string;
    type?: string;
  };
  open: boolean;
  onClose: () => void;
}

export default function FileViewer({ file, open, onClose }: FileViewerProps) {
  const [loading, setLoading] = useState(true);
  const [fullscreen, setFullscreen] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [summary, setSummary] = useState<string>("");
  const [summarizing, setSummarizing] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);

  const fileExtension = file.url
    ?.split(".")
    .pop()
    ?.split("?")[0]
    ?.toLowerCase();
  const isPDF =
    fileExtension === "pdf" ||
    file.url?.includes(".pdf") ||
    file.url?.includes("pdfs%2F");
  const isDOCX =
    fileExtension === "docx" ||
    fileExtension === "doc" ||
    file.url?.includes(".docx") ||
    file.url?.includes(".doc");

  useEffect(() => {
    if (open) {
      setLoading(true);
      setLoadError(false);

      // Auto-hide loading after 3 seconds as fallback
      const timeout = setTimeout(() => {
        setLoading(false);
      }, 3000);

      return () => clearTimeout(timeout);
    }
  }, [open, file.url]);

  const getViewerUrl = () => {
    // Use Google Docs Viewer for both PDF and DOCX for better compatibility
    return `https://docs.google.com/viewer?url=${encodeURIComponent(
      file.url
    )}&embedded=true`;
  };

  const openInNewTab = () => {
    window.open(file.url, "_blank");
  };

  const downloadFile = async () => {
    try {
      const ext =
        (isPDF && "pdf") ||
        (isDOCX && (fileExtension || "docx")) ||
        fileExtension ||
        "bin";
      const filename = `${file.label || "document"}.${ext}`;
      const response = await fetch(file.url, { mode: "cors" });
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(blobUrl);
    } catch {
      // Fallback: try native download attribute without fetching
      const a = document.createElement("a");
      const ext =
        (isPDF && "pdf") ||
        (isDOCX && (fileExtension || "docx")) ||
        fileExtension ||
        "bin";
      a.href = file.url;
      a.download = `${file.label || "document"}.${ext}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    }
  };

  const reloadFile = () => {
    setLoading(true);
    setLoadError(false);
    // Force iframe reload by changing its key/src
    const iframe = document.querySelector("iframe");
    if (iframe) {
      iframe.src = iframe.src;
    }
  };

  const onSummarize = async () => {
    try {
      setSummarizing(true);
      // setSummary("");
      const s = await summarizeDocument(file.url);
      setSummary(s);
    } catch (e: any) {
      setSummary(`שגיאה בסיכום: ${e?.message || e}`);
    } finally {
      setSummarizing(false);
    }
  };

  const handleIframeLoad = (event: React.SyntheticEvent<HTMLIFrameElement>) => {
    const iframe = event.currentTarget;

    // Try to detect if content loaded successfully
    try {
      // Check if iframe content is accessible (basic check)
      const iframeDoc =
        iframe.contentDocument || iframe.contentWindow?.document;
      if (iframeDoc && iframeDoc.readyState === "complete") {
        setLoading(false);
        return;
      }
    } catch (error) {
      // Cross-origin restrictions, fallback to timeout
    }

    // Give Google Docs Viewer a moment to load the actual content
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  const handleIframeError = () => {
    setLoading(false);
    setLoadError(true);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        className={`${
          fullscreen
            ? "max-w-[100vw] h-[100vh] w-[100vw]"
            : "max-w-6xl max-h-[90vh]"
        } p-0`}
        dir="rtl"
      >
        <DialogHeader className="p-4 border-b bg-white sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg font-semibold">
              {file.label}
            </DialogTitle>
            <div className="flex items-center gap-2">
              {(isPDF || isDOCX) && (
                <Button
                  variant="secondary"
                  onClick={onSummarize}
                  disabled={summarizing}
                  title="סכם מסמך"
                >
                  {summarizing ? "מסכם..." : "סכם מסמך"}
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowShareMenu(true)}
                title="שתף"
              >
                <Share className="w-5 h-5" />
              </Button>
              <AnimatePresence>
                {showShareMenu && (
                  <ShareMenu
                    url={file.url}
                    onClose={() => setShowShareMenu(false)}
                  />
                )}
              </AnimatePresence>
              <Button
                variant="ghost"
                size="icon"
                onClick={reloadFile}
                title="טען מחדש"
              >
                <RotateCw className="w-5 h-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={openInNewTab}
                title="פתח בחלון חדש"
              >
                <ExternalLink className="w-5 h-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={downloadFile}
                title="הורד"
              >
                <Download className="w-5 h-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setFullscreen(!fullscreen)}
                title={fullscreen ? "צמצם" : "הרחב"}
              >
                {fullscreen ? (
                  <Minimize2 className="w-5 h-5" />
                ) : (
                  <Maximize2 className="w-5 h-5" />
                )}
              </Button>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div
          className={`relative ${
            fullscreen ? "h-[calc(100vh-73px)]" : "h-[calc(90vh-73px)]"
          } bg-slate-100`}
        >
          {loading && !loadError && (
            <div className="absolute inset-0 flex items-center justify-center bg-white z-10">
              <div className="text-center space-y-4">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="text-slate-600">טוען מסמך...</p>
              </div>
            </div>
          )}

          {loadError ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center space-y-4 p-8">
                <p className="text-slate-600 text-lg">
                  לא ניתן להציג את המסמך בחלון זה
                </p>
                <p className="text-slate-500 text-sm">
                  פתח את המסמך בחלון חדש או הורד אותו
                </p>
                <div className="flex gap-3 justify-center">
                  <Button
                    onClick={openInNewTab}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <ExternalLink className="w-4 h-4 ml-2" />
                    פתח בחלון חדש
                  </Button>
                  <Button onClick={downloadFile} variant="outline">
                    <Download className="w-4 h-4 ml-2" />
                    הורד קובץ
                  </Button>
                </div>
              </div>
            </div>
          ) : isPDF || isDOCX ? (
            <div className="w-full h-full flex">
              <div className="flex-1 h-full">
                <iframe
                  src={getViewerUrl()}
                  className="w-full h-full border-0"
                  onLoad={handleIframeLoad}
                  onError={handleIframeError}
                  title={file.label}
                />
              </div>
              {summary && (
                <div className="w-[420px] h-full overflow-auto border-l bg-white p-4 hidden md:block">
                  <h3 className="font-semibold mb-2">סיכום</h3>
                  <div
                    className="text-sm whitespace-pre-wrap leading-6"
                    dir="rtl"
                  >
                    {summary}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center space-y-4 p-8">
                <p className="text-slate-600 text-lg">
                  לא ניתן להציג את סוג הקובץ הזה
                </p>
                <div className="flex gap-3 justify-center">
                  <Button onClick={openInNewTab} variant="outline">
                    <ExternalLink className="w-4 h-4 ml-2" />
                    פתח בחלון חדש
                  </Button>
                  <Button onClick={downloadFile}>
                    <Download className="w-4 h-4 ml-2" />
                    הורד קובץ
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
