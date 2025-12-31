import { useEffect, useRef } from "react";

interface Node {
  x: number;
  y: number;
  radius: number;
  pulsePhase: number;
  connections: number[];
}

export function BlockchainAnimation() {
  const svgRef = useRef<SVGSVGElement>(null);

  // Define nodes for the network
  const nodes: Node[] = [
    { x: 120, y: 100, radius: 8, pulsePhase: 0, connections: [1, 2] },
    { x: 220, y: 180, radius: 6, pulsePhase: 0.5, connections: [2, 3] },
    { x: 80, y: 250, radius: 7, pulsePhase: 1, connections: [3] },
    { x: 180, y: 320, radius: 9, pulsePhase: 1.5, connections: [4] },
    { x: 280, y: 280, radius: 5, pulsePhase: 2, connections: [5] },
    { x: 150, y: 420, radius: 8, pulsePhase: 2.5, connections: [6] },
    { x: 250, y: 380, radius: 6, pulsePhase: 3, connections: [0] },
    { x: 100, y: 350, radius: 7, pulsePhase: 3.5, connections: [1, 4] },
    { x: 200, y: 500, radius: 8, pulsePhase: 4, connections: [3, 5] },
    { x: 300, y: 450, radius: 6, pulsePhase: 4.5, connections: [2, 6] },
  ];

  return (
    <div className="relative w-full h-full min-h-[500px]">
      {/* Glowing background effect */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-primary/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-40 h-40 bg-tier-1/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-tier-2/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "2s" }} />
      </div>

      <svg
        ref={svgRef}
        viewBox="0 0 350 550"
        className="w-full h-full"
        style={{ filter: "drop-shadow(0 0 10px hsl(var(--primary) / 0.3))" }}
      >
        <defs>
          {/* Gradient for connections */}
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.6" />
            <stop offset="50%" stopColor="hsl(var(--tier-1))" stopOpacity="0.8" />
            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.6" />
          </linearGradient>

          {/* Glow filter */}
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Pulse animation gradient */}
          <radialGradient id="pulseGradient">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.8" />
            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Connection lines */}
        {nodes.map((node, i) =>
          node.connections.map((targetIdx) => (
            <g key={`line-${i}-${targetIdx}`}>
              <line
                x1={node.x}
                y1={node.y}
                x2={nodes[targetIdx].x}
                y2={nodes[targetIdx].y}
                stroke="url(#lineGradient)"
                strokeWidth="1.5"
                strokeLinecap="round"
                opacity="0.4"
              />
              {/* Animated data packet */}
              <circle r="3" fill="hsl(var(--primary))" filter="url(#glow)">
                <animateMotion
                  dur={`${3 + i * 0.5}s`}
                  repeatCount="indefinite"
                  path={`M${node.x},${node.y} L${nodes[targetIdx].x},${nodes[targetIdx].y}`}
                />
                <animate
                  attributeName="opacity"
                  values="0;1;1;0"
                  dur={`${3 + i * 0.5}s`}
                  repeatCount="indefinite"
                />
              </circle>
            </g>
          ))
        )}

        {/* Node circles */}
        {nodes.map((node, i) => (
          <g key={`node-${i}`}>
            {/* Pulse ring */}
            <circle
              cx={node.x}
              cy={node.y}
              r={node.radius * 2}
              fill="none"
              stroke="hsl(var(--primary))"
              strokeWidth="1"
              opacity="0"
            >
              <animate
                attributeName="r"
                values={`${node.radius};${node.radius * 3}`}
                dur="2s"
                begin={`${node.pulsePhase}s`}
                repeatCount="indefinite"
              />
              <animate
                attributeName="opacity"
                values="0.6;0"
                dur="2s"
                begin={`${node.pulsePhase}s`}
                repeatCount="indefinite"
              />
            </circle>

            {/* Outer glow */}
            <circle
              cx={node.x}
              cy={node.y}
              r={node.radius + 4}
              fill="hsl(var(--primary))"
              opacity="0.2"
              filter="url(#glow)"
            />

            {/* Main node */}
            <circle
              cx={node.x}
              cy={node.y}
              r={node.radius}
              fill="hsl(var(--background))"
              stroke="hsl(var(--primary))"
              strokeWidth="2"
              filter="url(#glow)"
            />

            {/* Inner highlight */}
            <circle
              cx={node.x - node.radius * 0.3}
              cy={node.y - node.radius * 0.3}
              r={node.radius * 0.3}
              fill="hsl(var(--primary))"
              opacity="0.5"
            />
          </g>
        ))}

        {/* Floating particles */}
        {[...Array(8)].map((_, i) => (
          <circle
            key={`particle-${i}`}
            r="2"
            fill="hsl(var(--tier-1))"
            opacity="0.6"
          >
            <animateMotion
              dur={`${8 + i * 2}s`}
              repeatCount="indefinite"
              path={`M${50 + i * 30},${100 + i * 50} Q${150 + i * 20},${250} ${100 + i * 25},${450 - i * 30} T${200},${300}`}
            />
            <animate
              attributeName="opacity"
              values="0;0.6;0.6;0"
              dur={`${8 + i * 2}s`}
              repeatCount="indefinite"
            />
          </circle>
        ))}

        {/* Hexagonal decorations */}
        <g opacity="0.3">
          <polygon
            points="50,150 65,140 65,120 50,110 35,120 35,140"
            fill="none"
            stroke="hsl(var(--tier-2))"
            strokeWidth="1"
          >
            <animateTransform
              attributeName="transform"
              type="rotate"
              from="0 50 130"
              to="360 50 130"
              dur="20s"
              repeatCount="indefinite"
            />
          </polygon>
          <polygon
            points="290,400 305,390 305,370 290,360 275,370 275,390"
            fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth="1"
          >
            <animateTransform
              attributeName="transform"
              type="rotate"
              from="360 290 380"
              to="0 290 380"
              dur="15s"
              repeatCount="indefinite"
            />
          </polygon>
        </g>
      </svg>
    </div>
  );
}
