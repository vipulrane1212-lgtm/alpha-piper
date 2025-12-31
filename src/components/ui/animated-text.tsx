import React from "react";
import { cn } from "@/lib/utils";

interface AnimatedTextProps {
  children: React.ReactNode;
  className?: string;
  as?: keyof JSX.IntrinsicElements;
}

export function AnimatedText({ 
  children, 
  className,
  as: Component = "span" 
}: AnimatedTextProps) {
  return (
    <Component 
      className={cn(
        "animated-text-fill relative inline-block",
        className
      )}
    >
      {children}
      <style>{`
        .animated-text-fill {
          background: linear-gradient(
            90deg,
            hsl(var(--primary)) 0%,
            hsl(var(--tier-1)) 25%,
            hsl(var(--primary)) 50%,
            hsl(var(--tier-1)) 75%,
            hsl(var(--primary)) 100%
          );
          background-size: 200% 100%;
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: shimmer 3s ease-in-out infinite;
        }
        
        @keyframes shimmer {
          0% {
            background-position: 200% center;
          }
          100% {
            background-position: -200% center;
          }
        }
      `}</style>
    </Component>
  );
}

interface AnimatedHeadingProps {
  children: React.ReactNode;
  className?: string;
  level?: 1 | 2 | 3 | 4 | 5 | 6;
}

export function AnimatedHeading({ 
  children, 
  className,
  level = 2 
}: AnimatedHeadingProps) {
  const Tag = `h${level}` as keyof JSX.IntrinsicElements;
  
  return (
    <Tag className={cn("font-bold", className)}>
      <span className="animated-heading-text">
        {children}
      </span>
      <style>{`
        .animated-heading-text {
          background: linear-gradient(
            90deg,
            hsl(var(--foreground)) 0%,
            hsl(var(--primary)) 20%,
            hsl(var(--tier-1)) 40%,
            hsl(var(--primary)) 60%,
            hsl(var(--foreground)) 80%,
            hsl(var(--primary)) 100%
          );
          background-size: 300% 100%;
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: textShimmer 4s ease-in-out infinite;
          filter: drop-shadow(0 0 8px hsl(var(--primary) / 0.3)) drop-shadow(0 0 16px hsl(var(--tier-1) / 0.2));
          position: relative;
          z-index: 10;
        }
        
        @keyframes textShimmer {
          0%, 100% {
            background-position: 0% center;
          }
          50% {
            background-position: 100% center;
          }
        }
      `}</style>
    </Tag>
  );
}
