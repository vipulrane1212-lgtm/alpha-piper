import { ReactNode, useEffect } from "react";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { TubesCursorBackground } from "@/components/animations/TubesCursorBackground";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  // Neon cursor effect - works on all devices (mobile matches web)
  useEffect(() => {

    // Create cursor element - exact web version styling
    const cursorEl = document.createElement('div');
    cursorEl.id = 'neon-cursor';
    cursorEl.style.cssText = `
      position: fixed;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(0, 217, 255, 0.8) 0%, rgba(0, 217, 255, 0.4) 50%, transparent 100%);
      pointer-events: none;
      z-index: 99999;
      transform: translate(-50%, -50%);
      box-shadow: 0 0 20px rgba(0, 217, 255, 0.8), 0 0 40px rgba(0, 217, 255, 0.4);
      transition: opacity 0.2s ease;
      opacity: 0;
      left: -100px;
      top: -100px;
    `;
    document.body.appendChild(cursorEl);

    const updateCursorPosition = (x: number, y: number) => {
      cursorEl.style.left = x + 'px';
      cursorEl.style.top = y + 'px';
      cursorEl.style.opacity = '1';
    };

    const hideCursor = () => {
      cursorEl.style.opacity = '0';
    };

    // Mouse events (desktop)
    const handleMouseMove = (e: MouseEvent) => {
      updateCursorPosition(e.clientX, e.clientY);
    };

    // Touch events (mobile)
    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        updateCursorPosition(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        updateCursorPosition(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    const handleMouseLeave = () => {
      hideCursor();
    };

    const handleTouchEnd = () => {
      hideCursor();
    };

    // Detect mobile device
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
                    (window.matchMedia && window.matchMedia('(max-width: 1024px)').matches) ||
                    (('ontouchstart' in window) || navigator.maxTouchPoints > 0);

    // Add event listeners (Mouse only for cursor, skip touch on mobile)
    window.addEventListener('mousemove', handleMouseMove);
    
    if (!isMobile) {
      window.addEventListener('touchmove', handleTouchMove, { passive: true });
      window.addEventListener('touchstart', handleTouchStart, { passive: true });
      document.addEventListener('touchend', handleTouchEnd);
    }
    
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('touchend', handleTouchEnd);
      if (cursorEl.parentNode) {
        cursorEl.remove();
      }
    };
  }, []);

  return (
    <>
      {/* Global Tubes Background - full visibility */}
      <TubesCursorBackground />
      
      <div className="min-h-screen flex flex-col relative z-10">
        <Navbar />
        <main className="flex-1 pt-16">{children}</main>
        <Footer />
      </div>
    </>
  );
}
