import { useRef, useMemo, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { MarchingCubes, MarchingCube, Environment } from "@react-three/drei";
import * as THREE from "three";

function MetaBall({ 
  position, 
  speed, 
  strength = 0.5 
}: { 
  position: [number, number, number]; 
  speed: number; 
  strength?: number;
}) {
  const ref = useRef<THREE.Group>(null);
  const initialPos = useMemo(() => position, []);
  const offset = useMemo(() => Math.random() * Math.PI * 2, []);

  useFrame(({ clock }) => {
    if (ref.current) {
      const t = clock.getElapsedTime() * speed + offset;
      ref.current.position.x = initialPos[0] + Math.sin(t) * 0.3;
      ref.current.position.y = initialPos[1] + Math.cos(t * 1.3) * 0.3;
      ref.current.position.z = initialPos[2] + Math.sin(t * 0.7) * 0.2;
    }
  });

  return (
    <group ref={ref}>
      <MarchingCube strength={strength} subtract={12} position={position} />
    </group>
  );
}

function Scene() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(({ clock, pointer }) => {
    if (groupRef.current) {
      // Subtle rotation following mouse
      groupRef.current.rotation.y = THREE.MathUtils.lerp(
        groupRef.current.rotation.y,
        pointer.x * 0.3,
        0.02
      );
      groupRef.current.rotation.x = THREE.MathUtils.lerp(
        groupRef.current.rotation.x,
        pointer.y * 0.2,
        0.02
      );
    }
  });

  return (
    <group ref={groupRef}>
      <MarchingCubes 
        resolution={40} 
        maxPolyCount={20000} 
        enableUvs={false} 
        enableColors={false}
      >
        <meshStandardMaterial 
          color="#9b87f5"
          metalness={0.9}
          roughness={0.1}
          envMapIntensity={1.5}
        />
        
        {/* Main cluster of metaballs */}
        <MetaBall position={[0.5, 0, 0]} speed={0.4} strength={0.6} />
        <MetaBall position={[-0.5, 0.3, 0.2]} speed={0.5} strength={0.5} />
        <MetaBall position={[0, -0.4, 0.1]} speed={0.6} strength={0.5} />
        <MetaBall position={[0.3, 0.5, -0.2]} speed={0.35} strength={0.4} />
        <MetaBall position={[-0.3, -0.3, 0.3]} speed={0.45} strength={0.4} />
        <MetaBall position={[0.6, -0.2, -0.1]} speed={0.55} strength={0.35} />
      </MarchingCubes>
    </group>
  );
}

export function MetaballsBackground() {
  return (
    <div className="absolute inset-0 w-full h-full">
      <Canvas
        camera={{ position: [0, 0, 3], fov: 50 }}
        gl={{ 
          antialias: true, 
          alpha: true,
          powerPreference: "high-performance"
        }}
        style={{ background: "transparent" }}
      >
        <Suspense fallback={null}>
          {/* Lighting */}
          <ambientLight intensity={0.2} />
          <directionalLight position={[5, 5, 5]} intensity={1} color="#ffffff" />
          <directionalLight position={[-5, -5, -5]} intensity={0.5} color="#8b5cf6" />
          <pointLight position={[0, 2, 2]} intensity={1} color="#7c3aed" />
          
          {/* Environment for reflections */}
          <Environment preset="city" />
          
          {/* Metaballs */}
          <Scene />
        </Suspense>
      </Canvas>
    </div>
  );
}
