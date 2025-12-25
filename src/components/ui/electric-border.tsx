import * as React from "react";
import { cn } from "@/lib/utils";

interface ElectricBorderCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "primary" | "tier1" | "tier2" | "tier3";
  children: React.ReactNode;
}

const variantColors = {
  primary: {
    border: "hsl(var(--primary))",
    glow: "hsl(var(--primary) / 0.6)",
    light: "hsl(var(--primary) / 0.8)",
  },
  tier1: {
    border: "hsl(var(--tier-1))",
    glow: "hsl(var(--tier-1) / 0.6)",
    light: "hsl(var(--tier-1) / 0.8)",
  },
  tier2: {
    border: "hsl(var(--tier-2))",
    glow: "hsl(var(--tier-2) / 0.6)",
    light: "hsl(var(--tier-2) / 0.8)",
  },
  tier3: {
    border: "hsl(var(--primary))",
    glow: "hsl(var(--primary) / 0.6)",
    light: "hsl(var(--primary) / 0.8)",
  },
};

// Generate unique filter IDs for each card instance
let filterIdCounter = 0;

const ElectricBorderCard = React.forwardRef<HTMLDivElement, ElectricBorderCardProps>(
  ({ variant = "primary", className, children, ...props }, ref) => {
    const colors = variantColors[variant];
    const [filterId] = React.useState(() => `turbulent-displace-${++filterIdCounter}`);
    
    return (
      <div
        ref={ref}
        className={cn(
          "relative p-[2px] rounded-xl",
          className
        )}
        {...props}
      >
        {/* SVG Filter Definition */}
        <svg className="absolute w-0 h-0" aria-hidden="true">
          <defs>
            <filter id={filterId} colorInterpolationFilters="sRGB" x="-20%" y="-20%" width="140%" height="140%">
              <feTurbulence type="turbulence" baseFrequency="0.02" numOctaves="10" result="noise1" seed="1" />
              <feOffset in="noise1" dx="0" dy="0" result="offsetNoise1">
                <animate attributeName="dy" values="200; 0" dur="4s" repeatCount="indefinite" calcMode="linear" />
              </feOffset>
              
              <feTurbulence type="turbulence" baseFrequency="0.02" numOctaves="10" result="noise2" seed="1" />
              <feOffset in="noise2" dx="0" dy="0" result="offsetNoise2">
                <animate attributeName="dy" values="0; -200" dur="4s" repeatCount="indefinite" calcMode="linear" />
              </feOffset>
              
              <feTurbulence type="turbulence" baseFrequency="0.02" numOctaves="10" result="noise3" seed="2" />
              <feOffset in="noise3" dx="0" dy="0" result="offsetNoise3">
                <animate attributeName="dx" values="150; 0" dur="4s" repeatCount="indefinite" calcMode="linear" />
              </feOffset>
              
              <feTurbulence type="turbulence" baseFrequency="0.02" numOctaves="10" result="noise4" seed="2" />
              <feOffset in="noise4" dx="0" dy="0" result="offsetNoise4">
                <animate attributeName="dx" values="0; -150" dur="4s" repeatCount="indefinite" calcMode="linear" />
              </feOffset>
              
              <feComposite in="offsetNoise1" in2="offsetNoise2" result="part1" />
              <feComposite in="offsetNoise3" in2="offsetNoise4" result="part2" />
              <feBlend in="part1" in2="part2" mode="color-dodge" result="combinedNoise" />
              
              <feDisplacementMap in="SourceGraphic" in2="combinedNoise" scale="8" xChannelSelector="R" yChannelSelector="B" />
            </filter>
          </defs>
        </svg>

        {/* Background gradient border */}
        <div 
          className="absolute inset-0 rounded-xl opacity-40"
          style={{
            background: `linear-gradient(-30deg, ${colors.glow}, transparent, ${colors.glow})`,
          }}
        />
        
        {/* Electric border - inner layer */}
        <div className="absolute inset-0 rounded-xl overflow-hidden">
          <div 
            className="absolute inset-0 rounded-xl"
            style={{
              border: `2px solid ${colors.border}`,
              filter: `url(#${filterId})`,
            }}
          />
        </div>

        {/* Glow layer 1 */}
        <div 
          className="absolute inset-0 rounded-xl pointer-events-none"
          style={{
            border: `1px solid ${colors.glow}`,
            filter: "blur(1px)",
          }}
        />

        {/* Glow layer 2 */}
        <div 
          className="absolute inset-0 rounded-xl pointer-events-none"
          style={{
            border: `1px solid ${colors.light}`,
            filter: "blur(4px)",
          }}
        />

        {/* Background glow */}
        <div 
          className="absolute inset-0 rounded-xl -z-10 pointer-events-none"
          style={{
            background: `linear-gradient(-30deg, ${colors.light}, transparent, ${colors.border})`,
            filter: "blur(20px)",
            transform: "scale(1.1)",
            opacity: 0.2,
          }}
        />

        {/* Content container */}
        <div className="relative bg-card rounded-xl overflow-hidden">
          {children}
        </div>
      </div>
    );
  }
);
ElectricBorderCard.displayName = "ElectricBorderCard";

export { ElectricBorderCard };
