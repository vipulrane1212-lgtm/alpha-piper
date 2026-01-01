import { ReactNode, useEffect } from "react";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { TubesCursorBackground } from "@/components/animations/TubesCursorBackground";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  // Neon cursor effect - works on desktop and mobile
  useEffect(() => {
    // Create cursor element - exact web version styling with strong glow
    const cursorEl = document.createElement('div');
    cursorEl.id = 'neon-cursor';
    cursorEl.style.cssText = `
      position: fixed;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(0, 217, 255, 0.9) 0%, rgba(0, 217, 255, 0.6) 40%, rgba(0, 217, 255, 0.3) 70%, transparent 100%);
      pointer-events: none;
      z-index: 99999;
      transform: translate(-50%, -50%);
      box-shadow: 
        0 0 10px rgba(0, 217, 255, 1),
        0 0 20px rgba(0, 217, 255, 0.9),
        0 0 30px rgba(0, 217, 255, 0.7),
        0 0 40px rgba(0, 217, 255, 0.5),
        0 0 60px rgba(0, 217, 255, 0.3);
      transition: opacity 0.2s ease, transform 0.05s ease;
      opacity: 0;
      left: -100px;
      top: -100px;
      will-change: transform, opacity;
    `;
    document.body.appendChild(cursorEl);

    const updateCursorPosition = (x: number, y: number) => {
      // Use transform for better performance and smoother movement
      cursorEl.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`;
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

    // Touch events (mobile/tablet) - same behavior as mouse
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        updateCursorPosition(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        updateCursorPosition(e.touches[0].clientX, e.touches[0].clientY);
        e.preventDefault(); // Prevent scrolling for better cursor tracking
      }
    };

    const handleTouchEnd = () => {
      // Hide cursor immediately on touch end (like mouse leave)
      hideCursor();
    };

    // Add event listeners
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
