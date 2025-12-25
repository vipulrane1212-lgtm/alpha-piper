import * as React from "react";
import { cn } from "@/lib/utils";

interface GlassTabProps {
  active?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
  variant?: "primary" | "tier1" | "tier2" | "tier3";
  className?: string;
  size?: "sm" | "md" | "lg";
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

const sizeStyles = {
  sm: "px-4 py-1.5 text-xs",
  md: "px-6 py-2.5 text-sm",
  lg: "px-8 py-3.5 text-base",
};

const GlassTab = React.forwardRef<HTMLButtonElement, GlassTabProps>(
  ({ active, onClick, children, variant = "primary", className, size = "md" }, ref) => {
    const styles = variantStyles[variant];
    
    return (
      <div className="relative group">
        {/* Glow effect behind button */}
        <span
          className={cn(
            "absolute left-1/2 -translate-x-1/2 bottom-[-50%] w-[100px] h-[60px] rounded-full blur-[20px] transition-all duration-200 ease-out pointer-events-none",
            active ? "opacity-60" : "opacity-0 group-hover:opacity-40"
          )}
          style={{ backgroundColor: styles.glow }}
        />
        
        <button
          ref={ref}
          onClick={onClick}
          className={cn(
            "relative rounded-xl border-none font-medium",
            "backdrop-blur-md transition-all duration-200 ease-out",
            active && "translate-y-[2px]",
            "hover:translate-y-[3px]",
            sizeStyles[size],
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

// Glassmorphism Button for CTAs
interface GlassButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "tier1" | "tier2";
  size?: "sm" | "md" | "lg";
  asChild?: boolean;
  children: React.ReactNode;
}

const glassButtonVariants = {
  primary: {
    bg: "hsl(var(--primary) / 0.1)",
    activeBg: "hsl(var(--primary) / 0.2)",
    shadow: "hsl(var(--primary) / 0.35)",
    glow: "hsl(var(--primary) / 0.5)",
    text: "hsl(var(--primary-foreground))",
    border: "hsl(var(--primary) / 0.3)",
  },
  secondary: {
    bg: "hsl(var(--foreground) / 0.05)",
    activeBg: "hsl(var(--foreground) / 0.1)",
    shadow: "hsl(var(--foreground) / 0.15)",
    glow: "hsl(var(--foreground) / 0.2)",
    text: "hsl(var(--foreground))",
    border: "hsl(var(--border))",
  },
  tier1: {
    bg: "hsl(var(--tier-1) / 0.1)",
    activeBg: "hsl(var(--tier-1) / 0.2)",
    shadow: "hsl(var(--tier-1) / 0.35)",
    glow: "hsl(var(--tier-1) / 0.5)",
    text: "hsl(var(--tier-1))",
    border: "hsl(var(--tier-1) / 0.3)",
  },
  tier2: {
    bg: "hsl(var(--tier-2) / 0.1)",
    activeBg: "hsl(var(--tier-2) / 0.2)",
    shadow: "hsl(var(--tier-2) / 0.35)",
    glow: "hsl(var(--tier-2) / 0.5)",
    text: "hsl(var(--tier-2))",
    border: "hsl(var(--tier-2) / 0.3)",
  },
};

const GlassButton = React.forwardRef<HTMLButtonElement, GlassButtonProps>(
  ({ variant = "primary", size = "md", className, children, ...props }, ref) => {
    const styles = glassButtonVariants[variant];
    
    return (
      <div className="relative group inline-block">
        {/* Glow effect */}
        <span
          className="absolute left-1/2 -translate-x-1/2 bottom-[-40%] w-[120px] h-[50px] rounded-full blur-[25px] transition-all duration-300 ease-out opacity-0 group-hover:opacity-70 pointer-events-none"
          style={{ backgroundColor: styles.glow }}
        />
        
        <button
          ref={ref}
          className={cn(
            "relative rounded-xl font-semibold",
            "backdrop-blur-md transition-all duration-300 ease-out",
            "hover:translate-y-[2px] active:translate-y-[4px]",
            "border",
            sizeStyles[size],
            className
          )}
          style={{
            backgroundColor: styles.bg,
            boxShadow: `0px -4px 20px 0px ${styles.shadow} inset, 0 4px 20px -5px ${styles.glow}`,
            color: styles.text,
            borderColor: styles.border,
          }}
          {...props}
        >
          {children}
        </button>
      </div>
    );
  }
);
GlassButton.displayName = "GlassButton";

// Glassmorphism Card
interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "primary" | "tier1" | "tier2" | "tier3";
  hover?: boolean;
}

const glassCardVariants = {
  default: {
    bg: "hsl(var(--card) / 0.6)",
    border: "hsl(var(--border) / 0.5)",
    glow: "transparent",
  },
  primary: {
    bg: "hsl(var(--primary) / 0.05)",
    border: "hsl(var(--primary) / 0.2)",
    glow: "hsl(var(--primary) / 0.1)",
  },
  tier1: {
    bg: "hsl(var(--tier-1) / 0.05)",
    border: "hsl(var(--tier-1) / 0.2)",
    glow: "hsl(var(--tier-1) / 0.1)",
  },
  tier2: {
    bg: "hsl(var(--tier-2) / 0.05)",
    border: "hsl(var(--tier-2) / 0.2)",
    glow: "hsl(var(--tier-2) / 0.1)",
  },
  tier3: {
    bg: "hsl(var(--primary) / 0.05)",
    border: "hsl(var(--primary) / 0.2)",
    glow: "hsl(var(--primary) / 0.1)",
  },
};

const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  ({ variant = "default", hover = true, className, children, ...props }, ref) => {
    const styles = glassCardVariants[variant];
    
    return (
      <div
        ref={ref}
        className={cn(
          "relative rounded-xl backdrop-blur-md border transition-all duration-300",
          hover && "hover:scale-[1.02] hover:-translate-y-1",
          className
        )}
        style={{
          backgroundColor: styles.bg,
          borderColor: styles.border,
          boxShadow: `0 8px 32px -8px ${styles.glow}`,
        }}
        {...props}
      >
        {children}
      </div>
    );
  }
);
GlassCard.displayName = "GlassCard";

// Glassmorphism Nav Link
interface GlassNavLinkProps {
  active?: boolean;
  children: React.ReactNode;
  className?: string;
}

const GlassNavLink = React.forwardRef<HTMLSpanElement, GlassNavLinkProps>(
  ({ active, children, className }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(
          "relative px-3 py-1.5 rounded-lg transition-all duration-200",
          active 
            ? "bg-primary/10 text-primary font-medium" 
            : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
          className
        )}
        style={active ? {
          boxShadow: "0px -2px 10px 0px hsl(var(--primary) / 0.2) inset",
        } : undefined}
      >
        {children}
      </span>
    );
  }
);
GlassNavLink.displayName = "GlassNavLink";

export { GlassTab, GlassTabsContainer, GlassButton, GlassCard, GlassNavLink };
