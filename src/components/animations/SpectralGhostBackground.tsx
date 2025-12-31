import { useRef, useEffect } from "react";
import * as THREE from "three";

export function SpectralGhostBackground() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseRef = useRef(new THREE.Vector2(0.5, 0.5));
  const targetMouseRef = useRef(new THREE.Vector2(0.5, 0.5));

  useEffect(() => {
    if (!containerRef.current) return;

    let scene: THREE.Scene;
    let camera: THREE.OrthographicCamera;
    let renderer: THREE.WebGLRenderer;
    let clock: THREE.Clock;
    let mesh: THREE.Mesh;
    let animationId: number;

    const uniforms = {
      iTime: { value: 0.0 },
      iResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
      iMouse: { value: new THREE.Vector4(0.5, 0.5, 0, 0) },
    };

    const vertexShader = `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = vec4(position, 1.0);
      }
    `;

    // Spectral ghost shader - ethereal flowing wisps
    const fragmentShader = `
      uniform float iTime;
      uniform vec2 iResolution;
      uniform vec4 iMouse;
      varying vec2 vUv;

      #define PI 3.14159265359

      // Simplex noise functions
      vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
      vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
      vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
      vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

      float snoise(vec3 v) {
        const vec2 C = vec2(1.0/6.0, 1.0/3.0);
        const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
        
        vec3 i = floor(v + dot(v, C.yyy));
        vec3 x0 = v - i + dot(i, C.xxx);
        
        vec3 g = step(x0.yzx, x0.xyz);
        vec3 l = 1.0 - g;
        vec3 i1 = min(g.xyz, l.zxy);
        vec3 i2 = max(g.xyz, l.zxy);
        
        vec3 x1 = x0 - i1 + C.xxx;
        vec3 x2 = x0 - i2 + C.yyy;
        vec3 x3 = x0 - D.yyy;
        
        i = mod289(i);
        vec4 p = permute(permute(permute(
                  i.z + vec4(0.0, i1.z, i2.z, 1.0))
                + i.y + vec4(0.0, i1.y, i2.y, 1.0))
                + i.x + vec4(0.0, i1.x, i2.x, 1.0));
        
        float n_ = 0.142857142857;
        vec3 ns = n_ * D.wyz - D.xzx;
        
        vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
        
        vec4 x_ = floor(j * ns.z);
        vec4 y_ = floor(j - 7.0 * x_);
        
        vec4 x = x_ * ns.x + ns.yyyy;
        vec4 y = y_ * ns.x + ns.yyyy;
        vec4 h = 1.0 - abs(x) - abs(y);
        
        vec4 b0 = vec4(x.xy, y.xy);
        vec4 b1 = vec4(x.zw, y.zw);
        
        vec4 s0 = floor(b0) * 2.0 + 1.0;
        vec4 s1 = floor(b1) * 2.0 + 1.0;
        vec4 sh = -step(h, vec4(0.0));
        
        vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
        vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
        
        vec3 p0 = vec3(a0.xy, h.x);
        vec3 p1 = vec3(a0.zw, h.y);
        vec3 p2 = vec3(a1.xy, h.z);
        vec3 p3 = vec3(a1.zw, h.w);
        
        vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
        p0 *= norm.x;
        p1 *= norm.y;
        p2 *= norm.z;
        p3 *= norm.w;
        
        vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
        m = m * m;
        return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
      }

      // Fractal Brownian Motion
      float fbm(vec3 p) {
        float value = 0.0;
        float amplitude = 0.5;
        float frequency = 1.0;
        for(int i = 0; i < 5; i++) {
          value += amplitude * snoise(p * frequency);
          amplitude *= 0.5;
          frequency *= 2.0;
        }
        return value;
      }

      // Ghost wisp function
      float ghostWisp(vec2 uv, float time, float seed) {
        vec3 p = vec3(uv * 2.0, time * 0.1 + seed);
        float noise = fbm(p);
        
        // Create flowing tendrils
        float tendril = sin(uv.y * 8.0 + time * 0.3 + noise * 3.0) * 0.5 + 0.5;
        tendril *= sin(uv.x * 6.0 + time * 0.2 + noise * 2.0) * 0.5 + 0.5;
        
        return tendril * (noise * 0.5 + 0.5);
      }

      // Spectral glow
      float spectralGlow(vec2 uv, vec2 center, float radius, float softness) {
        float dist = length(uv - center);
        return smoothstep(radius + softness, radius - softness, dist);
      }

      void main() {
        vec2 uv = gl_FragCoord.xy / iResolution.xy;
        vec2 uvCentered = uv * 2.0 - 1.0;
        uvCentered.x *= iResolution.x / iResolution.y;
        
        float t = iTime * 0.15;
        
        // Mouse influence
        vec2 mouse = iMouse.xy * 2.0 - 1.0;
        mouse.x *= iResolution.x / iResolution.y;
        float mouseInfluence = 1.0 / (length(uvCentered - mouse) + 0.5);
        
        // Base dark background with subtle gradient
        vec3 bgColor = mix(
          vec3(0.02, 0.01, 0.05),
          vec3(0.05, 0.02, 0.08),
          uv.y
        );
        
        vec3 col = bgColor;
        
        // Multiple ghost wisps with different colors - INTENSIFIED
        // Wisp 1 - Cyan/Teal spectral
        float wisp1 = ghostWisp(uvCentered + vec2(sin(t * 0.7) * 0.3, cos(t * 0.5) * 0.2), t, 0.0);
        vec3 color1 = vec3(0.3, 0.9, 1.0);
        col += color1 * wisp1 * 0.35;
        
        // Wisp 2 - Purple/Violet
        float wisp2 = ghostWisp(uvCentered + vec2(cos(t * 0.6) * 0.25, sin(t * 0.8) * 0.3), t * 1.1, 1.234);
        vec3 color2 = vec3(0.7, 0.3, 1.0);
        col += color2 * wisp2 * 0.3;
        
        // Wisp 3 - Blue
        float wisp3 = ghostWisp(uvCentered + vec2(sin(t * 0.4) * 0.2, cos(t * 0.6) * 0.25), t * 0.9, 2.567);
        vec3 color3 = vec3(0.4, 0.6, 1.0);
        col += color3 * wisp3 * 0.25;
        
        // Wisp 4 - Additional intense wisp
        float wisp4 = ghostWisp(uvCentered + vec2(cos(t * 0.5) * 0.4, sin(t * 0.7) * 0.35), t * 1.3, 3.789);
        vec3 color4 = vec3(0.5, 0.8, 0.95);
        col += color4 * wisp4 * 0.2;
        
        // Wisp 5 - Deep purple wisp
        float wisp5 = ghostWisp(uvCentered + vec2(sin(t * 0.9) * 0.35, cos(t * 0.4) * 0.3), t * 0.8, 4.321);
        vec3 color5 = vec3(0.8, 0.2, 0.9);
        col += color5 * wisp5 * 0.18;
        
        // Ethereal fog layer - more intense
        float fog = fbm(vec3(uvCentered * 1.5, t * 0.3));
        fog = smoothstep(-0.2, 0.8, fog);
        vec3 fogColor = vec3(0.2, 0.25, 0.45);
        col += fogColor * fog * 0.15;
        
        // Many more floating particles / dust - increased from 4 to 12
        for(float i = 0.0; i < 12.0; i++) {
          vec2 particlePos = vec2(
            sin(t * 0.3 + i * 1.618) * 1.2,
            cos(t * 0.25 + i * 2.1) * 0.8 + sin(t * 0.15 + i) * 0.3
          );
          float particleSize = 0.015 + sin(t * 0.8 + i * 0.5) * 0.008;
          float particle = spectralGlow(uvCentered, particlePos, particleSize, 0.12);
          vec3 particleColor = mix(color1, color2, sin(i + t * 0.2) * 0.5 + 0.5);
          col += particleColor * particle * 0.12;
        }
        
        // Additional smaller sparkle particles
        for(float j = 0.0; j < 8.0; j++) {
          vec2 sparklePos = vec2(
            cos(t * 0.4 + j * 2.3) * 1.0,
            sin(t * 0.35 + j * 1.7) * 0.7
          );
          float sparkle = spectralGlow(uvCentered, sparklePos, 0.008, 0.08);
          float twinkle = sin(t * 3.0 + j * 1.5) * 0.5 + 0.5;
          vec3 sparkleColor = mix(color3, color4, cos(j + t * 0.3) * 0.5 + 0.5);
          col += sparkleColor * sparkle * twinkle * 0.15;
        }
        
        // Central ghostly presence - more intense
        float centralGlow = spectralGlow(uvCentered, vec2(0.0, sin(t * 0.3) * 0.1), 0.4, 0.6);
        float centralPulse = sin(t * 0.5) * 0.2 + 0.8;
        vec3 centralColor = mix(color1, color3, sin(t * 0.2) * 0.5 + 0.5);
        col += centralColor * centralGlow * 0.12 * centralPulse;
        
        // Mouse glow interaction - stronger
        float mouseGlow = 0.05 / (length(uvCentered - mouse) + 0.15);
        vec3 mouseColor = mix(color1, color2, sin(t * 0.4) * 0.5 + 0.5);
        col += mouseColor * mouseGlow * mouseInfluence * 0.05;
        
        // Spectral shimmer overlay - more visible
        float shimmer = snoise(vec3(uvCentered * 8.0, t * 0.5));
        shimmer = smoothstep(0.2, 0.7, shimmer);
        col += vec3(0.5, 0.7, 0.9) * shimmer * 0.04;
        
        // Vignette
        float vignette = 1.0 - length(uv - 0.5) * 1.3;
        vignette = smoothstep(0.0, 0.7, vignette);
        col *= vignette;
        
        // Subtle color grading for spectral look
        col = pow(col, vec3(0.95));
        
        // Add very subtle scan lines for ethereal effect
        float scanLine = sin(gl_FragCoord.y * 1.5) * 0.02 + 0.98;
        col *= scanLine;
        
        gl_FragColor = vec4(col, 1.0);
      }
    `;

    function init() {
      scene = new THREE.Scene();
      
      camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
      camera.position.z = 1;

      renderer = new THREE.WebGLRenderer({ 
        antialias: true,
        alpha: false 
      });
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      containerRef.current?.appendChild(renderer.domElement);

      clock = new THREE.Clock();

      const geometry = new THREE.PlaneGeometry(2, 2);
      const material = new THREE.ShaderMaterial({
        uniforms,
        vertexShader,
        fragmentShader,
      });

      mesh = new THREE.Mesh(geometry, material);
      scene.add(mesh);

      window.addEventListener("resize", onResize);
      window.addEventListener("mousemove", onMouseMove);
      window.addEventListener("touchmove", onTouchMove);
      
      animate();
    }

    function onResize() {
      const width = containerRef.current?.clientWidth || window.innerWidth;
      const height = containerRef.current?.clientHeight || window.innerHeight;
      uniforms.iResolution.value.set(width, height);
      renderer.setSize(width, height);
    }

    function onMouseMove(e: MouseEvent) {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      targetMouseRef.current.x = (e.clientX - rect.left) / rect.width;
      targetMouseRef.current.y = 1.0 - (e.clientY - rect.top) / rect.height;
    }

    function onTouchMove(e: TouchEvent) {
      if (!containerRef.current || !e.touches[0]) return;
      const rect = containerRef.current.getBoundingClientRect();
      targetMouseRef.current.x = (e.touches[0].clientX - rect.left) / rect.width;
      targetMouseRef.current.y = 1.0 - (e.touches[0].clientY - rect.top) / rect.height;
    }

    function animate() {
      animationId = requestAnimationFrame(animate);
      
      uniforms.iTime.value = clock.getElapsedTime();
      
      // Smooth mouse following
      mouseRef.current.x += (targetMouseRef.current.x - mouseRef.current.x) * 0.03;
      mouseRef.current.y += (targetMouseRef.current.y - mouseRef.current.y) * 0.03;
      uniforms.iMouse.value.set(mouseRef.current.x, mouseRef.current.y, 0, 0);
      
      renderer.render(scene, camera);
    }

    init();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("touchmove", onTouchMove);
      if (renderer) {
        renderer.dispose();
        if (containerRef.current && renderer.domElement.parentNode === containerRef.current) {
          containerRef.current.removeChild(renderer.domElement);
        }
      }
    };
  }, []);

  return (
    <div 
      ref={containerRef} 
      className="absolute inset-0 w-full h-full"
      style={{ background: "#020105" }}
    />
  );
}
