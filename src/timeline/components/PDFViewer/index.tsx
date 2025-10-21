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
import { useMemo } from "react";

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
  const isDocxFile = url.includes("docx");  
  const [showNativePDFViewer, setShowNativePDFViewer] = useState(
    true
  );
  const [nativePdfLoading, setNativePdfLoading] = useState(false);
  const [nativePdfError, setNativePdfError] = useState<string | null>(null);
  const [nativeZoomPercent, setNativeZoomPercent] = useState(100);
  const nativeIframeRef = useRef<HTMLIFrameElement>(null);
  const nativeZoomContainerRef = useRef<HTMLDivElement>(null);

  const isMobile = useMemo(
    () => /Android|iPhone|iPad|iPod|Mobi/i.test(navigator.userAgent),
    []
  );

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
      if (!mounted || showNativePDFViewer) return;
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

  const handleNativePdfLoad = useCallback(() => {
    setNativePdfLoading(false);
    setNativePdfError(null);
  }, []);

  const handleNativePdfError = useCallback(() => {
    setNativePdfLoading(false);
    setNativePdfError("Failed to load PDF in native viewer. Please try again or switch to custom viewer.");
  }, []);

  const handleNativePdfRetry = useCallback(() => {
    setNativePdfLoading(true);
    setNativePdfError(null);
    // Force iframe reload by changing src
    const iframe = document.querySelector('iframe[allow="fullscreen"]') as HTMLIFrameElement;
    if (iframe) {
      const currentSrc = iframe.src;
      iframe.src = '';
      setTimeout(() => {
        iframe.src = currentSrc;
      }, 100);
    }
  }, []);

  // Reset native PDF states when switching viewers
  useEffect(() => {
    if (showNativePDFViewer) {
      setNativePdfLoading(true);
      setNativePdfError(null);
      setNativeZoomPercent(100);
    }
  }, [showNativePDFViewer]);

  // Helper to update the iframe URL hash with a zoom parameter (e.g. #zoom=125)
  const updateIframeZoom = useCallback((percent: number) => {
    const iframe = nativeIframeRef.current;
    if (!iframe) return;
    try {
      const currentSrc = iframe.src;
      // Some browsers treat fragment updates as navigation to same resource without full reload
      const url = new URL(currentSrc);
      const rawHash = (url.hash || '').replace(/^#/, '');
      const parts = rawHash ? rawHash.split('&') : [];
      const map = new Map<string, string>();
      parts.forEach(p => {
        const [k, v] = p.split('=');
        if (k) map.set(k, v ?? '');
      });
      map.set('zoom', String(Math.round(percent)));
      const newHash = Array.from(map.entries()).map(([k, v]) => v ? `${k}=${v}` : k).join('&');
      const newSrc = `${url.origin}${url.pathname}${url.search}${newHash ? '#' + newHash : ''}`;
      if (newSrc !== currentSrc) {
        iframe.src = newSrc;
      }
    } catch {
      // Fallback: append/replace hash manually if URL constructor fails
      const idx = iframe.src.indexOf('#');
      const base = idx >= 0 ? iframe.src.slice(0, idx) : iframe.src;
      iframe.src = `${base}#zoom=${Math.round(percent)}`;
    }
  }, []);

  // Handle zoom events for native PDF viewer
  useEffect(() => {
    if (!showNativePDFViewer || !nativeZoomContainerRef.current || isMobile)
      return;

    const zoomContainer = nativeZoomContainerRef.current;
    let isContainerFocused = false;

    // Track when user is focused on the PDF container
    const handleContainerFocus = () => {
      isContainerFocused = true;
    };

    const handleContainerBlur = () => {
      isContainerFocused = false;
    };

    const handleContainerMouseEnter = () => {
      isContainerFocused = true;
    };

    const handleContainerMouseLeave = () => {
      isContainerFocused = false;
    };

    // Handle keyboard zoom (Ctrl +/-) - only when container is focused
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!(isContainerFocused && (e.ctrlKey || e.metaKey))) return;

      const isPlus = e.key === '+' || e.key === '=' || e.code === 'Equal' || e.code === 'NumpadAdd';
      const isMinus = e.key === '-' || e.code === 'Minus' || e.code === 'NumpadSubtract';
      const isZero = e.key === '0' || e.code === 'Digit0' || e.code === 'Numpad0';

      if (isPlus || isMinus || isZero) {
        // Aggressively stop browser zoom
        e.preventDefault();
        e.stopPropagation();
        // @ts-ignore
        if (e.stopImmediatePropagation) e.stopImmediatePropagation();
        // @ts-ignore
        (e as any).returnValue = false;
      }

      if (isPlus) {
        setNativeZoomPercent(prev => {
          const next = Math.min(prev + 10, 300);
          updateIframeZoom(next);
          return next;
        });
      } else if (isMinus) {
        setNativeZoomPercent(prev => {
          const next = Math.max(prev - 10, 50);
          updateIframeZoom(next);
          return next;
        });
      } else if (isZero) {
        setNativeZoomPercent(() => {
          const next = 100;
          updateIframeZoom(next);
          return next;
        });
      }
    };

    // Handle wheel zoom (Ctrl + scroll)
    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -10 : 10;
        setNativeZoomPercent(prev => {
          const next = Math.max(50, Math.min(300, prev + delta));
          updateIframeZoom(next);
          return next;
        });
      }
    };

    // Handle touch zoom (pinch)
    let lastTouchDistance = 0;
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        lastTouchDistance = Math.hypot(
          touch2.clientX - touch1.clientX,
          touch2.clientY - touch1.clientY
        );
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        e.preventDefault();
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        const currentDistance = Math.hypot(
          touch2.clientX - touch1.clientX,
          touch2.clientY - touch1.clientY
        );
        
        if (lastTouchDistance > 0) {
          const scale = currentDistance / lastTouchDistance;
          setNativeZoomPercent(prev => {
            const next = Math.max(50, Math.min(300, Math.round(prev * scale)));
            updateIframeZoom(next);
            return next;
          });
        }
        lastTouchDistance = currentDistance;
      }
    };

    // Add event listeners
    document.addEventListener('keydown', handleKeyDown, { capture: true });
    window.addEventListener('keydown', handleKeyDown, { capture: true });
    zoomContainer.addEventListener('wheel', handleWheel, { passive: false });
    zoomContainer.addEventListener('touchstart', handleTouchStart, { passive: false });
    zoomContainer.addEventListener('touchmove', handleTouchMove, { passive: false });
    
    // Focus tracking events
    zoomContainer.addEventListener('mouseenter', handleContainerMouseEnter);
    zoomContainer.addEventListener('mouseleave', handleContainerMouseLeave);
    zoomContainer.addEventListener('focus', handleContainerFocus);
    zoomContainer.addEventListener('blur', handleContainerBlur);

    return () => {
      document.removeEventListener('keydown', handleKeyDown, { capture: true } as any);
      window.removeEventListener('keydown', handleKeyDown, { capture: true } as any);
      zoomContainer.removeEventListener('wheel', handleWheel);
      zoomContainer.removeEventListener('touchstart', handleTouchStart);
      zoomContainer.removeEventListener('touchmove', handleTouchMove);
      zoomContainer.removeEventListener('mouseenter', handleContainerMouseEnter);
      zoomContainer.removeEventListener('mouseleave', handleContainerMouseLeave);
      zoomContainer.removeEventListener('focus', handleContainerFocus);
      zoomContainer.removeEventListener('blur', handleContainerBlur);
    };
  }, [showNativePDFViewer, isMobile]);

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
          {nativePdfError ? (
            <ErrorDisplay message={nativePdfError} onRetry={handleNativePdfRetry} />
          ) : (
            <>
              {nativePdfLoading && (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-white bg-opacity-90">
                  <AppLoader text="Loading PDF in native viewer..." size={80} />
                </div>
              )}
              <div 
                ref={nativeZoomContainerRef}
                className="w-full h-full relative"
                tabIndex={0}
                style={{ 
                  overflow: nativeZoomPercent > 100 ? 'auto' : 'hidden',
                  outline: 'none'
                }}
              >
                <iframe
                  ref={nativeIframeRef}
                  src={
                    isMobile
                      ? `https://docs.google.com/gview?embedded=1&url=${encodeURIComponent(url)}`
                      : `${url}#zoom=${nativeZoomPercent}`
                  }
                  className="w-full h-full border-none"
                  onLoad={handleNativePdfLoad}
                  onError={handleNativePdfError}
                  allow="fullscreen"
                />
              </div>
            </>
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
