import { useEffect, useRef } from "react";

interface TubesApp {
  tubes: {
    setColors: (colors: string[]) => void;
    setLightsColors: (colors: string[]) => void;
  };
  dispose?: () => void;
}

// Detect mobile/touch devices
function isMobileDevice(): boolean {
  if (typeof window === 'undefined') return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
    (window.matchMedia && window.matchMedia('(max-width: 768px)').matches) ||
    ('ontouchstart' in window);
}

export function TubesCursorBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const appRef = useRef<TubesApp | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const scriptLoadedRef = useRef(false);
  const isMobile = isMobileDevice();
  const isOverCardRef = useRef(false);

  useEffect(() => {
    // Skip on mobile devices for performance - cursor doesn't work anyway
    if (isMobile || !canvasRef.current) return;

    let isDisposed = false;
    let clickHandler: (() => void) | null = null;
    
    // Track mouse position to detect when cursor is over glassmorphism cards
    const handleMouseMove = (e: MouseEvent) => {
      if (isDisposed) return;
      
      // Check if cursor is over any glassmorphism card
      const elements = document.elementsFromPoint(e.clientX, e.clientY);
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
    };
    
    document.addEventListener('mousemove', handleMouseMove);

    const loadScript = (): Promise<void> => {
      return new Promise((resolve, reject) => {
        if (scriptLoadedRef.current) {
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
        
        const handleLoad = () => {
          scriptLoadedRef.current = true;
          window.removeEventListener('tubesCursorLoaded', handleLoad);
          resolve();
        };
        
        window.addEventListener('tubesCursorLoaded', handleLoad);
        document.head.appendChild(script);
        
        // Timeout fallback
        setTimeout(() => {
          if (!scriptLoadedRef.current) {
            reject(new Error("Script load timeout"));
          }
        }, 10000);
      });
    };

    const initTubes = async () => {
      try {
        await loadScript();
        
        if (isDisposed || !canvasRef.current) return;

        const TubesCursor = (window as any).__TubesCursor;
        if (!TubesCursor) {
          console.error("TubesCursor not loaded");
          return;
        }

        // Solana-themed colors: green, purple, cyan
        // Lower base intensity to reduce glare
        const options = {
          tubes: {
            colors: ["#14F195", "#9945FF", "#00D9FF"],
            lights: {
              intensity: 80, // Further reduced base intensity
              colors: ["#14F195", "#9945FF", "#00D9FF", "#19FB9B"]
            }
          }
        };

        appRef.current = TubesCursor(canvasRef.current, options);

        // Removed click handler - keep Solana colors constant
      } catch (error) {
        console.error("Failed to load TubesCursor:", error);
      }
    };

    initTubes();

    return () => {
      isDisposed = true;
      document.removeEventListener('mousemove', handleMouseMove);
      document.body.classList.remove('cursor-over-glass-card');
      if (clickHandler) {
        document.body.removeEventListener('click', clickHandler);
      }
      if (appRef.current?.dispose) {
        appRef.current.dispose();
      }
    };
  }, [isMobile]);

  // Don't render on mobile - saves performance and battery
  if (isMobile) return null;

  return (
    <div 
      ref={containerRef}
      id="tubes-container"
      className="fixed inset-0 w-full h-full overflow-hidden z-0"
      style={{ touchAction: "none" }}
    >
      <canvas
        ref={canvasRef}
        id="canvas"
        className="w-full h-full"
      />
    </div>
  );
}

function randomColors(count: number): string[] {
  return new Array(count)
    .fill(0)
    .map(() => "#" + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0'));
}
