import { useEffect, useRef } from "react";

interface TubesApp {
  tubes: {
    setColors: (colors: string[]) => void;
    setLightsColors: (colors: string[]) => void;
  };
  dispose?: () => void;
}

// Detect mobile device - Robust check
const isMobileDevice = () => {
  if (typeof window === 'undefined') return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
         (window.matchMedia && window.matchMedia('(max-width: 1024px)').matches) ||
         (('ontouchstart' in window) || navigator.maxTouchPoints > 0);
};

export function TubesCursorBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const appRef = useRef<TubesApp | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const scriptLoadedRef = useRef(false);
  const isOverCardRef = useRef(false);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    let isDisposed = false;
    let rafId: number | null = null;
    let lastUpdateTime = 0;
    const UPDATE_THROTTLE = 16; // ~60fps
    
    // Track mouse/touch position to detect when cursor is over glassmorphism cards
    const handleMove = (e: MouseEvent | TouchEvent) => {
      if (isDisposed) return;
      
      // Block touch interaction on mobile
      if ('touches' in e && isMobileDevice()) return;
      
      const now = performance.now();
      if (now - lastUpdateTime < UPDATE_THROTTLE) return;
      lastUpdateTime = now;
      
      let clientX = 0;
      let clientY = 0;
      
      if ('touches' in e && e.touches.length > 0) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else if ('clientX' in e) {
        clientX = e.clientX;
        clientY = e.clientY;
      }
      
      // Use requestAnimationFrame for smooth updates
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        if (isDisposed) return;
        
        // Check if cursor is over any glassmorphism card
        try {
          const elements = document.elementsFromPoint(clientX, clientY);
          const isOverCard = elements.some(el => {
            // Check for glassmorphism cards (testimonial cards, glass cards, etc.)
            const hasGlassCard = el.classList.contains('testimonial-card') ||
                   el.closest('.testimonial-card') !== null ||
                   el.classList.contains('glass-card') ||
                   el.getAttribute('data-glass-card') === 'true' ||
                   el.closest('[data-glass-card="true"]') !== null ||
                   el.closest('[class*="backdrop-blur"]') !== null ||
                   (el as HTMLElement).style?.backdropFilter?.includes('blur');
            
            // Also check if element contains text content (to avoid false positives)
            if (hasGlassCard) {
              const textContent = el.textContent || '';
              // Only consider it a card if it has meaningful text content
              return textContent.trim().length > 10;
            }
            
            return false;
          });
          
          isOverCardRef.current = isOverCard;
          
          // Add/remove class to body for CSS targeting (CSS will handle opacity changes)
          if (isOverCard) {
            document.body.classList.add('cursor-over-glass-card');
          } else {
            document.body.classList.remove('cursor-over-glass-card');
          }
        } catch (error) {
          // Silently handle errors (e.g., elementsFromPoint can fail in some edge cases)
          console.debug('Error checking cursor position:', error);
        }
      });
    };
    
    window.addEventListener('mousemove', handleMove, { passive: true });
    window.addEventListener('touchmove', handleMove, { passive: true });

    const loadScript = (): Promise<void> => {
      return new Promise((resolve, reject) => {
        if (scriptLoadedRef.current) {
          resolve();
          return;
        }

        // Check if already loaded
        if ((window as any).__TubesCursor) {
          scriptLoadedRef.current = true;
          resolve();
          return;
        }

        const script = document.createElement("script");
        script.type = "module";
        script.textContent = `
          import TubesCursor from "https://cdn.jsdelivr.net/npm/threejs-components@0.0.19/build/cursors/tubes1.min.js";
          window.__TubesCursor = TubesCursor;
          window.dispatchEvent(new Event('tubesCursorLoaded'));
        `;
        
        script.onerror = () => {
          window.removeEventListener('tubesCursorLoaded', handleLoad);
          reject(new Error("Failed to load TubesCursor script"));
        };
        
        const handleLoad = () => {
          scriptLoadedRef.current = true;
          window.removeEventListener('tubesCursorLoaded', handleLoad);
          clearTimeout(timeoutId);
          resolve();
        };
        
        window.addEventListener('tubesCursorLoaded', handleLoad);
        document.head.appendChild(script);
        
        // Timeout fallback
        const timeoutId = setTimeout(() => {
          if (!scriptLoadedRef.current) {
            window.removeEventListener('tubesCursorLoaded', handleLoad);
            reject(new Error("TubesCursor script load timeout"));
          }
        }, 15000);
      });
    };

    const initTubes = async () => {
      try {
        await loadScript();
        
        if (isDisposed || !canvas) {
          console.warn("TubesCursor: Canvas not available or disposed");
          return;
        }

        const TubesCursor = (window as any).__TubesCursor;
        if (!TubesCursor) {
          console.error("TubesCursor library not loaded");
          return;
        }

        // Ensure canvas has proper dimensions
        const rect = canvas.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) {
          // Wait a bit for canvas to be sized
          setTimeout(() => initTubes(), 100);
          return;
        }

        // Set canvas dimensions explicitly
        canvas.width = rect.width * (window.devicePixelRatio || 1);
        canvas.height = rect.height * (window.devicePixelRatio || 1);

        // Solana-themed colors: green, purple, cyan
        const options = {
          tubes: {
            colors: ["#14F195", "#9945FF", "#00D9FF"],
            lights: {
              intensity: 80,
              colors: ["#14F195", "#9945FF", "#00D9FF", "#19FB9B"]
            }
          }
        };

        // User requested: "dont respond to touch on mobile let it keep floating"
        // HIJACK: Temporarily disable touch/mouse listeners during library initialization
        const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        
        if (isTouchDevice) {
          const originalWindowAdd = window.addEventListener;
          const originalDocAdd = document.addEventListener;
          const originalCanvasAdd = canvas.addEventListener;
          
          // A "Deafener" function that ignores all movement events
          const hijackedAdd = function(this: any, type: string, listener: any, options: any) {
            if (type.match(/^(mouse|touch|pointer|MSPointer|gesture)/i)) {
              console.debug(`TubesCursor Hijack: Blocked ${type} listener on mobile`);
              return;
            }
            
            if (this === window) return originalWindowAdd.apply(this, [type, listener, options]);
            if (this === document) return originalDocAdd.apply(this, [type, listener, options]);
            return originalCanvasAdd.apply(this, [type, listener, options]);
          };

          // Apply the hijack to everything the library might touch
          window.addEventListener = hijackedAdd as any;
          document.addEventListener = hijackedAdd as any;
          canvas.addEventListener = hijackedAdd as any;

          // Initialize the library while it's "blindfolded"
          appRef.current = TubesCursor(canvas, options);
          
          // Keep it hijacked for 1 second to catch any delayed/async listeners
          setTimeout(() => {
            window.addEventListener = originalWindowAdd;
            document.addEventListener = originalDocAdd;
            canvas.addEventListener = originalCanvasAdd;
            console.debug("TubesCursor Hijack: Restored original listeners");
          }, 1000);
        } else {
          appRef.current = TubesCursor(canvas, options);
        }
        
        // Verify initialization
        if (appRef.current) {
          console.debug("TubesCursor initialized successfully");
        }
      } catch (error) {
        console.error("Failed to initialize TubesCursor:", error);
      }
    };

    // Convert touch events to mouse events for TubesCursor library
    // The library listens to mouse events, so we need to simulate them from touch
    let lastTouchTime = 0;
    const TOUCH_THROTTLE = 16; // ~60fps
    
    const handleTouchForTubesCursor = (e: TouchEvent) => {
      if (isDisposed || !canvas) return;
      
      const touch = e.touches[0] || e.changedTouches[0];
      if (!touch) return;

      const now = performance.now();
      if (now - lastTouchTime < TOUCH_THROTTLE) return;
      lastTouchTime = now;

      try {
        // Create and dispatch synthetic mouse events
        const mouseEventOptions: MouseEventInit = {
          bubbles: true,
          cancelable: true,
          view: window,
          clientX: touch.clientX,
          clientY: touch.clientY,
          screenX: touch.screenX,
          screenY: touch.screenY,
          button: 0,
          buttons: 0,
        };

        // Dispatch mousemove event to multiple targets
        const mouseMoveEvent = new MouseEvent('mousemove', mouseEventOptions);
        window.dispatchEvent(mouseMoveEvent);
        document.dispatchEvent(mouseMoveEvent);
        canvas.dispatchEvent(mouseMoveEvent);
        
        // Also try pointer events as some libraries use those
        if ('PointerEvent' in window) {
          const pointerEvent = new PointerEvent('pointermove', {
            ...mouseEventOptions,
            pointerId: 1,
            pointerType: 'touch',
            isPrimary: true,
          });
          window.dispatchEvent(pointerEvent);
          canvas.dispatchEvent(pointerEvent);
        }
      } catch (error) {
        console.debug('Error dispatching touch-to-mouse event:', error);
      }
    };

    // Add touch event listeners - ONLY on non-mobile devices or if you want touch response
    // User requested: "dont respond to touch on mobile let it keep floating"
    if (!isMobileDevice()) {
      const touchOptions = { passive: true, capture: true };
      window.addEventListener('touchmove', handleTouchForTubesCursor, touchOptions);
      window.addEventListener('touchstart', handleTouchForTubesCursor, touchOptions);
      canvas.addEventListener('touchmove', handleTouchForTubesCursor, touchOptions);
      canvas.addEventListener('touchstart', handleTouchForTubesCursor, touchOptions);
    }

    // Handle window resize to update canvas
    const handleResize = () => {
      if (!canvas || isDisposed) return;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * (window.devicePixelRatio || 1);
      canvas.height = rect.height * (window.devicePixelRatio || 1);
    };
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    // Initialize after a short delay to ensure canvas is ready
    setTimeout(() => {
      initTubes();
    }, 100);

    return () => {
      isDisposed = true;
      if (rafId) cancelAnimationFrame(rafId);
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
      const touchOptions = { passive: true, capture: true };
      window.removeEventListener('touchmove', handleTouchForTubesCursor, touchOptions);
      window.removeEventListener('touchstart', handleTouchForTubesCursor, touchOptions);
      if (canvas) {
        canvas.removeEventListener('touchmove', handleTouchForTubesCursor, touchOptions);
        canvas.removeEventListener('touchstart', handleTouchForTubesCursor, touchOptions);
      }
      document.body.classList.remove('cursor-over-glass-card');
      if (appRef.current?.dispose) {
        try {
          appRef.current.dispose();
        } catch (error) {
          console.debug('Error disposing TubesCursor:', error);
        }
      }
    };
  }, []);

  // Render on all devices (mobile matches web)
  const isMobile = isMobileDevice();

  return (
    <div 
      ref={containerRef}
      id="tubes-container"
      className="fixed inset-0 w-full h-full overflow-hidden z-0"
      style={{ 
        touchAction: "none", 
        pointerEvents: "none", 
        width: "100%",
        height: "100%",
      }}
    >
      <canvas
        ref={canvasRef}
        id="canvas"
        className="w-full h-full"
        style={{ 
          touchAction: "none",
          pointerEvents: "auto",
          display: "block",
          width: "100%",
          height: "100%",
        }}
      />
      {/* Mobile Touch Shield - Captures touch events so background stays idle */}
      {isMobile && (
        <div 
          className="absolute inset-0 z-10" 
          style={{ 
            touchAction: "none",
            pointerEvents: "auto",
            background: "transparent"
          }}
          onContextMenu={(e) => e.preventDefault()}
        />
      )}
    </div>
  );
}

function randomColors(count: number): string[] {
  return new Array(count)
    .fill(0)
    .map(() => "#" + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0'));
}
