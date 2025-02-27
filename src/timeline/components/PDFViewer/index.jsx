import PropTypes from 'prop-types';
import { useCallback, useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { Paginator } from 'primereact/paginator';
import * as pdfjsLib from 'pdfjs-dist/build/pdf';
import 'pdfjs-dist/build/pdf.worker.min';
import { auth } from '../../firebase';
import LoadingAnimation from './LoadingAnimation';
import ErrorDisplay from './ErrorDisplay';
import { downloadPDF, shareFile } from './utils/share.js';
import ShareMenu from './ShareMenu';
import { AnimatePresence } from 'framer-motion';
import usePinchZoom from './utils/usePinchZoom';

const PDFViewer = ({ url }) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [pdfDoc, setPdfDoc] = useState(null);
  const [pageNum, setPageNum] = useState(1);
  const [numPages, setNumPages] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const renderingRef = useRef(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [downloadStatus, setDownloadStatus] = useState(null);
  const [shareStatus, setShareStatus] = useState(null);
  const [pdfDimensions, setPdfDimensions] = useState({ width: 0, height: 0 });

  function getInitialScale() {
    const width = window.innerWidth;
    if (width < 768) return 0.8; // Mobile
    if (width < 1024) return 1.0; // Tablet
    return 1.0; // Desktop - reduced from 1.2 to fix scaling issues
  }

  // Use the pinch zoom hook
  const {
    scale,
    setScale,
    rotation,
    setRotation,
    panPosition,
    setPanPosition,
    isPinchZooming,
    handleZoom,
    handleRotate,
    handleResetView,
    isZoomedIn
  } = usePinchZoom({
    initialScale: getInitialScale(),
    minScale: 0.2,
    maxScale: 5,
    getInitialScale,
    containerRef,
    canvasRef
  });

  const handleDownload = useCallback(async () => {
    setDownloadStatus('downloading');
    const success = await downloadPDF(url);
    setDownloadStatus(success ? 'success' : 'error');

    // Reset status after a delay
    setTimeout(() => {
      setDownloadStatus(null);
    }, 2000);
  }, [url]);

  const handleShare = useCallback(async () => {
    setShareStatus('sharing');
    const success = await shareFile(url);
    setShareStatus(success ? 'success' : 'error');

    // Reset status after a delay
    setTimeout(() => {
      setShareStatus(null);
    }, 2000);
  }, [url]);

  const toggleShareMenu = useCallback(() => {
    setShowShareMenu(prev => !prev);
  }, []);

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

          const ctx = canvas.getContext('2d');

          // Store original PDF dimensions
          setPdfDimensions({
            width: viewport.width,
            height: viewport.height
          });

          // Calculate container dimensions
          const containerWidth = containerRef.current.clientWidth - 32;

          // Calculate the scale that would fit the PDF in the container
          const containerScale = containerWidth / viewport.width;

          // Use the container scale as a minimum to ensure PDF is visible
          // but allow user to zoom in further if they've manually set a higher scale
          const finalScale = Math.max(containerScale * 0.9, scale);

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

          // If this is the first render and scale is at initial value,
          // update the scale to match what was actually used
          if (scale === getInitialScale() && !isZoomedIn) {
            setScale(finalScale);
          }
        } catch (error) {
          console.error('Error rendering page:', error);
          setError('Failed to render page. Please try again.');
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
      if (url.includes('firebasestorage.googleapis')) {
        const user = auth.currentUser;
        if (!user) {
          console.error('User not authenticated');
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
      setScale(getInitialScale());
      setPanPosition({ x: 0, y: 0 });

      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    } catch (error) {
      console.error('Error loading PDF:', error);
      setError('Failed to load PDF. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [url, setRotation, setScale, setPanPosition]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (pdfDoc && !isZoomedIn) {
        // Only auto-adjust scale when not manually zoomed
        setScale(getInitialScale());
        renderPage(pageNum);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [pdfDoc, pageNum, renderPage, isZoomedIn, setScale]);

  useEffect(() => {
    pdfjsLib.GlobalWorkerOptions.workerSrc =
        'https://mozilla.github.io/pdf.js/build/pdf.worker.mjs';

    let mounted = true;

    const initPDF = async () => {
      if (!mounted) return;
      await loadPDF();
    };

    initPDF();

    return () => {
      mounted = false;
    };
  }, [loadPDF]);

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

  return (
      <ViewerContainer>
        <ToolBar>
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
          </ToolGroup>

          <ToolGroup>
            <ToolButton
                onClick={handleRotate}
                disabled={isLoading}
                title="Rotate"
            >
              <i className="pi pi-refresh" />
            </ToolButton>

            <ToolButton
                onClick={handleResetView}
                disabled={isLoading || (scale === getInitialScale() && rotation === 0 && panPosition.x === 0 && panPosition.y === 0)}
                title="Reset View"
            >
              <i className="pi pi-undo" />
            </ToolButton>

            <ToolButton
                onClick={handleDownload}
                disabled={isLoading || downloadStatus === 'downloading'}
                title="Download PDF"
                className={downloadStatus ? `status-${downloadStatus}` : ''}
            >
              <i className={`pi ${
                  downloadStatus === 'downloading' ? 'pi-spin pi-spinner' :
                      downloadStatus === 'success' ? 'pi-check' :
                          downloadStatus === 'error' ? 'pi-times' :
                              'pi-download'
              }`} />
            </ToolButton>

            <ToolButton
                onClick={handleShare}
                disabled={isLoading || shareStatus === 'sharing'}
                title="Share PDF File"
                className={shareStatus ? `status-${shareStatus}` : ''}
            >
              <i className={`pi ${
                  shareStatus === 'sharing' ? 'pi-spin pi-spinner' :
                      shareStatus === 'success' ? 'pi-check' :
                          shareStatus === 'error' ? 'pi-times' :
                              'pi-share-alt'
              }`} />
            </ToolButton>

            <ToolButton
                onClick={toggleShareMenu}
                disabled={isLoading}
                title="More Sharing Options"
                className={showShareMenu ? 'active' : ''}
            >
              <i className="pi pi-ellipsis-h" />
            </ToolButton>

            <AnimatePresence>
              {showShareMenu && (
                  <ShareMenu url={url} onClose={() => setShowShareMenu(false)} />
              )}
            </AnimatePresence>
          </ToolGroup>

          <PageInfo>
            Page {pageNum} of {numPages || '?'}
          </PageInfo>
        </ToolBar>

        <ViewerContent
            ref={containerRef}
            className={isPinchZooming ? 'pinch-zooming' : ''}
            $allowOverflow={isZoomedIn}
        >
          {isLoading && <LoadingAnimation />}
          <CanvasWrapper
              style={{
                transform: `translate(${panPosition.x}px, ${panPosition.y}px) scale(${scale})`,
                transformOrigin: 'center',
                cursor: isZoomedIn ? 'grab' : 'default',
              }}
          >
            <canvas ref={canvasRef}></canvas>
          </CanvasWrapper>
        </ViewerContent>

        {numPages > 1 && (
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

  &.status-downloading, &.status-sharing {
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

const ViewerContent = styled.div`
  flex: 1;
  overflow: ${props => props.$allowOverflow ? 'auto' : 'hidden'};
  padding: 1rem;
  display: flex;
  justify-content: center;
  align-items: center;
  background: var(--surface-100);
  -webkit-overflow-scrolling: touch;
  position: relative;
  touch-action: ${props => props.$allowOverflow ? 'none' : 'auto'};
  
  &.pinch-zooming {
    overflow: hidden;
  }
`;

const CanvasWrapper = styled.div`
  transition: transform 0.05s ease;
  will-change: transform;
  
  canvas {
    max-width: 100%;
    height: auto !important;
    box-shadow: var(--shadow-lg);
    background: white;
    border-radius: var(--border-radius-sm);
    transform-origin: center;
  }
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

PDFViewer.propTypes = {
  url: PropTypes.string.isRequired,
};

export default PDFViewer;