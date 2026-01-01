import { ReactNode, useEffect } from "react";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { TubesCursorBackground } from "@/components/animations/TubesCursorBackground";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  // Neon cursor effect - works on all devices (desktop + mobile)
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

    const handleMouseLeave = () => {
      hideCursor();
    };

    // Touch events (mobile/tablet)
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        updateCursorPosition(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        updateCursorPosition(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    const handleTouchEnd = () => {
      // Hide cursor on touch end
      hideCursor();
    };

    // Add event listeners (all devices)
    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleTouchEnd);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
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
