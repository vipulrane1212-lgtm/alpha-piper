import { ReactNode } from "react";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { TubesCursorBackground } from "@/components/animations/TubesCursorBackground";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Global Tubes Background */}
      <TubesCursorBackground />
      
      {/* Gradient overlay for readability */}
      <div className="fixed inset-0 bg-gradient-to-b from-background/70 via-background/50 to-background/80 pointer-events-none z-0" />
      
      <Navbar />
      <main className="flex-1 pt-16 relative z-10">{children}</main>
      <Footer />
    </div>
  );
}
