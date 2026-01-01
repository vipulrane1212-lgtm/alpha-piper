import React, { useRef, Suspense, useState, useEffect } from "react";
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

// CSS-based fallback ghost (simpler, always works)
function CSSGhost() {
  return (
    <div className="relative w-full h-full min-h-[500px] flex items-center justify-center">
      <div className="relative">
        {/* Ghost body */}
        <div className="relative w-48 h-64 mx-auto">
          {/* Main body - white rounded top */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-40 bg-white rounded-t-full shadow-lg" 
               style={{
                 filter: 'drop-shadow(0 0 20px rgba(176, 176, 255, 0.8))',
                 animation: 'float 3s ease-in-out infinite'
               }}>
            {/* Eyes */}
            <div className="absolute top-12 left-8 w-6 h-6 bg-black rounded-full animate-pulse"></div>
            <div className="absolute top-12 right-8 w-6 h-6 bg-black rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
            
            {/* Wavy bottom */}
            <div className="absolute bottom-0 left-0 w-full h-8">
              <svg viewBox="0 0 128 32" className="w-full h-full">
                <path d="M0,32 Q32,16 64,24 T128,32 L128,32 L0,32 Z" fill="white" />
              </svg>
            </div>
          </div>
          
          {/* Glow effect */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-48 bg-blue-400/30 rounded-t-full blur-2xl animate-pulse"></div>
          
          {/* Floating particles */}
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-blue-300 rounded-full opacity-60"
              style={{
                left: `${20 + i * 10}%`,
                top: `${30 + Math.sin(i) * 20}%`,
                animation: `particleFloat ${3 + i * 0.5}s ease-in-out infinite`,
                animationDelay: `${i * 0.3}s`
              }}
            />
          ))}
        </div>
      </div>
      
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(2deg); }
        }
        @keyframes particleFloat {
          0%, 100% { transform: translateY(0px) translateX(0px) scale(1); opacity: 0.6; }
          50% { transform: translateY(-30px) translateX(10px) scale(1.2); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

export function GhostAnimation() {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if WebGL is supported
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) {
        setHasError(true);
        setIsLoading(false);
        return;
      }
      
      // Give Three.js a moment to load
      setTimeout(() => {
        setIsLoading(false);
      }, 1000);
    } catch (e) {
      setHasError(true);
      setIsLoading(false);
    }
  }, []);

  // Fallback to CSS ghost if WebGL fails or while loading
  if (hasError || isLoading) {
    return <CSSGhost />;
  }

  return (
    <div className="relative w-full h-full min-h-[500px]">
      <Suspense fallback={<CSSGhost />}>
        <Canvas
          camera={{ position: [0, 0, 5], fov: 50 }}
          gl={{ alpha: true, antialias: true }}
          style={{ background: "transparent" }}
          onError={() => setHasError(true)}
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
