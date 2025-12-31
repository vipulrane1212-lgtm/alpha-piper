import * as React from "react";
import { cn } from "@/lib/utils";

interface MagicCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  gradientColors?: string[];
  glowIntensity?: "low" | "medium" | "high";
}

const MagicCard = React.forwardRef<HTMLDivElement, MagicCardProps>(
  ({ children, className, gradientColors = ["#5ddcff", "#3c67e3", "#4e00c2"], glowIntensity = "medium", ...props }, ref) => {
    const gradientString = gradientColors.join(", ");
    const blurAmount = glowIntensity === "low" ? 20 : glowIntensity === "high" ? 40 : 30;
    
    return (
      <div
        ref={ref}
        className={cn(
          "magic-card relative rounded-xl p-[2px] overflow-visible",
          className
        )}
        style={{
          "--gradient-colors": gradientString,
          "--blur-amount": `${blurAmount}px`,
        } as React.CSSProperties}
        {...props}
      >
        {/* Rotating gradient border */}
        <div className="magic-card-border absolute inset-[-1px] rounded-xl z-[-1]" />
        
        {/* Blur glow effect */}
        <div className="magic-card-glow absolute inset-0 rounded-xl z-[-2]" />
        
        {/* Card content with glassmorphism */}
        <div className="relative rounded-xl bg-card/90 backdrop-blur-md h-full">
          {children}
        </div>
      </div>
    );
  }
);
MagicCard.displayName = "MagicCard";

export { MagicCard };
