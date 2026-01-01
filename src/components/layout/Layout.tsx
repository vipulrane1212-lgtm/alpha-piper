import { ReactNode, useEffect } from "react";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { TubesCursorBackground } from "@/components/animations/TubesCursorBackground";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  // Neon cursor effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const cursor = document.querySelector('body::before') as HTMLElement;
      if (!cursor) {
        // Create cursor element if it doesn't exist
        const cursorEl = document.createElement('div');
        cursorEl.id = 'neon-cursor';
        cursorEl.style.cssText = `
          position: fixed;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(0, 217, 255, 0.8) 0%, rgba(0, 217, 255, 0.4) 50%, transparent 100%);
          pointer-events: none;
          z-index: 9999;
          transform: translate(-50%, -50%);
          box-shadow: 0 0 20px rgba(0, 217, 255, 0.8), 0 0 40px rgba(0, 217, 255, 0.4);
          transition: opacity 0.2s ease;
        `;
        document.body.appendChild(cursorEl);
      }
      
      const cursorEl = document.getElementById('neon-cursor');
      if (cursorEl) {
        cursorEl.style.left = e.clientX + 'px';
        cursorEl.style.top = e.clientY + 'px';
        cursorEl.style.opacity = '1';
      }
      
      document.body.classList.add('neon-cursor-active');
    };

    const handleMouseLeave = () => {
      const cursorEl = document.getElementById('neon-cursor');
      if (cursorEl) {
        cursorEl.style.opacity = '0';
      }
      document.body.classList.remove('neon-cursor-active');
    };

    // Only add cursor on desktop
    if (window.matchMedia('(min-width: 768px)').matches) {
      window.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseleave', handleMouseLeave);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      const cursorEl = document.getElementById('neon-cursor');
      if (cursorEl) {
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
