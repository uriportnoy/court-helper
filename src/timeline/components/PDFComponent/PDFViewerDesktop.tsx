import React, { useState, useEffect } from "react";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { Download, Share, X, Loader2 } from "lucide-react";
import ShareMenu from "./ShareMenu";
import styles from "./pdf.module.scss";
import { downloadPDF } from "./utils";
import { ItemMenuProps } from "../ItemMenu";

interface PDFViewerDesktopProps {
  isOpen: boolean;
  onClose: () => void;
  url: string;
  title: string;
  item: ItemMenuProps;
}
export default function PDFViewerDesktop({
  isOpen,
  onClose,
  url,
  title,
  item
}: PDFViewerDesktopProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
    }
  }, [isOpen]);

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      await downloadPDF(url, title, item)
    } catch (error) {
      console.error("Download failed:", error);
      // Fallback for CORS issues or other errors where direct fetch fails
      window.open(url, "_blank");
    } finally {
      setIsDownloading(false);
    }
  };

  const viewerUrl = `https://docs.google.com/gview?url=${encodeURIComponent(url)}&embedded=true`;

  return (
    <Dialog
      visible={isOpen}
      onHide={onClose}
      className={styles.modal}
      header={
        <div className="flex items-center justify-between bg-white flex-shrink-0">
          <h2 className="text-xl font-semibold text-gray-900 truncate flex-1 mr-4">
            {title}
          </h2>
          <div className="flex items-center gap-2">
            <Button
              onClick={handleDownload}
              disabled={isDownloading}
              className="hover:bg-gray-100 flex items-center gap-2"
              title="Download"
            >
              {isDownloading ? (
                <Loader2 className="w-8 h-8 animate-spin" />
              ) : (
                <Download className="w-8 h-8" />
              )}
              <span className="hidden sm:inline">
                {isDownloading ? "Downloading..." : "Download"}
              </span>
            </Button>

            <Button
              onClick={() => setShowShareMenu(true)}
              className="hover:bg-gray-100 flex items-center gap-2"
              title="Share"
            >
              <Share className="w-8 h-8" />
              <span className="hidden sm:inline">Share</span>
            </Button>
            <div className="w-px h-6 bg-gray-200 mx-1" />
          </div>
        </div>
      }
    >
      <div className="max-w-7xl h-[95vh] p-0 flex flex-col overflow-hidden bg-white border-0 shadow-2xl">
        {/* PDF Container */}
        <div className="flex-1 bg-gray-200 relative">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-200 z-10">
              <Loader2 className="w-8 h-8 text-gray-500 animate-spin" />
              <span className="ml-4 text-gray-600">Loading document...</span>
            </div>
          )}
          <iframe
            src={viewerUrl}
            className={`w-full h-full border-none transition-opacity duration-300 ${isLoading ? "opacity-0" : "opacity-100"}`}
            onLoad={() => setIsLoading(false)}
            title={title}
            allow="fullscreen"
            onError={() => {
              console.warn("Google Docs Viewer failed, switching to native viewer");
              // setUseNativeViewer(true);
            }}
          />
        </div>

        {/* Share Menu */}
        <ShareMenu
          isOpen={showShareMenu}
          onClose={() => setShowShareMenu(false)}
          url={url}
          title={title}
        />
      </div>
    </Dialog>
  );
}
