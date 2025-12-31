import { useRef, useEffect } from "react";
import * as THREE from "three";

export function MetaballsBackground() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseRef = useRef({ x: 0.5, y: 0.5 });

  useEffect(() => {
    if (!containerRef.current) return;

    let scene: THREE.Scene;
    let camera: THREE.OrthographicCamera;
    let renderer: THREE.WebGLRenderer;
    let clock: THREE.Clock;
    let mesh: THREE.Mesh;
    let animationId: number;

    const uniforms = {
      t: { value: 0.0 },
      r: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
      mouse: { value: new THREE.Vector2(0.5, 0.5) },
    };

    const vertexShader = `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = vec4(position, 1.0);
      }
    `;

    const fragmentShader = `
      uniform float t;
      uniform vec2 r;
      uniform vec2 mouse;
      varying vec2 vUv;

      #define PI 3.14159265359
      
      float noise(vec2 p) {
        return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
      }
      
      float smoothNoise(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        f = f * f * (3.0 - 2.0 * f);
        
        float a = noise(i);
        float b = noise(i + vec2(1.0, 0.0));
        float c = noise(i + vec2(0.0, 1.0));
        float d = noise(i + vec2(1.0, 1.0));
        
        return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
      }
      
      float fbm(vec2 p) {
        float value = 0.0;
        float amplitude = 0.5;
        float frequency = 1.0;
        
        for (int i = 0; i < 5; i++) {
          value += amplitude * smoothNoise(p * frequency);
          amplitude *= 0.5;
          frequency *= 2.0;
        }
        return value;
      }

      float metaball(vec2 p, vec2 center, float radius) {
        float d = length(p - center);
        return radius * radius / (d * d + 0.001);
      }

      void main() {
        vec2 uv = gl_FragCoord.xy / r;
        vec2 p = (gl_FragCoord.xy * 2.0 - r) / min(r.x, r.y);
        
        float time = t * 0.3;
        
        // Mouse influence
        vec2 mousePos = (mouse * 2.0 - 1.0) * vec2(r.x / r.y, 1.0);
        
        // Multiple metaballs with organic movement
        float field = 0.0;
        
        // Large corner metaballs
        vec2 ball1 = vec2(-0.8, 0.8) + vec2(sin(time * 0.5), cos(time * 0.4)) * 0.2;
        vec2 ball2 = vec2(0.9, -0.85) + vec2(cos(time * 0.6), sin(time * 0.5)) * 0.15;
        
        // Medium floating metaballs
        vec2 ball3 = vec2(sin(time * 0.7) * 0.6, cos(time * 0.8) * 0.5);
        vec2 ball4 = vec2(cos(time * 0.5) * 0.7, sin(time * 0.6) * 0.6);
        vec2 ball5 = vec2(sin(time * 0.9 + 2.0) * 0.5, cos(time * 0.7 + 1.0) * 0.7);
        vec2 ball6 = vec2(cos(time * 0.8 + 1.5) * 0.8, sin(time * 0.9 + 0.5) * 0.4);
        
        // Small accent metaballs
        vec2 ball7 = vec2(-0.3, 0.3) + vec2(sin(time * 1.1), cos(time * 0.9)) * 0.3;
        vec2 ball8 = vec2(0.35, -0.35) + vec2(cos(time * 1.0), sin(time * 1.2)) * 0.25;
        
        // Mouse-following metaball
        vec2 mouseBall = mousePos * 0.8;
        
        // Calculate field with different radii
        field += metaball(p, ball1, 0.8);
        field += metaball(p, ball2, 0.9);
        field += metaball(p, ball3, 0.4);
        field += metaball(p, ball4, 0.35);
        field += metaball(p, ball5, 0.3);
        field += metaball(p, ball6, 0.32);
        field += metaball(p, ball7, 0.3);
        field += metaball(p, ball8, 0.35);
        field += metaball(p, mouseBall, 0.25);
        
        // Add wave distortion
        float wave = sin(p.x * 3.0 + time * 2.0) * cos(p.y * 2.5 + time * 1.5) * 0.15;
        field += wave;
        
        // Add noise for organic feel
        float n = fbm(p * 2.0 + time * 0.5) * 0.3;
        field += n;
        
        // Threshold for smooth blend
        float threshold = 0.8;
        float edge = smoothstep(threshold - 0.3, threshold + 0.1, field);
        
        // Color palette - purple metallic theme
        vec3 baseColor = vec3(0.61, 0.53, 0.96); // #9b87f5
        vec3 accentColor = vec3(0.48, 0.23, 0.93); // #7c3aed
        vec3 highlightColor = vec3(0.55, 0.36, 0.98); // #8b5cf6
        
        // Gradient based on position and field
        vec3 color = mix(accentColor, baseColor, field * 0.5);
        color = mix(color, highlightColor, sin(field * PI) * 0.5 + 0.5);
        
        // Add specular highlight effect
        float spec = pow(max(0.0, field - threshold), 2.0) * 3.0;
        color += vec3(1.0, 0.9, 1.0) * spec * 0.5;
        
        // Fresnel-like edge glow
        float fresnel = pow(1.0 - edge, 3.0);
        color += highlightColor * fresnel * 0.3;
        
        // Mouse glow effect
        float mouseDist = length(p - mouseBall);
        float mouseGlow = exp(-mouseDist * 2.0) * 0.4;
        color += highlightColor * mouseGlow;
        
        // Apply edge mask
        color *= edge;
        
        // Dark background with subtle gradient
        vec3 bgColor = mix(
          vec3(0.02, 0.01, 0.05),
          vec3(0.05, 0.02, 0.1),
          uv.y * 0.5 + fbm(uv * 5.0) * 0.2
        );
        
        // Blend metaballs with background
        vec3 finalColor = mix(bgColor, color, edge);
        
        // Add subtle vignette
        float vignette = 1.0 - length(uv - 0.5) * 0.5;
        finalColor *= vignette;
        
        // Contrast adjustment
        finalColor = pow(finalColor, vec3(0.9));
        
        gl_FragColor = vec4(finalColor, 1.0);
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
      
      animate();
    }

    function onResize() {
      uniforms.r.value.set(window.innerWidth, window.innerHeight);
      renderer.setSize(window.innerWidth, window.innerHeight);
    }

    function onMouseMove(e: MouseEvent) {
      mouseRef.current.x = e.clientX / window.innerWidth;
      mouseRef.current.y = 1.0 - e.clientY / window.innerHeight;
    }

    function animate() {
      animationId = requestAnimationFrame(animate);
      
      uniforms.t.value = clock.getElapsedTime();
      
      // Smooth mouse following
      uniforms.mouse.value.x += (mouseRef.current.x - uniforms.mouse.value.x) * 0.05;
      uniforms.mouse.value.y += (mouseRef.current.y - uniforms.mouse.value.y) * 0.05;
      
      renderer.render(scene, camera);
    }

    init();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("mousemove", onMouseMove);
      renderer.dispose();
      containerRef.current?.removeChild(renderer.domElement);
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
