import { useEffect, useRef } from "react";

interface TubesApp {
  tubes: {
    setColors: (colors: string[]) => void;
    setLightsColors: (colors: string[]) => void;
  };
  dispose?: () => void;
}

export function TubesCursorBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const appRef = useRef<TubesApp | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const scriptLoadedRef = useRef(false);

  useEffect(() => {
    if (!canvasRef.current) return;

    let isDisposed = false;
    let clickHandler: (() => void) | null = null;

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
        const options = {
          tubes: {
            colors: ["#14F195", "#9945FF", "#00D9FF"],
            lights: {
              intensity: 200,
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
      if (clickHandler) {
        document.body.removeEventListener('click', clickHandler);
      }
      if (appRef.current?.dispose) {
        appRef.current.dispose();
      }
    };
  }, []);

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
