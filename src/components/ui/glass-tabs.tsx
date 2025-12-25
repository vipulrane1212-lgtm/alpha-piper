import * as React from "react";
import { cn } from "@/lib/utils";

interface GlassTabProps {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  variant?: "primary" | "tier1" | "tier2" | "tier3";
  className?: string;
}

const variantStyles = {
  primary: {
    bg: "hsl(var(--primary) / 0.05)",
    shadow: "hsl(var(--primary) / 0.25)",
    glow: "hsl(var(--primary) / 0.4)",
    text: "hsl(var(--primary))",
    activeBg: "hsl(var(--primary) / 0.15)",
  },
  tier1: {
    bg: "hsl(var(--tier-1) / 0.05)",
    shadow: "hsl(var(--tier-1) / 0.25)",
    glow: "hsl(var(--tier-1) / 0.4)",
    text: "hsl(var(--tier-1))",
    activeBg: "hsl(var(--tier-1) / 0.15)",
  },
  tier2: {
    bg: "hsl(var(--tier-2) / 0.05)",
    shadow: "hsl(var(--tier-2) / 0.25)",
    glow: "hsl(var(--tier-2) / 0.4)",
    text: "hsl(var(--tier-2))",
    activeBg: "hsl(var(--tier-2) / 0.15)",
  },
  tier3: {
    bg: "hsl(var(--primary) / 0.05)",
    shadow: "hsl(var(--primary) / 0.25)",
    glow: "hsl(var(--primary) / 0.4)",
    text: "hsl(var(--primary))",
    activeBg: "hsl(var(--primary) / 0.15)",
  },
};

const GlassTab = React.forwardRef<HTMLButtonElement, GlassTabProps>(
  ({ active, onClick, children, variant = "primary", className }, ref) => {
    const styles = variantStyles[variant];
    
    return (
      <div className="relative group">
        {/* Glow effect behind button */}
        <span
          className={cn(
            "absolute left-1/2 -translate-x-1/2 bottom-[-50%] w-[100px] h-[60px] rounded-full blur-[20px] transition-all duration-200 ease-out",
            active ? "opacity-60" : "opacity-0 group-hover:opacity-40"
          )}
          style={{ backgroundColor: styles.glow }}
        />
        
        <button
          ref={ref}
          onClick={onClick}
          className={cn(
            "relative px-6 py-2.5 rounded-xl border-none font-medium text-sm",
            "backdrop-blur-md transition-all duration-200 ease-out",
            "clip-path-[path('M_0_20_C_0_-2,_-2_0,_70_0_S_140_-2,_140_20,_142_40_70_40,_0_42,_0_20')]",
            active && "translate-y-[2px]",
            "hover:translate-y-[3px]",
            className
          )}
          style={{
            backgroundColor: active ? styles.activeBg : styles.bg,
            boxShadow: `0px -3px 15px 0px ${styles.shadow} inset`,
            color: styles.text,
            clipPath: "path('M 0 20 C 0 -2, -2 0, 70 0 S 140 -2, 140 20, 142 40 70 40, 0 42, 0 20')",
          }}
        >
          {children}
        </button>
      </div>
    );
  }
);
GlassTab.displayName = "GlassTab";

interface GlassTabsContainerProps {
  children: React.ReactNode;
  className?: string;
}

const GlassTabsContainer = React.forwardRef<HTMLDivElement, GlassTabsContainerProps>(
  ({ children, className }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "relative flex flex-wrap items-center justify-center gap-4 p-4 rounded-2xl",
          "bg-muted/20 backdrop-blur-sm border border-border/30",
          className
        )}
      >
        {/* Background glow */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary/5 via-transparent to-primary/5 pointer-events-none" />
        {children}
      </div>
    );
  }
);
GlassTabsContainer.displayName = "GlassTabsContainer";

export { GlassTab, GlassTabsContainer };
