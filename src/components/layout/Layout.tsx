import { ReactNode } from "react";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { TubesCursorBackground } from "@/components/animations/TubesCursorBackground";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
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
