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

    // CodePen VoXelo/raxRoxg shader - glowing wave lines with starfield
    const fragmentShader = `
      uniform float iTime;
      uniform vec2 iResolution;
      uniform vec4 iMouse;
      varying vec2 vUv;

      #define PI 3.14159265359
      #define S(a,b,t) smoothstep(a,b,t)

      // Rotation matrix
      mat2 rot(float a) {
        float s = sin(a), c = cos(a);
        return mat2(c, -s, s, c);
      }

      // Simplex noise
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

      // Wave function
      float wave(vec2 uv, float time, float freq) {
        return sin(uv.x * freq + time) * 0.1 +
               sin(uv.x * freq * 1.5 + time * 1.3) * 0.05 +
               sin(uv.x * freq * 2.0 + time * 0.8) * 0.03;
      }

      // Glow line function
      float glowLine(float y, float thickness, float glow) {
        float line = S(thickness, 0.0, abs(y));
        float glowEffect = S(glow, 0.0, abs(y)) * 0.5;
        return line + glowEffect;
      }

      // Hash for starfield
      float hash(vec2 p) {
        return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
      }

      // Starfield
      float starfield(vec2 uv, float time) {
        float stars = 0.0;
        for (float i = 0.0; i < 3.0; i++) {
          vec2 p = uv * (10.0 + i * 5.0);
          vec2 id = floor(p);
          vec2 f = fract(p);
          
          float h = hash(id);
          vec2 center = vec2(h, fract(h * 43.1));
          float d = length(f - center);
          
          float twinkle = sin(time * (2.0 + h * 3.0) + h * 6.28) * 0.5 + 0.5;
          float star = S(0.1, 0.0, d) * twinkle * (0.5 + h * 0.5);
          stars += star * (0.3 + i * 0.2);
        }
        return stars;
      }

      void main() {
        vec2 uv = gl_FragCoord.xy / iResolution.xy;
        vec2 uv0 = uv;
        float aspect = iResolution.x / iResolution.y;
        uv.x *= aspect;
        uv = uv * 2.0 - vec2(aspect, 1.0);
        
        float t = iTime;
        
        // Slow rotation (reduced speed)
        uv *= rot(t * 0.02);
        
        // Mouse position
        vec2 mousePos = iMouse.xy;
        mousePos.x *= aspect;
        mousePos = mousePos * 2.0 - vec2(aspect, 1.0);
        float mouseDist = length(uv - mousePos);
        
        // Color cycling
        float c1 = sin(t * 0.5) * 0.5 + 0.5;
        float c2 = cos(t * 0.3) * 0.5 + 0.5;
        
        // Wave noise
        float waveNoise = snoise(uv * 0.5 + t * 0.1) * 0.1;
        
        // Three glowing wave lines (reduced speed and glow)
        vec3 col = vec3(0.0);
        
        // Line 1 - Pink/Magenta (slowed down)
        float y1 = uv.y - wave(uv, t * 0.6, 2.0) + waveNoise - 0.3;
        float line1 = glowLine(y1, 0.015, 0.4);
        vec3 color1 = vec3(1.0, c1 * 0.4 + 0.2, c2 * 0.6 + 0.4);
        col += color1 * line1 * 0.7;
        
        // Line 2 - Purple (slowed down)
        float y2 = uv.y - wave(uv, t * 0.5 + 1.0, 2.5) + waveNoise * 1.2;
        float line2 = glowLine(y2, 0.015, 0.4);
        vec3 color2 = vec3(0.6 + c2 * 0.4, 0.3, 1.0);
        col += color2 * line2 * 0.7;
        
        // Line 3 - Blue/Cyan (slowed down)
        float y3 = uv.y - wave(uv, t * 0.7 + 2.0, 1.8) + waveNoise * 0.8 + 0.3;
        float line3 = glowLine(y3, 0.015, 0.4);
        vec3 color3 = vec3(0.3, c1 * 0.5 + 0.5, 1.0);
        col += color3 * line3 * 0.7;
        
        // Starfield (reduced brightness)
        float stars = starfield(uv0 * 2.0 + t * 0.005, t);
        col += vec3(1.0, 0.95, 0.9) * stars * 0.4;
        
        // Mouse glow with pulsing (reduced intensity)
        float mouseGlow = 0.04 / (mouseDist + 0.15);
        mouseGlow *= (sin(t * 0.8) * 0.3 + 0.7);
        vec3 mouseColor = mix(color1, color2, sin(t * 0.3) * 0.5 + 0.5);
        col += mouseColor * mouseGlow * 0.3;
        
        // Center glow (reduced)
        float centerDist = length(uv);
        float centerGlow = 0.1 / (centerDist + 0.4);
        vec3 centerColor = vec3(0.5 + c1 * 0.3, 0.2, 0.8 + c2 * 0.2);
        col += centerColor * centerGlow * 0.1;
        
        // Noise overlay for texture
        float noise = snoise(uv * 3.0 + t * 0.2) * 0.05;
        col += vec3(noise * 0.3);
        
        // Vignette
        float vignette = 1.0 - length(uv0 - 0.5) * 1.2;
        vignette = S(0.0, 0.7, vignette);
        col *= vignette;
        
        // Dark background blend
        vec3 bgColor = vec3(0.02, 0.01, 0.04);
        float bgMask = max(max(line1, line2), line3) + stars * 0.5 + centerGlow * 0.2;
        col = mix(bgColor, col, S(0.0, 0.3, bgMask));
        
        // Gamma correction
        col = pow(col, vec3(0.9));
        
        // Clamp to prevent overflow
        col = clamp(col, 0.0, 1.0);
        
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
      mouseRef.current.x += (targetMouseRef.current.x - mouseRef.current.x) * 0.05;
      mouseRef.current.y += (targetMouseRef.current.y - mouseRef.current.y) * 0.05;
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
      style={{ background: "#020104" }}
    />
  );
}
