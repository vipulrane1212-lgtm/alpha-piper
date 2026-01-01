import React, { useRef, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import * as THREE from "three";

// Ghost body shape using custom geometry
function GhostMesh() {
  const meshRef = useRef<THREE.Group>(null);
  const materialRef = useRef<THREE.MeshStandardMaterial>(null);

  useFrame((state) => {
    if (meshRef.current) {
      // Floating animation
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.8) * 0.4;
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.15;
      meshRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    }
    
    // Pulsing glow effect
    if (materialRef.current) {
      const pulse = Math.sin(state.clock.elapsedTime * 1.5) * 0.4 + 0.8;
      materialRef.current.emissiveIntensity = pulse;
      materialRef.current.opacity = 0.85 + Math.sin(state.clock.elapsedTime * 2) * 0.1;
    }
  });

  // Create ghost shape vertices
  const ghostShape = new THREE.Shape();
  ghostShape.moveTo(0, 1.5);
  ghostShape.quadraticCurveTo(0.5, 1.2, 0.8, 0.8);
  ghostShape.quadraticCurveTo(1, 0.3, 0.9, -0.5);
  ghostShape.lineTo(0.6, -1.2);
  ghostShape.lineTo(0.3, -1.5);
  ghostShape.lineTo(0, -1.6);
  ghostShape.lineTo(-0.3, -1.5);
  ghostShape.lineTo(-0.6, -1.2);
  ghostShape.lineTo(-0.9, -0.5);
  ghostShape.quadraticCurveTo(-1, 0.3, -0.8, 0.8);
  ghostShape.quadraticCurveTo(-0.5, 1.2, 0, 1.5);

  const extrudeSettings = {
    depth: 0.3,
    bevelEnabled: true,
    bevelThickness: 0.1,
    bevelSize: 0.1,
    bevelSegments: 8,
  };

  return (
    <group ref={meshRef} position={[0, 0, 0]}>
      {/* Main ghost body */}
      <mesh>
        <extrudeGeometry args={[ghostShape, extrudeSettings]} />
        <meshStandardMaterial
          ref={materialRef}
          color="#ffffff"
          emissive="#b0b0ff"
          emissiveIntensity={0.8}
          transparent
          opacity={0.9}
        />
      </mesh>
      
      {/* Spectral glow layers */}
      <mesh scale={1.1}>
        <extrudeGeometry args={[ghostShape, extrudeSettings]} />
        <meshStandardMaterial
          color="#c0c0ff"
          emissive="#8080ff"
          emissiveIntensity={0.5}
          transparent
          opacity={0.3}
        />
      </mesh>
      
      <mesh scale={1.2}>
        <extrudeGeometry args={[ghostShape, extrudeSettings]} />
        <meshStandardMaterial
          color="#a0a0ff"
          emissive="#6060ff"
          emissiveIntensity={0.3}
          transparent
          opacity={0.15}
        />
      </mesh>
      
      {/* Eyes with pulsing effect */}
      <PulsingEye position={[-0.35, 0.25, 0.5]} />
      <PulsingEye position={[0.35, 0.25, 0.5]} />
    </group>
  );
}

// Pulsing eye component
function PulsingEye({ position }: { position: [number, number, number] }) {
  const eyeRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (eyeRef.current) {
      const scale = 1 + Math.sin(state.clock.elapsedTime * 3) * 0.1;
      eyeRef.current.scale.set(scale, scale, scale);
    }
  });

  return (
    <mesh ref={eyeRef} position={position}>
      <sphereGeometry args={[0.12, 16, 16]} />
      <meshStandardMaterial color="#000000" emissive="#ff0000" emissiveIntensity={0.2} />
    </mesh>
  );
}

// Particle system for spectral effect
function Particles() {
  const particlesRef = useRef<THREE.Points>(null);
  const particleCount = 300;

  const positions = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);
  const velocities = new Float32Array(particleCount * 3);

  for (let i = 0; i < particleCount; i++) {
    const i3 = i * 3;
    const radius = 3 + Math.random() * 4;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.random() * Math.PI;
    
    positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
    positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
    positions[i3 + 2] = radius * Math.cos(phi);
    
    velocities[i3] = (Math.random() - 0.5) * 0.02;
    velocities[i3 + 1] = (Math.random() - 0.5) * 0.02;
    velocities[i3 + 2] = (Math.random() - 0.5) * 0.02;
    
    // Spectral blue-white-purple colors
    const hue = Math.random() * 0.2 + 0.6; // Blue-purple range
    colors[i3] = hue; // R
    colors[i3 + 1] = hue * 0.8; // G
    colors[i3 + 2] = 1.0; // B
  }

  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y = state.clock.elapsedTime * 0.05;
      const positions = particlesRef.current.geometry.attributes.position.array as Float32Array;
      
      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        positions[i3] += velocities[i3] + Math.sin(state.clock.elapsedTime + i) * 0.005;
        positions[i3 + 1] += velocities[i3 + 1] + Math.cos(state.clock.elapsedTime + i) * 0.005;
        positions[i3 + 2] += velocities[i3 + 2];
      }
      
      particlesRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particleCount}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={particleCount}
          array={colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.08}
        vertexColors
        transparent
        opacity={0.7}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

// Error boundary wrapper
function ErrorBoundary({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export function GhostAnimation() {
  return (
    <div className="relative w-full h-full min-h-[500px]">
      <Suspense fallback={<div className="w-full h-full flex items-center justify-center text-muted-foreground">Loading ghost...</div>}>
        <Canvas
          camera={{ position: [0, 0, 5], fov: 50 }}
          gl={{ alpha: true, antialias: true }}
          style={{ background: "transparent" }}
        >
          {/* Lighting */}
          <ambientLight intensity={0.4} />
          <pointLight position={[2, 2, 2]} intensity={1.2} color="#b0b0ff" />
          <pointLight position={[-2, -2, -2]} intensity={0.6} color="#ffb0b0" />
          <pointLight position={[0, 3, 0]} intensity={0.8} color="#ffffff" />
          
          {/* Ghost mesh */}
          <GhostMesh />
          
          {/* Spectral particles */}
          <Particles />
          
          {/* Post-processing effects */}
          <EffectComposer>
            <Bloom intensity={1.5} luminanceThreshold={0.5} luminanceSmoothing={0.9} />
          </EffectComposer>
          
          {/* Controls - auto rotate */}
          <OrbitControls
            enableZoom={false}
            enablePan={false}
            autoRotate
            autoRotateSpeed={0.3}
            minPolarAngle={Math.PI / 3}
            maxPolarAngle={Math.PI / 1.5}
          />
        </Canvas>
      </Suspense>
    </div>
  );
}

