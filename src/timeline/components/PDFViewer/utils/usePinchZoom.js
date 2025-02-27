import { useState, useCallback, useRef, useEffect } from 'react';

/**
 * Custom hook for handling pinch-to-zoom and pan functionality
 *
 * @param {Object} options - Configuration options
 * @param {number} options.initialScale - Initial zoom scale
 * @param {number} options.minScale - Minimum allowed scale
 * @param {number} options.maxScale - Maximum allowed scale
 * @param {Function} options.getInitialScale - Function to get the initial scale based on viewport
 * @param {React.RefObject} options.containerRef - Reference to the container element
 * @param {React.RefObject} options.canvasRef - Reference to the canvas element
 * @returns {Object} - Zoom state and handlers
 */
const usePinchZoom = ({
    initialScale = 1,
    minScale = 0.2,
    maxScale = 5,
    getInitialScale = () => 1,
    containerRef,
    canvasRef
}) => {
    const [scale, setScale] = useState(initialScale);
    const [rotation, setRotation] = useState(0);
    const [panPosition, setPanPosition] = useState({ x: 0, y: 0 });
    const [isPinchZooming, setIsPinchZooming] = useState(false);

    // Refs to track touch state
    const lastTouchRef = useRef({ x: 0, y: 0, scale: 1, distance: 0 });
    const touchStartRef = useRef(null);
    const isDraggingRef = useRef(false);

    // Handle zoom level changes
    const handleZoom = useCallback((delta) => {
        setScale((prevScale) => {
            // Allow zoom levels between min and max
            const newScale = Math.max(minScale, Math.min(maxScale, prevScale + delta));

            // Reset pan position when zooming out to default scale
            if (newScale <= getInitialScale()) {
                setPanPosition({ x: 0, y: 0 });
            }

            return newScale;
        });
    }, [minScale, maxScale, getInitialScale]);

    // Handle rotation
    const handleRotate = useCallback(() => {
        setRotation((prev) => (prev + 90) % 360);
        // Reset pan position when rotating
        setPanPosition({ x: 0, y: 0 });
    }, []);

    // Reset view to default
    const handleResetView = useCallback(() => {
        setScale(getInitialScale());
        setPanPosition({ x: 0, y: 0 });
        setRotation(0);
    }, [getInitialScale]);

    // Mouse drag handlers
    const handleMouseDown = useCallback((e) => {
        if (scale > getInitialScale() && e.button === 0) { // Left mouse button
            touchStartRef.current = {
                x: e.clientX,
                y: e.clientY,
                panX: panPosition.x,
                panY: panPosition.y
            };
            isDraggingRef.current = true;

            // Change cursor to grabbing
            if (containerRef.current) {
                containerRef.current.style.cursor = 'grabbing';
            }
        }
    }, [scale, panPosition, getInitialScale, containerRef]);

    const handleMouseMove = useCallback((e) => {
        if (isDraggingRef.current && touchStartRef.current) {
            e.preventDefault();

            const dx = e.clientX - touchStartRef.current.x;
            const dy = e.clientY - touchStartRef.current.y;

            setPanPosition({
                x: touchStartRef.current.panX + dx,
                y: touchStartRef.current.panY + dy
            });
        }
    }, []);

    const handleMouseUp = useCallback(() => {
        isDraggingRef.current = false;
        touchStartRef.current = null;

        // Reset cursor
        if (containerRef.current) {
            containerRef.current.style.cursor = scale > getInitialScale() ? 'grab' : 'default';
        }
    }, [scale, getInitialScale, containerRef]);

    // Touch event handlers
    const handleTouchStart = useCallback((e) => {
        if (e.touches.length === 2) {
            // Pinch zoom start
            const touch1 = e.touches[0];
            const touch2 = e.touches[1];
            const distance = Math.hypot(
                touch2.clientX - touch1.clientX,
                touch2.clientY - touch1.clientY
            );

            lastTouchRef.current = {
                distance,
                scale,
                x: panPosition.x,
                y: panPosition.y
            };

            setIsPinchZooming(true);
        } else if (e.touches.length === 1 && scale > getInitialScale()) {
            // Pan start (only when zoomed in)
            touchStartRef.current = {
                x: e.touches[0].clientX,
                y: e.touches[0].clientY,
                panX: panPosition.x,
                panY: panPosition.y
            };
            isDraggingRef.current = true;
        }
    }, [scale, panPosition, getInitialScale]);

    const handleTouchMove = useCallback((e) => {
        if (e.touches.length === 2 && lastTouchRef.current) {
            // Pinch zoom
            e.preventDefault(); // Prevent default browser behavior

            const touch1 = e.touches[0];
            const touch2 = e.touches[1];
            const distance = Math.hypot(
                touch2.clientX - touch1.clientX,
                touch2.clientY - touch1.clientY
            );

            // Calculate new scale based on pinch distance
            const scaleFactor = distance / lastTouchRef.current.distance;
            const newScale = Math.max(minScale, Math.min(maxScale, lastTouchRef.current.scale * scaleFactor));

            setScale(newScale);
        } else if (e.touches.length === 1 && isDraggingRef.current && touchStartRef.current) {
            // Pan when zoomed in
            e.preventDefault(); // Prevent default browser behavior

            const dx = e.touches[0].clientX - touchStartRef.current.x;
            const dy = e.touches[0].clientY - touchStartRef.current.y;

            setPanPosition({
                x: touchStartRef.current.panX + dx,
                y: touchStartRef.current.panY + dy
            });
        }
    }, [minScale, maxScale]);

    const handleTouchEnd = useCallback(() => {
        setIsPinchZooming(false);
        isDraggingRef.current = false;
        touchStartRef.current = null;
    }, []);

    // Handle mouse wheel for zoom and pan
    const handleWheel = useCallback((e) => {
        if (e.ctrlKey || e.metaKey) {
            e.preventDefault(); // Prevent browser zoom
            const delta = -e.deltaY * 0.01;
            handleZoom(delta);
        } else if (scale > getInitialScale()) {
            // Pan with wheel when zoomed in
            e.preventDefault();
            setPanPosition(prev => ({
                x: prev.x - e.deltaX,
                y: prev.y - e.deltaY
            }));
        }
    }, [handleZoom, scale, getInitialScale]);

    // Set up event listeners
    useEffect(() => {
        const container = containerRef?.current;
        if (!container) return;

        // Add passive: false to allow preventDefault() in touch handlers
        container.addEventListener('touchstart', handleTouchStart, { passive: false });
        container.addEventListener('touchmove', handleTouchMove, { passive: false });
        container.addEventListener('touchend', handleTouchEnd);
        container.addEventListener('wheel', handleWheel, { passive: false });

        // Add mouse drag support for desktop
        container.addEventListener('mousedown', handleMouseDown);
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);

        return () => {
            container.removeEventListener('touchstart', handleTouchStart);
            container.removeEventListener('touchmove', handleTouchMove);
            container.removeEventListener('touchend', handleTouchEnd);
            container.removeEventListener('wheel', handleWheel);

            container.removeEventListener('mousedown', handleMouseDown);
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [
        containerRef,
        handleTouchStart,
        handleTouchMove,
        handleTouchEnd,
        handleWheel,
        handleMouseDown,
        handleMouseMove,
        handleMouseUp
    ]);

    // Update cursor based on zoom state
    useEffect(() => {
        if (containerRef?.current) {
            containerRef.current.style.cursor = scale > getInitialScale() ? 'grab' : 'default';
        }
    }, [scale, getInitialScale, containerRef]);

    return {
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
        isZoomedIn: scale > getInitialScale()
    };
};

export default usePinchZoom;