import { useCallback, useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { Paginator } from "primereact/paginator";
import * as pdfjsLib from "pdfjs-dist";
import "pdfjs-dist/build/pdf.worker.min";
import { auth } from "../../firebase";
import ErrorDisplay from "./ErrorDisplay";
import usePinchZoom from "./utils/usePinchZoom";
import PDFViewerTopBar from "./PDFViewerTopBar.tsx";
import { ItemMenuProps } from "../ItemMenu.tsx";
import { getInitialScale } from "./utils";
import AppLoader from "common/AppLoader.tsx";

interface PDFViewerProps {
  url: string;
  item: ItemMenuProps;
  type: string;
  label: string;
}

const PDFViewer = ({ url, item, type, label }: PDFViewerProps) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [pageNum, setPageNum] = useState(1);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const renderingRef = useRef(false);
  const [pdfDimensions, setPdfDimensions] = useState({ width: 0, height: 0 });
  const initialScaleRef = useRef(getInitialScale());
  const initialScale = initialScaleRef.current;
  // Use the pinch zoom hook
  const pinchProps = usePinchZoom({
    initialScale,
    minScale: 0.2,
    maxScale: 5,
    containerRef,
    canvasRef,
  });
  const {
    scale,
    setScale,
    rotation,
    setRotation,
    panPosition,
    setPanPosition,
    isPinchZooming,
    isZoomedIn,
  } = pinchProps;

  const [showNativePDFViewer, setShowNativePDFViewer] = useState(true);
  const [nativeLoading, setNativeLoading] = useState(false);
  const [nativeError, setNativeError] = useState<string | null>(null);
  const [iframeKey, setIframeKey] = useState(0);
  const retryRef = useRef(0);

  const renderPage = useCallback(
    async (num) => {
      if (!pdfDoc || renderingRef.current) return;

      try {
        renderingRef.current = true;
        setIsLoading(true);

        const page = await pdfDoc.getPage(num);
        const viewport = page.getViewport({ scale: 1, rotation });
        const canvas = canvasRef.current;

        if (!canvas) return;

        const ctx = canvas.getContext("2d");

        // Store original PDF dimensions
        setPdfDimensions({
          width: viewport.width,
          height: viewport.height,
        });

        // Use the user's scale directly for zoom
        const finalScale = scale;

        const scaledViewport = page.getViewport({
          scale: finalScale,
          rotation,
        });

        canvas.width = scaledViewport.width;
        canvas.height = scaledViewport.height;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        await page.render({
          canvasContext: ctx,
          viewport: scaledViewport,
        }).promise;

        setPageNum(num);
      } catch (error) {
        console.error("Error rendering page:", error);
        setError("Failed to render page. Please try again.");
      } finally {
        renderingRef.current = false;
        setIsLoading(false);
      }
    },
    [pdfDoc, scale, rotation, isZoomedIn, setScale]
  );

  const loadPDF = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const options = { url };
      if (url.includes("firebasestorage.googleapis")) {
        const user = auth.currentUser;
        if (!user) {
          console.error("User not authenticated");
          return;
        }
        const token = await user.getIdToken();
        options.httpHeaders = { Authorization: `Bearer ${token}` };
      }
      const pdf = await pdfjsLib.getDocument(options).promise;

      setPdfDoc(pdf);
      setNumPages(pdf.numPages);
      setPageNum(1);
      setRotation(0);
      setScale(initialScale);
      setPanPosition({ x: 0, y: 0 });

      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    } catch (error) {
      console.error("Error loading PDF:", error);
      setError("Failed to load PDF. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [url, setRotation, setScale, setPanPosition]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (pdfDoc && !isZoomedIn) {
        // Only auto-adjust scale when not manually zoomed
        setScale(initialScale);
        renderPage(pageNum);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [pdfDoc, pageNum, renderPage, isZoomedIn, setScale]);

  useEffect(() => {
    pdfjsLib.GlobalWorkerOptions.workerSrc =
      "https://mozilla.github.io/pdf.js/build/pdf.worker.mjs";

    let mounted = true;

    const initPDF = async () => {
      if (!mounted) return;
      if (showNativePDFViewer) {
        // Kick off native loading state and a retry watchdog
        setNativeLoading(true);
        setNativeError(null);
        retryRef.current = 0;
        // If iframe didn't call onLoad within 4s, force a reload once
        const timer = setTimeout(() => {
          if (retryRef.current < 1) {
            retryRef.current += 1;
            setIframeKey((k) => k + 1);
          }
        }, 4000);
        return () => clearTimeout(timer);
      }
      await loadPDF();
    };

    initPDF();

    return () => {
      mounted = false;
    };
  }, [loadPDF, showNativePDFViewer]);

  useEffect(() => {
    if (pdfDoc && pageNum) {
      renderPage(pageNum);
    }
  }, [scale, rotation, renderPage, pageNum, pdfDoc]);

  const handleRetry = useCallback(async () => {
    await loadPDF();
  }, [loadPDF]);

  if (error) {
    return <ErrorDisplay message={error} onRetry={handleRetry} />;
  }

  const isCustomViewer = !showNativePDFViewer;

  return (
    <ViewerContainer>
      <PDFViewerTopBar
        {...pinchProps}
        url={url}
        initialScale={initialScale}
        pageNum={pageNum}
        numPages={numPages}
        item={item}
        showNativePDFViewer={showNativePDFViewer}
        setShowNativePDFViewer={setShowNativePDFViewer}
        label={label}
      />
      {showNativePDFViewer && (
        <IFrameWrapper className="max-w-7xl h-[95vh] p-0 flex flex-col overflow-hidden bg-white border-0 shadow-2xl">
          {nativeLoading && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/80">
              <AppLoader text="Loading PDF..." size={80} />
            </div>
          )}
          {nativeError ? (
            <ErrorDisplay
              message={nativeError}
              onRetry={() => {
                setNativeError(null);
                setNativeLoading(true);
                retryRef.current = 0;
                setIframeKey((k) => k + 1);
              }}
            />
          ) : (
            <iframe
              key={iframeKey}
              // src={url}
              // src={
              //   /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
              //     ? `https://docs.google.com/gview?embedded=1&url=${encodeURIComponent(
              //         url
              //       )}&t=${Date.now()}`
              //     : url
              // }
              src={
                /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
                  ? `https://docs.google.com/gview?embedded=1&url=${encodeURIComponent(
                      url
                    )}`
                  : url
              }
              className="w-full h-full border-none"
              onLoad={() => {
                setNativeLoading(false);
              }}
              onError={() => {
                setNativeLoading(false);
                setNativeError("Failed to load PDF. Try again.");
              }}
              allow="fullscreen"
            />
          )}
        </IFrameWrapper>
      )}
      {isCustomViewer && (
        <ViewerContent
          ref={containerRef}
          className={isPinchZooming ? "pinch-zooming" : ""}
          $allowOverflow={isZoomedIn}
          data-auto={"viewer-content"}
        >
          {isLoading && <AppLoader text="Loading PDF..." overlay size={100} />}
          <CanvasWrapper data-auto="canvas-wrapper">
            <canvas
              ref={canvasRef}
              style={{
                cursor: isZoomedIn ? "grab" : "default",
                display: "block",
              }}
            />
          </CanvasWrapper>
        </ViewerContent>
      )}
      {isCustomViewer && numPages > 1 && (
        <ControlBar>
          <Paginator
            first={pageNum - 1}
            rows={1}
            totalRecords={numPages}
            onPageChange={(e) => renderPage(e.page + 1)}
            template="PrevPageLink CurrentPageReport NextPageLink"
            disabled={isLoading}
          />
        </ControlBar>
      )}
    </ViewerContainer>
  );
};

const ViewerContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--surface-50);
  border-radius: var(--border-radius-lg);
  overflow: hidden;
  position: relative;
  min-height: 400px;
  box-shadow: var(--shadow-lg);
`;

const ViewerContent = styled.div`
  flex: 1;
  overflow: auto;
  padding: 2rem 0;
  background: var(--surface-100);
  -webkit-overflow-scrolling: touch;
  position: relative;
  touch-action: ${(props) => (props.$allowOverflow ? "none" : "auto")};

  &.pinch-zooming {
    overflow: hidden;
  }
`;

const CanvasWrapper = styled.div`
  margin: 0 auto;
  width: fit-content;
`;

const ControlBar = styled.div`
  padding: 0.5rem 0.75rem;
  background: var(--surface-0);
  border-top: 1px solid var(--surface-200);

  .p-paginator {
    justify-content: center;

    .p-paginator-element {
      min-width: 36px;
      height: 36px;
      margin: 0 0.25rem;

      &:not(.p-disabled):hover {
        background: var(--surface-100);
        color: var(--primary-600);
        transform: translateY(-1px);
      }

      &:not(.p-disabled):active {
        transform: translateY(1px);
      }
    }
  }
`;

const IFrameWrapper = styled.div`
  width: 100%;
  height: 100%;
  border: none;
  margin: 0 auto;
  position: relative;
`;

export default PDFViewer;
