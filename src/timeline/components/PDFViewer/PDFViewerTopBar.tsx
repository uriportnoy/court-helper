import { useCallback, useState } from "react";
import { downloadPDF, shareFile } from "./utils/share";
import { AnimatePresence } from "framer-motion";
import ShareMenu from "./ShareMenu";
import styled from "styled-components";
import PageRangeExtractor from "../PDFComponent/PageRangeExtractor";
import { ItemMenuProps } from "../ItemMenu.tsx";
import { FileText, } from "lucide-react";

interface PDFViewerTopBarProps {
  url: string;
  scale: number;
  rotation: number;
  panPosition: { x: number; y: number };
  pageNum: number;
  numPages: number;
  isLoading: boolean;
  handleZoom: (delta: number) => void;
  handleRotate: () => void;
  handleResetView: () => void;
  initialScale: number;
  item: ItemMenuProps;
  showNativePDFViewer: boolean;
  setShowNativePDFViewer: (show: boolean) => void;
}
function PDFViewerTopBar({
  url,
  scale,
  rotation,
  panPosition,
  pageNum,
  numPages,
  isLoading,
  handleZoom,
  handleRotate,
  handleResetView,
  initialScale,
  item,
  showNativePDFViewer,
  setShowNativePDFViewer,
}: PDFViewerTopBarProps) {
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [downloadStatus, setDownloadStatus] = useState(null);
  const [shareStatus, setShareStatus] = useState(null);

  const handleDownload = useCallback(async () => {
    setDownloadStatus("downloading");
    const success = await downloadPDF(url);
    setDownloadStatus(success ? "success" : "error");

    // Reset status after a delay
    setTimeout(() => {
      setDownloadStatus(null);
    }, 2000);
  }, [url]);

  const handleShare = useCallback(async () => {
    setShareStatus("sharing");
    const success = await shareFile(url);
    setShareStatus(success ? "success" : "error");

    // Reset status after a delay
    setTimeout(() => {
      setShareStatus(null);
    }, 2000);
  }, [url]);

  const toggleShareMenu = useCallback(() => {
    setShowShareMenu((prev) => !prev);
  }, []);

  return (
    <ToolBar>{!showNativePDFViewer &&
      <ToolGroup>
        <ToolButton
          onClick={() => handleZoom(-0.1)}
          disabled={scale <= 0.2 || isLoading}
          title="Zoom Out"
        >
          <i className="pi pi-minus" />
        </ToolButton>
        <ScaleDisplay>{Math.round(scale * 100)}%</ScaleDisplay>
        <ToolButton
          onClick={() => handleZoom(0.1)}
          disabled={scale >= 5 || isLoading}
          title="Zoom In"
        >
          <i className="pi pi-plus" />
        </ToolButton>
      </ToolGroup>}

      <ToolGroup>
        {!showNativePDFViewer && <> <ToolButton onClick={handleRotate} disabled={isLoading} title="Rotate">
          <i className="pi pi-refresh" />
        </ToolButton>

          <ToolButton
            onClick={handleResetView}
            disabled={
              isLoading ||
              (scale === initialScale &&
                rotation === 0 &&
                panPosition.x === 0 &&
                panPosition.y === 0)
            }
            title="Reset View"
          >
            <i className="pi pi-undo" />
          </ToolButton>
        </>}

        <ToolButton
          onClick={handleDownload}
          disabled={isLoading || downloadStatus === "downloading"}
          title="Download PDF"
          className={downloadStatus ? `status-${downloadStatus}` : ""}
        >
          <i
            className={`pi ${downloadStatus === "downloading"
              ? "pi-spin pi-spinner"
              : downloadStatus === "success"
                ? "pi-check"
                : downloadStatus === "error"
                  ? "pi-times"
                  : "pi-download"
              }`}
          />
        </ToolButton>

        <ToolButton
          onClick={handleShare}
          disabled={isLoading || shareStatus === "sharing"}
          title="Share PDF File"
          className={shareStatus ? `status-${shareStatus}` : ""}
        >
          <i
            className={`pi ${shareStatus === "sharing"
              ? "pi-spin pi-spinner"
              : shareStatus === "success"
                ? "pi-check"
                : shareStatus === "error"
                  ? "pi-times"
                  : "pi-share-alt"
              }`}
          />
        </ToolButton>
        <ToolButton
          onClick={() => setShowNativePDFViewer(!showNativePDFViewer)}
          title="Show Native PDF Viewer"
          disabled={isLoading}
        >
          {showNativePDFViewer ? <FileText className="w-4 h-4" /> : <FileText className="w-4 h-4 active" />}
        </ToolButton>
        <PageRangeExtractor
          url={url}
          title={item.title}
          item={item}
          totalPages={numPages} // You can get this from the iframe if needed
        />

        <ToolButton
          onClick={toggleShareMenu}
          disabled={isLoading}
          title="More Sharing Options"
          className={showShareMenu ? "active" : ""}
        >
          <i className="pi pi-ellipsis-h" />
        </ToolButton>

        <AnimatePresence>
          {showShareMenu && (
            <ShareMenu url={url} onClose={() => setShowShareMenu(false)} />
          )}
        </AnimatePresence>
      </ToolGroup>
      {!showNativePDFViewer &&
        <PageInfo>
          Page {pageNum} of {numPages || "?"}
        </PageInfo>
      }
    </ToolBar>
  );
}

const ToolBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem;
  background: var(--surface-0);
  border-bottom: 1px solid var(--surface-200);
  gap: 0.75rem;
  position: relative;

  @media (max-width: 768px) {
    flex-wrap: wrap;
    justify-content: center;
  }
`;

const ToolGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: var(--surface-50);
  padding: 0.25rem;
  border-radius: var(--border-radius-md);
  position: relative;
`;

const ToolButton = styled.button`
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--surface-0);
  color: var(--surface-700);
  border: 1px solid var(--surface-200);
  border-radius: var(--border-radius-md);
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background: var(--surface-100);
    color: var(--primary-600);
    transform: translateY(-1px);
    box-shadow: var(--shadow-sm);
  }

  &:active:not(:disabled) {
    transform: translateY(1px);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &.active {
    background: var(--primary-50);
    color: var(--primary-600);
    border-color: var(--primary-200);
  }

  &.status-downloading,
  &.status-sharing {
    background: var(--blue-50);
    color: var(--blue-600);
    border-color: var(--blue-200);
  }

  &.status-success {
    background: var(--green-50);
    color: var(--green-600);
    border-color: var(--green-200);
  }

  &.status-error {
    background: var(--red-50);
    color: var(--red-600);
    border-color: var(--red-200);
  }

  i {
    font-size: 1rem;
  }
`;

const ScaleDisplay = styled.span`
  min-width: 60px;
  text-align: center;
  font-variant-numeric: tabular-nums;
  font-weight: 500;
  color: var(--surface-700);
  background: var(--surface-0);
  padding: 0.25rem 0.5rem;
  border-radius: var(--border-radius-sm);
  border: 1px solid var(--surface-200);
`;

const PageInfo = styled.div`
  color: var(--surface-600);
  font-size: 0.875rem;
  font-weight: 500;
  background: var(--surface-50);
  padding: 0.5rem 0.75rem;
  border-radius: var(--border-radius-md);
  border: 1px solid var(--surface-200);
`;

export default PDFViewerTopBar;
