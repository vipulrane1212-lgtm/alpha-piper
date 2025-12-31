import { useRef, useEffect } from "react";
import * as THREE from "three";

export function TubesCursorBackground() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const targetMouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (!containerRef.current) return;

    let renderer: THREE.WebGLRenderer;
    let scene: THREE.Scene;
    let camera: THREE.PerspectiveCamera;
    let animationId: number;
    let tubes: THREE.Mesh[] = [];
    let tubePoints: THREE.Vector3[][] = [];
    const clock = new THREE.Clock();

    // Vibrant neon colors - super bright
    const colors = [
      new THREE.Color("#00FF9F"), // Bright neon green
      new THREE.Color("#BD00FF"), // Vivid purple
      new THREE.Color("#00FFFF"), // Electric cyan
      new THREE.Color("#FF0080"), // Hot pink
      new THREE.Color("#00BFFF"), // Bright blue
      new THREE.Color("#FFFF00"), // Electric yellow
    ];

    const tubeCount = 6;
    const pointsPerTube = 50;
    const tubeRadius = 0.1;

    function init() {
      const width = containerRef.current!.clientWidth;
      const height = containerRef.current!.clientHeight;

      // Scene
      scene = new THREE.Scene();
      scene.background = new THREE.Color("#0a0a0f");

      // Camera
      camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
      camera.position.z = 5;

      // Renderer
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      containerRef.current!.appendChild(renderer.domElement);

      // Brighter lights for neon effect
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
      scene.add(ambientLight);

      const pointLight1 = new THREE.PointLight(0x00FF9F, 4, 25);
      pointLight1.position.set(5, 5, 5);
      scene.add(pointLight1);

      const pointLight2 = new THREE.PointLight(0xBD00FF, 4, 25);
      pointLight2.position.set(-5, -5, 5);
      scene.add(pointLight2);

      const pointLight3 = new THREE.PointLight(0x00FFFF, 3, 20);
      pointLight3.position.set(0, 0, 8);
      scene.add(pointLight3);

      const pointLight4 = new THREE.PointLight(0xFF0080, 3, 20);
      pointLight4.position.set(3, -3, 6);
      scene.add(pointLight4);

      // Initialize tube points
      for (let i = 0; i < tubeCount; i++) {
        const points: THREE.Vector3[] = [];
        const startX = (Math.random() - 0.5) * 8;
        const startY = (Math.random() - 0.5) * 6;
        
        for (let j = 0; j < pointsPerTube; j++) {
          points.push(new THREE.Vector3(
            startX + (Math.random() - 0.5) * 0.5,
            startY + (Math.random() - 0.5) * 0.5,
            (j / pointsPerTube) * -3
          ));
        }
        tubePoints.push(points);
      }

      // Create initial tubes
      createTubes();

      // Event listeners
      window.addEventListener("resize", onResize);
      window.addEventListener("mousemove", onMouseMove);
      window.addEventListener("touchmove", onTouchMove, { passive: true });
    }

    function createTubes() {
      // Remove old tubes
      tubes.forEach(tube => {
        scene.remove(tube);
        tube.geometry.dispose();
        (tube.material as THREE.Material).dispose();
      });
      tubes = [];

      // Create new tubes
      tubePoints.forEach((points, index) => {
        if (points.length < 2) return;

        try {
          const curve = new THREE.CatmullRomCurve3(points);
          const geometry = new THREE.TubeGeometry(curve, 64, tubeRadius, 8, false);
          
          const material = new THREE.MeshPhongMaterial({
            color: colors[index % colors.length],
            emissive: colors[index % colors.length],
            emissiveIntensity: 0.8,
            shininess: 150,
            transparent: true,
            opacity: 0.95,
          });

          const tube = new THREE.Mesh(geometry, material);
          scene.add(tube);
          tubes.push(tube);
        } catch (e) {
          // Skip if curve creation fails
        }
      });
    }

    function onResize() {
      if (!containerRef.current) return;
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;
      
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    }

    function onMouseMove(e: MouseEvent) {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      targetMouseRef.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      targetMouseRef.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    }

    function onTouchMove(e: TouchEvent) {
      if (!containerRef.current || !e.touches[0]) return;
      const rect = containerRef.current.getBoundingClientRect();
      targetMouseRef.current.x = ((e.touches[0].clientX - rect.left) / rect.width) * 2 - 1;
      targetMouseRef.current.y = -((e.touches[0].clientY - rect.top) / rect.height) * 2 + 1;
    }

    function animate() {
      animationId = requestAnimationFrame(animate);
      
      const time = clock.getElapsedTime();
      
      // Smooth mouse following
      mouseRef.current.x += (targetMouseRef.current.x - mouseRef.current.x) * 0.05;
      mouseRef.current.y += (targetMouseRef.current.y - mouseRef.current.y) * 0.05;

      // Update tube points to follow mouse
      tubePoints.forEach((points, tubeIndex) => {
        // Shift points
        for (let i = points.length - 1; i > 0; i--) {
          points[i].x = points[i - 1].x;
          points[i].y = points[i - 1].y;
          points[i].z = points[i - 1].z - 0.06;
        }

        // Update head position with offset per tube
        const offsetX = Math.sin(time * 0.5 + tubeIndex * 1.2) * 0.5;
        const offsetY = Math.cos(time * 0.7 + tubeIndex * 0.8) * 0.3;
        
        points[0].x = mouseRef.current.x * 4 + offsetX;
        points[0].y = mouseRef.current.y * 3 + offsetY;
        points[0].z = 0;

        // Keep points within bounds
        points.forEach(point => {
          if (point.z < -10) point.z = -10;
        });
      });

      // Recreate tubes with new geometry
      createTubes();

      // Animate lights
      scene.children.forEach((child, index) => {
        if (child instanceof THREE.PointLight) {
          child.position.x = Math.sin(time * 0.5 + index) * 5;
          child.position.y = Math.cos(time * 0.3 + index) * 5;
        }
      });

      renderer.render(scene, camera);
    }

    init();
    animate();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("touchmove", onTouchMove);
      
      tubes.forEach(tube => {
        tube.geometry.dispose();
        (tube.material as THREE.Material).dispose();
      });
      
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
      style={{ background: "#0a0a0f" }}
    />
  );
}
