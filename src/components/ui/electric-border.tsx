import * as React from "react";
import { cn } from "@/lib/utils";

interface ElectricBorderCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "primary" | "tier1" | "tier2" | "tier3";
  children: React.ReactNode;
}

const variantColors = {
  primary: {
    glowColor: "187 100% 50%",
  },
  tier1: {
    glowColor: "51 100% 50%",
  },
  tier2: {
    glowColor: "20 100% 60%",
  },
  tier3: {
    glowColor: "187 100% 50%",
  },
};

const round = (n: number, d = 0) => Math.round(n * 10 ** d) / 10 ** d;

const pointerPositionRelativeToElement = (
  element: HTMLElement,
  e: MouseEvent | TouchEvent
) => {
  const rect = element.getBoundingClientRect();
  let clientX = 0;
  let clientY = 0;

  if ("touches" in e && e.touches.length > 0) {
    clientX = e.touches[0].clientX;
    clientY = e.touches[0].clientY;
  } else if ("clientX" in e) {
    clientX = e.clientX;
    clientY = e.clientY;
  }

  return {
    pixels: [clientX - rect.left, clientY - rect.top] as [number, number],
    percent: [
      ((clientX - rect.left) / rect.width) * 100,
      ((clientY - rect.top) / rect.height) * 100,
    ] as [number, number],
  };
};

const distanceFromCenter = (
  element: HTMLElement,
  x: number,
  y: number
): [number, number] => {
  const rect = element.getBoundingClientRect();
  const centerX = rect.width / 2;
  const centerY = rect.height / 2;
  return [x - centerX, y - centerY];
};

const closenessToEdge = (
  element: HTMLElement,
  x: number,
  y: number
): number => {
  const rect = element.getBoundingClientRect();
  const w = rect.width;
  const h = rect.height;
  const edgeX = Math.min(x, w - x);
  const edgeY = Math.min(y, h - y);
  const minEdge = Math.min(edgeX, edgeY);
  const maxEdge = Math.max(w, h);
  return 1 - minEdge / maxEdge;
};

const angleFromPointerEvent = (
  element: HTMLElement,
  dx: number,
  dy: number
): number => {
  return (Math.atan2(dy, dx) * 180) / Math.PI;
};

const ElectricBorderCard = React.forwardRef<HTMLDivElement, ElectricBorderCardProps>(
  ({ variant = "primary", className, children, ...props }, ref) => {
    const cardRef = React.useRef<HTMLDivElement>(null);
    const glowRef = React.useRef<HTMLSpanElement>(null);
    const colors = variantColors[variant];
    const [pointerX, setPointerX] = React.useState(50);
    const [pointerY, setPointerY] = React.useState(50);
    const [pointerAngle, setPointerAngle] = React.useState(0);
    const [pointerDistance, setPointerDistance] = React.useState(0);

    React.useImperativeHandle(ref, () => cardRef.current as HTMLDivElement);

    React.useEffect(() => {
      const card = cardRef.current;
      if (!card) return;

      const cardUpdate = (e: MouseEvent | TouchEvent) => {
        const position = pointerPositionRelativeToElement(card, e);
        const [px, py] = position.pixels;
        const [perx, pery] = position.percent;
        const [dx, dy] = distanceFromCenter(card, px, py);
        const edge = closenessToEdge(card, px, py);
        const angle = angleFromPointerEvent(card, dx, dy);

        setPointerX(round(perx));
        setPointerY(round(pery));
        setPointerAngle(round(angle));
        setPointerDistance(round(edge * 100));

        card.classList.remove("animating");
      };

      const handlePointerMove = (e: MouseEvent | TouchEvent) => {
        cardUpdate(e);
      };

      const handlePointerLeave = () => {
        card.classList.add("animating");
      };

      card.addEventListener("pointermove", handlePointerMove as EventListener);
      card.addEventListener("touchmove", handlePointerMove as EventListener, { passive: true });
      card.addEventListener("pointerleave", handlePointerLeave);

      return () => {
        card.removeEventListener("pointermove", handlePointerMove as EventListener);
        card.removeEventListener("touchmove", handlePointerMove as EventListener);
        card.removeEventListener("pointerleave", handlePointerLeave);
      };
    }, []);

    return (
      <div
        ref={cardRef}
        className={cn("card relative rounded-xl", className)}
        style={{
          "--glow-color": `hsl(${colors.glowColor})`,
          "--pointer-x": `${pointerX}%`,
          "--pointer-y": `${pointerY}%`,
          "--pointer-angle": `${pointerAngle}deg`,
          "--pointer-d": `${pointerDistance}`,
        } as React.CSSProperties}
        {...props}
      >
        <span
          ref={glowRef}
          className="glow absolute inset-0 rounded-xl pointer-events-none"
        />

        <div className="inner relative bg-card/40 backdrop-blur-xl rounded-xl overflow-hidden border border-white/10 z-10">
          {children}
        </div>

        <style>{`
          .card {
            --glow-sens: 30;
            --card-bg: linear-gradient(8deg, hsl(var(--card)) 75%, color-mix(in hsl, hsl(var(--card)), white 2.5%) 75.5%);
            --blend: soft-light;
            --glow-blend: plus-lighter;
            --glow-boost: 0%;
          }

          .card .glow {
            background: 
              radial-gradient(
                circle at var(--pointer-x, 50%) var(--pointer-y, 50%),
                transparent calc(var(--pointer-d, 0) * 1%),
                hsl(var(--glow-color) / calc((var(--pointer-d, 0) + var(--glow-boost, 0)) / var(--glow-sens, 30))) calc(var(--pointer-d, 0) * 1% + 1px),
                transparent calc(var(--pointer-d, 0) * 1% + 2px)
              ),
              conic-gradient(
                from var(--pointer-angle, 0deg) at var(--pointer-x, 50%) var(--pointer-y, 50%),
                hsl(var(--glow-color) / 0.8) 0deg,
                hsl(var(--glow-color) / 0.4) 90deg,
                hsl(var(--glow-color) / 0.2) 180deg,
                hsl(var(--glow-color) / 0.4) 270deg,
                hsl(var(--glow-color) / 0.8) 360deg
              );
            mask: 
              radial-gradient(
                circle at var(--pointer-x, 50%) var(--pointer-y, 50%),
                transparent calc(var(--pointer-d, 0) * 1%),
                black calc(var(--pointer-d, 0) * 1% + 1px)
              ),
              conic-gradient(
                from var(--pointer-angle, 0deg) at var(--pointer-x, 50%) var(--pointer-y, 50%),
                transparent 0deg,
                black 90deg,
                transparent 180deg,
                black 270deg,
                transparent 360deg
              );
            mask-composite: intersect;
            -webkit-mask-composite: source-in;
            mix-blend-mode: var(--glow-blend);
            opacity: calc((var(--pointer-d, 0) + var(--glow-boost, 0)) / 100);
            transition: opacity 0.3s ease;
            z-index: 1;
          }

          .card.animating .glow {
            opacity: 0;
          }

          .card .inner {
            background: var(--card-bg);
            mix-blend-mode: var(--blend);
            position: relative;
            z-index: 2;
          }
        `}</style>
      </div>
    );
  }
);
ElectricBorderCard.displayName = "ElectricBorderCard";

export { ElectricBorderCard };
