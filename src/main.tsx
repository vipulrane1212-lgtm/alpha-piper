import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Lock viewport on mobile to prevent zoom and orientation issues
if (typeof window !== 'undefined') {
  // Prevent zoom on double tap
  let lastTouchEnd = 0;
  document.addEventListener('touchend', (e) => {
    const now = Date.now();
    if (now - lastTouchEnd <= 300) {
      e.preventDefault();
    }
    lastTouchEnd = now;
  }, false);

  // Prevent zoom on pinch
  document.addEventListener('gesturestart', (e) => {
    e.preventDefault();
  });

  document.addEventListener('gesturechange', (e) => {
    e.preventDefault();
  });

  document.addEventListener('gestureend', (e) => {
    e.preventDefault();
  });

  // Lock viewport size on orientation change
  const lockViewport = () => {
    const viewport = document.querySelector('meta[name="viewport"]');
    if (viewport) {
      viewport.setAttribute('content', 
        'width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no, viewport-fit=cover'
      );
    }
  };

  window.addEventListener('orientationchange', () => {
    lockViewport();
    // Force resize after orientation change
    setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 100);
  });

  window.addEventListener('resize', () => {
    lockViewport();
  });
}

createRoot(document.getElementById("root")!).render(<App />);
