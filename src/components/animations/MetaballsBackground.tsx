import { useRef, useEffect, useCallback } from "react";

interface MetaballConfig {
  x: number;
  y: number;
  baseRadius: number;
  radius: number;
  vx: number;
  vy: number;
  isStatic: boolean;
}

export function MetaballsBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0.5, y: 0.5, smoothX: 0.5, smoothY: 0.5 });
  const metaballsRef = useRef<MetaballConfig[]>([]);
  const animationRef = useRef<number>(0);

  // Configuration parameters
  const config = {
    // Metaball sizes
    topLeftSize: 0.8,
    bottomRightSize: 0.9,
    smallTopLeftSize: 0.3,
    smallBottomRightSize: 0.35,
    movingCount: 6,
    
    // Blend and movement
    blendSmoothness: 0.8,
    mouseProximityEffects: true,
    minMovementScale: 0.3,
    maxMovementScale: 1,
    mouseSmoothness: 0.1,
    
    // Radius
    minRadius: 0.08,
    maxRadius: 0.15,
    
    // Animation
    animationSpeed: 0.6,
    movementScale: 1.2,
    
    // Lighting
    ambientIntensity: 0.12,
    diffuseIntensity: 1.2,
    specularIntensity: 2.5,
    specularPower: 3,
    fresnelPower: 0.8,
    contrast: 1.6,
    cursorGlowIntensity: 1.2,
  };

  const initMetaballs = useCallback((width: number, height: number) => {
    const balls: MetaballConfig[] = [];
    
    // Static corner metaballs
    // Top left - large
    balls.push({
      x: width * 0.15,
      y: height * 0.15,
      baseRadius: Math.min(width, height) * config.topLeftSize * 0.3,
      radius: Math.min(width, height) * config.topLeftSize * 0.3,
      vx: 0,
      vy: 0,
      isStatic: true,
    });
    
    // Bottom right - large
    balls.push({
      x: width * 0.85,
      y: height * 0.85,
      baseRadius: Math.min(width, height) * config.bottomRightSize * 0.3,
      radius: Math.min(width, height) * config.bottomRightSize * 0.3,
      vx: 0,
      vy: 0,
      isStatic: true,
    });
    
    // Small top left
    balls.push({
      x: width * 0.25,
      y: height * 0.3,
      baseRadius: Math.min(width, height) * config.smallTopLeftSize * 0.3,
      radius: Math.min(width, height) * config.smallTopLeftSize * 0.3,
      vx: 0,
      vy: 0,
      isStatic: true,
    });
    
    // Small bottom right
    balls.push({
      x: width * 0.75,
      y: height * 0.7,
      baseRadius: Math.min(width, height) * config.smallBottomRightSize * 0.3,
      radius: Math.min(width, height) * config.smallBottomRightSize * 0.3,
      vx: 0,
      vy: 0,
      isStatic: true,
    });
    
    // Moving metaballs
    for (let i = 0; i < config.movingCount; i++) {
      const radiusScale = config.minRadius + Math.random() * (config.maxRadius - config.minRadius);
      balls.push({
        x: Math.random() * width,
        y: Math.random() * height,
        baseRadius: Math.min(width, height) * radiusScale,
        radius: Math.min(width, height) * radiusScale,
        vx: (Math.random() - 0.5) * config.animationSpeed * config.movementScale,
        vy: (Math.random() - 0.5) * config.animationSpeed * config.movementScale,
        isStatic: false,
      });
    }
    
    metaballsRef.current = balls;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resizeCanvas = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      initMetaballs(rect.width, rect.height);
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current.x = (e.clientX - rect.left) / rect.width;
      mouseRef.current.y = (e.clientY - rect.top) / rect.height;
    };

    canvas.addEventListener("mousemove", handleMouseMove);

    const animate = () => {
      const rect = canvas.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;

      // Smooth mouse position
      mouseRef.current.smoothX += (mouseRef.current.x - mouseRef.current.smoothX) * config.mouseSmoothness;
      mouseRef.current.smoothY += (mouseRef.current.y - mouseRef.current.smoothY) * config.mouseSmoothness;

      // Update moving metaballs
      metaballsRef.current.forEach((ball) => {
        if (!ball.isStatic) {
          ball.x += ball.vx;
          ball.y += ball.vy;

          // Bounce off edges
          if (ball.x < ball.radius || ball.x > width - ball.radius) {
            ball.vx *= -1;
            ball.x = Math.max(ball.radius, Math.min(width - ball.radius, ball.x));
          }
          if (ball.y < ball.radius || ball.y > height - ball.radius) {
            ball.vy *= -1;
            ball.y = Math.max(ball.radius, Math.min(height - ball.radius, ball.y));
          }

          // Mouse proximity effects
          if (config.mouseProximityEffects) {
            const mx = mouseRef.current.smoothX * width;
            const my = mouseRef.current.smoothY * height;
            const dx = mx - ball.x;
            const dy = my - ball.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const influence = Math.max(0, 1 - dist / (width * 0.3));
            
            ball.vx += (dx / dist) * influence * 0.5 * config.movementScale;
            ball.vy += (dy / dist) * influence * 0.5 * config.movementScale;
            
            // Dampen velocity
            const speed = Math.sqrt(ball.vx * ball.vx + ball.vy * ball.vy);
            const maxSpeed = config.maxMovementScale * 3;
            if (speed > maxSpeed) {
              ball.vx = (ball.vx / speed) * maxSpeed;
              ball.vy = (ball.vy / speed) * maxSpeed;
            }
          }
        }
      });

      // Create gradient for dark background with fog
      const gradient = ctx.createRadialGradient(
        width * 0.5, height * 0.5, 0,
        width * 0.5, height * 0.5, Math.max(width, height) * 0.8
      );
      gradient.addColorStop(0, "rgba(15, 10, 25, 1)");
      gradient.addColorStop(0.5, "rgba(8, 5, 15, 1)");
      gradient.addColorStop(1, "rgba(2, 1, 5, 1)");
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      // Render metaballs using pixel-based approach for smooth blending
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      const dpr = window.devicePixelRatio || 1;

      const lightPos = {
        x: mouseRef.current.smoothX * width,
        y: mouseRef.current.smoothY * height,
        z: 150,
      };

      for (let py = 0; py < canvas.height; py += 2) {
        for (let px = 0; px < canvas.width; px += 2) {
          const x = px / dpr;
          const y = py / dpr;
          
          let sum = 0;
          let weightedX = 0;
          let weightedY = 0;
          
          // Calculate metaball field
          metaballsRef.current.forEach((ball) => {
            const dx = x - ball.x;
            const dy = y - ball.y;
            const distSq = dx * dx + dy * dy;
            const influence = (ball.radius * ball.radius) / distSq;
            sum += influence;
            weightedX += (dx / Math.sqrt(distSq)) * influence;
            weightedY += (dy / Math.sqrt(distSq)) * influence;
          });

          // Apply blend smoothness threshold
          if (sum > config.blendSmoothness) {
            // Calculate normal for lighting
            const normalLen = Math.sqrt(weightedX * weightedX + weightedY * weightedY + 1);
            const nx = weightedX / normalLen;
            const ny = weightedY / normalLen;
            const nz = 1 / normalLen;

            // Light direction
            const lx = lightPos.x - x;
            const ly = lightPos.y - y;
            const lz = lightPos.z;
            const lightLen = Math.sqrt(lx * lx + ly * ly + lz * lz);
            const ldx = lx / lightLen;
            const ldy = ly / lightLen;
            const ldz = lz / lightLen;

            // Diffuse lighting
            const diffuse = Math.max(0, nx * ldx + ny * ldy + nz * ldz);
            
            // Specular lighting
            const rx = 2 * (nx * ldx + ny * ldy + nz * ldz) * nx - ldx;
            const ry = 2 * (nx * ldx + ny * ldy + nz * ldz) * ny - ldy;
            const rz = 2 * (nx * ldx + ny * ldy + nz * ldz) * nz - ldz;
            const specular = Math.pow(Math.max(0, rz), config.specularPower);
            
            // Fresnel effect
            const fresnel = Math.pow(1 - Math.abs(nz), config.fresnelPower);
            
            // Cursor glow
            const cursorDist = Math.sqrt(
              Math.pow(x - mouseRef.current.smoothX * width, 2) +
              Math.pow(y - mouseRef.current.smoothY * height, 2)
            );
            const cursorGlow = Math.exp(-cursorDist / (width * 0.15)) * config.cursorGlowIntensity;

            // Calculate final color - purple metallic theme
            const baseR = 155;
            const baseG = 135;
            const baseB = 245;
            
            let r = baseR * config.ambientIntensity +
                    baseR * diffuse * config.diffuseIntensity +
                    255 * specular * config.specularIntensity +
                    200 * fresnel * 0.3 +
                    180 * cursorGlow;
                    
            let g = baseG * config.ambientIntensity +
                    baseG * diffuse * config.diffuseIntensity +
                    255 * specular * config.specularIntensity +
                    150 * fresnel * 0.3 +
                    100 * cursorGlow;
                    
            let b = baseB * config.ambientIntensity +
                    baseB * diffuse * config.diffuseIntensity +
                    255 * specular * config.specularIntensity +
                    255 * fresnel * 0.5 +
                    255 * cursorGlow;

            // Apply contrast
            r = Math.pow(r / 255, 1 / config.contrast) * 255;
            g = Math.pow(g / 255, 1 / config.contrast) * 255;
            b = Math.pow(b / 255, 1 / config.contrast) * 255;

            // Edge softening based on sum value
            const alpha = Math.min(1, (sum - config.blendSmoothness) * 3);

            // Write to pixels (2x2 block for performance)
            for (let oy = 0; oy < 2 && py + oy < canvas.height; oy++) {
              for (let ox = 0; ox < 2 && px + ox < canvas.width; ox++) {
                const idx = ((py + oy) * canvas.width + (px + ox)) * 4;
                data[idx] = Math.min(255, data[idx] * (1 - alpha) + r * alpha);
                data[idx + 1] = Math.min(255, data[idx + 1] * (1 - alpha) + g * alpha);
                data[idx + 2] = Math.min(255, data[idx + 2] * (1 - alpha) + b * alpha);
              }
            }
          }
        }
      }

      ctx.putImageData(imageData, 0, 0);

      // Add fog overlay
      const fogGradient = ctx.createRadialGradient(
        width * 0.3, height * 0.3, 0,
        width * 0.5, height * 0.5, Math.max(width, height)
      );
      fogGradient.addColorStop(0, "rgba(139, 92, 246, 0.05)");
      fogGradient.addColorStop(0.5, "rgba(124, 58, 237, 0.02)");
      fogGradient.addColorStop(1, "rgba(0, 0, 0, 0)");
      
      ctx.fillStyle = fogGradient;
      ctx.fillRect(0, 0, width, height);

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      canvas.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animationRef.current);
    };
  }, [initMetaballs]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ background: "rgb(2, 1, 5)" }}
    />
  );
}
