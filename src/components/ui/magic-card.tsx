import * as React from "react";
import { cn } from "@/lib/utils";

interface MagicCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "primary" | "tier1" | "tier2" | "tier3";
  children: React.ReactNode;
}

const variantColors = {
  primary: {
    gradient: "187 100% 50%",
  },
  tier1: {
    gradient: "51 100% 50%",
  },
  tier2: {
    gradient: "20 100% 60%",
  },
  tier3: {
    gradient: "187 100% 50%",
  },
};

export const MagicCard = React.forwardRef<HTMLDivElement, MagicCardProps>(
  ({ variant = "primary", className, children, ...props }, ref) => {
    const cardRef = React.useRef<HTMLDivElement>(null);
    const [mousePosition, setMousePosition] = React.useState({ x: 0, y: 0 });
    const [isHovered, setIsHovered] = React.useState(false);
    const colors = variantColors[variant];

    React.useImperativeHandle(ref, () => cardRef.current as HTMLDivElement);

    React.useEffect(() => {
      const card = cardRef.current;
      if (!card) return;

      const updatePosition = (clientX: number, clientY: number) => {
        const rect = card.getBoundingClientRect();
        const x = clientX - rect.left;
        const y = clientY - rect.top;
        setMousePosition({ x, y });
        setIsHovered(true);
      };

      const handleMouseEnter = (e: MouseEvent) => {
        setIsHovered(true);
        // Initialize mouse position on enter
        updatePosition(e.clientX, e.clientY);
      };

      const handleMouseMove = (e: MouseEvent) => {
        updatePosition(e.clientX, e.clientY);
      };

      const handleTouchStart = (e: TouchEvent) => {
        if (e.touches.length > 0) {
          updatePosition(e.touches[0].clientX, e.touches[0].clientY);
        }
      };

      const handleTouchMove = (e: TouchEvent) => {
        if (e.touches.length > 0) {
          updatePosition(e.touches[0].clientX, e.touches[0].clientY);
        }
      };

      const handleMouseLeave = () => {
        setIsHovered(false);
      };

      const handleTouchEnd = () => {
        setIsHovered(false);
      };

      // Add event listeners for both mouse and touch
      card.addEventListener("mouseenter", handleMouseEnter);
      card.addEventListener("mousemove", handleMouseMove);
      card.addEventListener("mouseleave", handleMouseLeave);
      card.addEventListener("touchstart", handleTouchStart, { passive: true });
      card.addEventListener("touchmove", handleTouchMove, { passive: true });
      card.addEventListener("touchend", handleTouchEnd);
      card.addEventListener("touchcancel", handleTouchEnd);

      return () => {
        card.removeEventListener("mouseenter", handleMouseEnter);
        card.removeEventListener("mousemove", handleMouseMove);
        card.removeEventListener("mouseleave", handleMouseLeave);
        card.removeEventListener("touchstart", handleTouchStart);
        card.removeEventListener("touchmove", handleTouchMove);
        card.removeEventListener("touchend", handleTouchEnd);
        card.removeEventListener("touchcancel", handleTouchEnd);
      };
    }, []);

    return (
      <div
        ref={cardRef}
        className={cn("magic-card relative rounded-xl overflow-hidden", isHovered && "touch-active", className)}
        style={{
          "--mouse-x": `${mousePosition.x}px`,
          "--mouse-y": `${mousePosition.y}px`,
          "--gradient-color": `hsl(${colors.gradient})`,
        } as React.CSSProperties}
        {...props}
      >
        <div className="magic-card-gradient" />
        <div className="magic-card-content relative bg-card/30 backdrop-blur-2xl rounded-xl overflow-hidden border border-white/20 shadow-lg z-10">
          {children}
        </div>

        <style>{`
          .magic-card {
            position: relative;
            cursor: pointer;
            -webkit-tap-highlight-color: transparent;
            touch-action: manipulation;
          }

          .magic-card-gradient {
            position: absolute;
            inset: -2px;
            border-radius: inherit;
            padding: 2px;
            background: linear-gradient(
              135deg,
              hsl(var(--gradient-color) / 0.4),
              hsl(var(--gradient-color) / 0.1),
              transparent,
              hsl(var(--gradient-color) / 0.1),
              hsl(var(--gradient-color) / 0.4)
            );
            -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
            -webkit-mask-composite: xor;
            mask-composite: exclude;
            opacity: 0;
            transition: opacity 0.3s ease;
            pointer-events: none;
            z-index: 1;
          }

          .magic-card:hover .magic-card-gradient,
          .magic-card:focus-within .magic-card-gradient,
          .magic-card.touch-active .magic-card-gradient {
            opacity: 1 !important;
          }

          .magic-card-gradient::before {
            content: "";
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            border-radius: inherit;
            background: radial-gradient(
              600px circle at var(--mouse-x, 50%) var(--mouse-y, 50%),
              hsl(var(--gradient-color) / 0.6),
              transparent 40%
            );
            opacity: 0;
            transition: opacity 0.3s ease;
          }

          .magic-card:hover .magic-card-gradient::before,
          .magic-card:focus-within .magic-card-gradient::before,
          .magic-card.touch-active .magic-card-gradient::before {
            opacity: 1 !important;
          }

          .magic-card-content {
            position: relative;
            z-index: 2;
            backdrop-filter: blur(24px) !important;
            -webkit-backdrop-filter: blur(24px) !important;
            box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37) !important;
          }

          .magic-card::before {
            content: "";
            position: absolute;
            inset: -2px;
            border-radius: inherit;
            background: linear-gradient(
              45deg,
              hsl(var(--gradient-color) / 0.3),
              transparent,
              hsl(var(--gradient-color) / 0.3)
            );
            background-size: 200% 200%;
            animation: shimmer 3s ease infinite;
            opacity: 0;
            pointer-events: none;
            z-index: 0;
          }

          .magic-card:hover::before,
          .magic-card:focus-within::before,
          .magic-card.touch-active::before {
            opacity: 0.5 !important;
          }

          @keyframes shimmer {
            0% {
              background-position: 0% 50%;
            }
            50% {
              background-position: 100% 50%;
            }
            100% {
              background-position: 0% 50%;
            }
          }
        `}</style>
      </div>
    );
  }
);

MagicCard.displayName = "MagicCard";

