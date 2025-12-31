import { useEffect, useRef } from "react";

// Declare the TubesCursor type
declare global {
  interface Window {
    TubesCursor: new (canvas: HTMLCanvasElement, options: TubesCursorOptions) => TubesCursorInstance;
  }
}

interface TubesCursorOptions {
  tubes: {
    colors: string[];
  };
  lights: {
    intensity: number;
    colors: string[];
  };
}

interface TubesCursorInstance {
  tubes: {
    setColors: (colors: string[]) => void;
    setLightsColors: (colors: string[]) => void;
  };
  dispose?: () => void;
}

export function TubesCursorBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const appRef = useRef<TubesCursorInstance | null>(null);
  const scriptLoadedRef = useRef(false);

  useEffect(() => {
    if (!canvasRef.current) return;

    const loadScript = () => {
      return new Promise<void>((resolve, reject) => {
        if (scriptLoadedRef.current && window.TubesCursor) {
          resolve();
          return;
        }

        const script = document.createElement("script");
        script.src = "https://cdn.jsdelivr.net/npm/threejs-components@0.0.19/build/cursors/tubes1.min.js";
        script.async = true;
        script.onload = () => {
          scriptLoadedRef.current = true;
          resolve();
        };
        script.onerror = reject;
        document.head.appendChild(script);
      });
    };

    const initTubesCursor = async () => {
      try {
        await loadScript();
        
        if (!canvasRef.current || !window.TubesCursor) return;

        // Solana-themed colors - cyan, purple, teal
        const tubeColors = ["#14F195", "#9945FF", "#00D9FF"];
        const lightColors = ["#14F195", "#9945FF", "#00D9FF", "#FF6B6B"];

        appRef.current = new window.TubesCursor(canvasRef.current, {
          tubes: {
            colors: tubeColors,
          },
          lights: {
            intensity: 200,
            colors: lightColors,
          },
        });
      } catch (error) {
        console.error("Failed to load TubesCursor:", error);
      }
    };

    initTubesCursor();

    return () => {
      if (appRef.current?.dispose) {
        appRef.current.dispose();
      }
    };
  }, []);

  return (
    <div className="absolute inset-0 w-full h-full" style={{ background: "#000" }}>
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ touchAction: "none" }}
      />
    </div>
  );
}
