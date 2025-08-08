import React, { useState, useEffect } from "react";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { X, Download, Share, Loader2 } from "lucide-react";
import ShareMenu from "./ShareMenu";
import { downloadPDF } from "./utils.ts";
import styled from "styled-components";
import { ItemMenuProps } from "../ItemMenu.tsx";

interface PDFViewerMobileProps {
  isOpen: boolean;
  onClose: () => void;
  url: string;
  title: string;
  item: ItemMenuProps;
}
export default function PDFViewerMobile({
  isOpen,
  onClose,
  url,
  title,
  item
}: PDFViewerMobileProps) {
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
    }
  }, [isOpen]);

  const handleDownload = async () => {
    setIsDownloading(true);
    downloadPDF(url, title, item).finally(() => {
      setIsDownloading(false);
    });
  };

  const viewerUrl = `https://docs.google.com/gview?url=${encodeURIComponent(url)}&embedded=true`;

  return (
    <Dialog
      visible={isOpen}
      onHide={onClose}
      header={
        <Header>
          <Button
            onClick={handleDownload}
            disabled={isDownloading}
            className="hover:bg-gray-100"
          >
            {isDownloading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
          </Button>
          <Button
            onClick={() => setShowShareMenu(true)}
            className="hover:bg-gray-100"
          >
            <Share className="w-4 h-4" />
          </Button>
          <h3>{title}</h3>
        </Header>
      }
    >
      <div className="w-full h-full max-w-none max-h-none p-0 m-0 bg-white border-0">
        <PDFContent>
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
              <Loader2 className="w-8 h-8 text-gray-500 animate-spin" />
            </div>
          )}
          <div className="w-full h-full overflow-hidden touch-none">
            <div
              className="w-full h-full overflow-auto"
              style={{ WebkitOverflowScrolling: "touch" }}
            >
              <iframe
                src={viewerUrl}
                className={`w-full h-full border-none transition-opacity duration-300 ${isLoading ? "opacity-0" : "opacity-100"}`}
                onLoad={() => setIsLoading(false)}
                title={title}
                allow="fullscreen"
              />
            </div>
          </div>
        </PDFContent>

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

const Header = styled.div`
  padding: 0;
  display: flex;
  width: 100%;
  align-items: center;
  gap: 8px;
  h3 {
    flex: 1;
    text-align: center;
  }
`;

const PDFContent = styled.div`
  height: 100vh;
  width: 100vw;
  iframe {
    width: 100%;
    height: 100%;
    border: none;
  }
  .touch-pinch-zoom {
    touch-action: pinch-zoom;
    overscroll-behavior: contain;
  }
  .touch-none {
    touch-action: none;
  }
`;
