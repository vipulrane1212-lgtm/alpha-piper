import { useEffect, useRef } from "react";

export function FireAnimation() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas size
    const resize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    resize();
    window.addEventListener('resize', resize);
    
    // Particle system for fire
    interface Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      life: number;
      maxLife: number;
      size: number;
    }
    
    const particles: Particle[] = [];
    const width = canvas.offsetWidth;
    const height = canvas.offsetHeight;
    
    const createParticle = () => {
      return {
        x: width / 2 + (Math.random() - 0.5) * 60,
        y: height - 10,
        vx: (Math.random() - 0.5) * 2,
        vy: -Math.random() * 3 - 2,
        life: 1,
        maxLife: 0.8 + Math.random() * 0.4,
        size: 8 + Math.random() * 12,
      };
    };
    
    let animationId: number;
    
    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      
      // Add new particles
      if (particles.length < 50) {
        particles.push(createParticle());
        particles.push(createParticle());
      }
      
      // Update and draw particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        
        // Update
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.015;
        p.vx += (Math.random() - 0.5) * 0.3;
        p.size *= 0.98;
        
        if (p.life <= 0 || p.size < 1) {
          particles.splice(i, 1);
          continue;
        }
        
        // Draw with Solana blue color gradient
        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
        const alpha = p.life * 0.8;
        
        // Solana cyan/blue fire colors
        gradient.addColorStop(0, `rgba(0, 217, 255, ${alpha})`); // Cyan core
        gradient.addColorStop(0.3, `rgba(20, 184, 235, ${alpha * 0.8})`);
        gradient.addColorStop(0.6, `rgba(100, 100, 255, ${alpha * 0.5})`); // Purple-blue mid
        gradient.addColorStop(1, `rgba(0, 100, 200, 0)`); // Fade to transparent
        
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
      }
      
      // Add glow effect at base
      const baseGlow = ctx.createRadialGradient(width / 2, height, 0, width / 2, height - 30, 60);
      baseGlow.addColorStop(0, 'rgba(0, 217, 255, 0.4)');
      baseGlow.addColorStop(0.5, 'rgba(20, 100, 200, 0.2)');
      baseGlow.addColorStop(1, 'rgba(0, 100, 200, 0)');
      
      ctx.beginPath();
      ctx.arc(width / 2, height, 60, 0, Math.PI * 2);
      ctx.fillStyle = baseGlow;
      ctx.fill();
      
      animationId = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationId);
    };
  }, []);
  
  return (
    <canvas 
      ref={canvasRef}
      className="w-full h-32 pointer-events-none"
      style={{ filter: 'blur(1px)' }}
    />
  );
}