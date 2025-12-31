import { useRef, useEffect } from "react";
import * as THREE from "three";

export function MetaballsBackground() {
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
      #define NUM_WAVES 6

      // Simplex noise functions
      vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
      vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
      vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

      float snoise(vec2 v) {
        const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                           -0.577350269189626, 0.024390243902439);
        vec2 i  = floor(v + dot(v, C.yy));
        vec2 x0 = v - i + dot(i, C.xx);
        vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
        vec4 x12 = x0.xyxy + C.xxzz;
        x12.xy -= i1;
        i = mod289(i);
        vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0))
                                    + i.x + vec3(0.0, i1.x, 1.0));
        vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy),
                                dot(x12.zw,x12.zw)), 0.0);
        m = m*m;
        m = m*m;
        vec3 x = 2.0 * fract(p * C.www) - 1.0;
        vec3 h = abs(x) - 0.5;
        vec3 ox = floor(x + 0.5);
        vec3 a0 = x - ox;
        m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
        vec3 g;
        g.x = a0.x * x0.x + h.x * x0.y;
        g.yz = a0.yz * x12.xz + h.yz * x12.yw;
        return 130.0 * dot(m, g);
      }

      float fbm(vec2 p) {
        float value = 0.0;
        float amplitude = 0.5;
        for (int i = 0; i < 5; i++) {
          value += amplitude * snoise(p);
          p *= 2.0;
          amplitude *= 0.5;
        }
        return value;
      }

      void main() {
        vec2 uv = gl_FragCoord.xy / r;
        float aspect = r.x / r.y;
        vec2 p = (gl_FragCoord.xy * 2.0 - r) / min(r.x, r.y);
        
        float time = t * 0.5;
        
        // Mouse position in normalized coords
        vec2 mousePos = (mouse * 2.0 - 1.0) * vec2(aspect, 1.0);
        
        // Create wave field
        float wave = 0.0;
        
        // Multiple wave sources
        for (int i = 0; i < NUM_WAVES; i++) {
          float fi = float(i);
          float angle = fi * PI * 2.0 / float(NUM_WAVES) + time * 0.3;
          float radius = 0.8 + sin(time * 0.5 + fi) * 0.3;
          vec2 center = vec2(cos(angle), sin(angle)) * radius;
          
          float dist = length(p - center);
          float freq = 8.0 + fi * 2.0;
          float speed = time * (2.0 + fi * 0.5);
          
          wave += sin(dist * freq - speed) / (dist + 0.5);
        }
        
        // Mouse wave influence
        float mouseDist = length(p - mousePos);
        wave += sin(mouseDist * 12.0 - time * 4.0) / (mouseDist + 0.3) * 0.5;
        
        // Add noise for organic feel
        float noise = fbm(p * 2.0 + time * 0.3) * 0.3;
        wave += noise;
        
        // Normalize wave
        wave = wave * 0.15 + 0.5;
        
        // Create color gradient
        vec3 color1 = vec3(0.61, 0.53, 0.96); // Purple #9b87f5
        vec3 color2 = vec3(0.48, 0.23, 0.93); // Deep purple #7c3aed
        vec3 color3 = vec3(0.55, 0.36, 0.98); // Violet #8b5cf6
        
        // Mix colors based on wave
        vec3 color = mix(color2, color1, smoothstep(0.3, 0.7, wave));
        color = mix(color, color3, smoothstep(0.5, 0.9, wave) * 0.5);
        
        // Add highlights
        float highlight = pow(max(0.0, wave - 0.6) * 2.5, 2.0);
        color += vec3(1.0, 0.95, 1.0) * highlight * 0.4;
        
        // Add mouse glow
        float mouseGlow = exp(-mouseDist * 2.0) * 0.3;
        color += color3 * mouseGlow;
        
        // Edge darkening (vignette)
        float vignette = 1.0 - length(uv - 0.5) * 0.8;
        vignette = smoothstep(0.0, 1.0, vignette);
        
        // Dark background blend
        vec3 bgColor = vec3(0.02, 0.01, 0.05);
        float bgBlend = smoothstep(0.35, 0.55, wave);
        color = mix(bgColor, color, bgBlend);
        
        // Apply vignette
        color *= vignette;
        
        // Gamma correction
        color = pow(color, vec3(0.9));
        
        gl_FragColor = vec4(color, 1.0);
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
      const width = containerRef.current?.clientWidth || window.innerWidth;
      const height = containerRef.current?.clientHeight || window.innerHeight;
      uniforms.r.value.set(width, height);
      renderer.setSize(width, height);
    }

    function onMouseMove(e: MouseEvent) {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      targetMouseRef.current.x = (e.clientX - rect.left) / rect.width;
      targetMouseRef.current.y = 1.0 - (e.clientY - rect.top) / rect.height;
    }

    function animate() {
      animationId = requestAnimationFrame(animate);
      
      uniforms.t.value = clock.getElapsedTime();
      
      // Smooth mouse following
      mouseRef.current.x += (targetMouseRef.current.x - mouseRef.current.x) * 0.05;
      mouseRef.current.y += (targetMouseRef.current.y - mouseRef.current.y) * 0.05;
      uniforms.mouse.value.copy(mouseRef.current);
      
      renderer.render(scene, camera);
    }

    init();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("mousemove", onMouseMove);
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
