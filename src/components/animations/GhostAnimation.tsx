import React, { useRef, Suspense, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import * as THREE from "three";

// Enhanced ghost body with better shape
function GhostMesh() {
  const meshRef = useRef<THREE.Group>(null);
  const materialRef = useRef<THREE.MeshStandardMaterial>(null);
  const glowRef = useRef<THREE.MeshStandardMaterial>(null);

  useFrame((state) => {
    if (meshRef.current) {
      // Smooth floating animation
      const time = state.clock.elapsedTime;
      meshRef.current.position.y = Math.sin(time * 0.6) * 0.5 + Math.cos(time * 0.4) * 0.2;
      meshRef.current.rotation.y = Math.sin(time * 0.3) * 0.2;
      meshRef.current.rotation.z = Math.sin(time * 0.5) * 0.15;
      meshRef.current.rotation.x = Math.sin(time * 0.4) * 0.1;
    }
    
    // Pulsing glow effect
    if (materialRef.current && glowRef.current) {
      const pulse = Math.sin(state.clock.elapsedTime * 2) * 0.3 + 0.7;
      const intensePulse = Math.sin(state.clock.elapsedTime * 3) * 0.2 + 0.8;
      
      materialRef.current.emissiveIntensity = pulse * 1.2;
      materialRef.current.opacity = 0.92 + Math.sin(state.clock.elapsedTime * 2.5) * 0.08;
      
      glowRef.current.emissiveIntensity = intensePulse * 0.8;
      glowRef.current.opacity = 0.4 + Math.sin(state.clock.elapsedTime * 1.8) * 0.2;
    }
  });

  // Create a more detailed ghost shape
  const ghostShape = new THREE.Shape();
  
  // Head (rounded top)
  ghostShape.moveTo(0, 2);
  ghostShape.quadraticCurveTo(0.6, 1.8, 0.8, 1.4);
  ghostShape.quadraticCurveTo(1, 1, 0.95, 0.5);
  ghostShape.quadraticCurveTo(0.9, 0, 0.7, -0.3);
  
  // Left wavy side
  ghostShape.lineTo(0.5, -1);
  ghostShape.lineTo(0.3, -1.8);
  ghostShape.lineTo(0.15, -2.2);
  ghostShape.lineTo(0, -2.4);
  
  // Right wavy side (mirror)
  ghostShape.lineTo(-0.15, -2.2);
  ghostShape.lineTo(-0.3, -1.8);
  ghostShape.lineTo(-0.5, -1);
  ghostShape.lineTo(-0.7, -0.3);
  
  // Right side back up
  ghostShape.quadraticCurveTo(-0.9, 0, -0.95, 0.5);
  ghostShape.quadraticCurveTo(-1, 1, -0.8, 1.4);
  ghostShape.quadraticCurveTo(-0.6, 1.8, 0, 2);

  const extrudeSettings = {
    depth: 0.4,
    bevelEnabled: true,
    bevelThickness: 0.15,
    bevelSize: 0.15,
    bevelSegments: 12,
  };

  return (
    <group ref={meshRef} position={[0, 0, 0]}>
      {/* Outer glow layer - largest */}
      <mesh scale={1.25} position={[0, 0, -0.1]}>
        <extrudeGeometry args={[ghostShape, extrudeSettings]} />
        <meshStandardMaterial
          ref={glowRef}
          color="#a0a0ff"
          emissive="#6060ff"
          emissiveIntensity={0.6}
          transparent
          opacity={0.25}
        />
      </mesh>
      
      {/* Middle glow layer */}
      <mesh scale={1.15} position={[0, 0, -0.05]}>
        <extrudeGeometry args={[ghostShape, extrudeSettings]} />
        <meshStandardMaterial
          color="#b0b0ff"
          emissive="#7070ff"
          emissiveIntensity={0.7}
          transparent
          opacity={0.35}
        />
      </mesh>
      
      {/* Main ghost body - brightest */}
      <mesh>
        <extrudeGeometry args={[ghostShape, extrudeSettings]} />
        <meshStandardMaterial
          ref={materialRef}
          color="#ffffff"
          emissive="#b0b0ff"
          emissiveIntensity={1}
          transparent
          opacity={0.95}
          roughness={0.1}
          metalness={0.1}
        />
      </mesh>
      
      {/* Eyes with pulsing effect */}
      <PulsingEye position={[-0.4, 0.3, 0.6]} />
      <PulsingEye position={[0.4, 0.3, 0.6]} />
      
      {/* Mouth */}
      <mesh position={[0, -0.1, 0.6]}>
        <sphereGeometry args={[0.15, 16, 8]} />
        <meshStandardMaterial 
          color="#000000" 
          emissive="#ff0000" 
          emissiveIntensity={0.3}
          transparent
          opacity={0.8}
        />
      </mesh>
    </group>
  );
}

// Enhanced pulsing eye component
function PulsingEye({ position }: { position: [number, number, number] }) {
  const eyeRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (eyeRef.current && glowRef.current) {
      const pulse = 1 + Math.sin(state.clock.elapsedTime * 4) * 0.15;
      const glowPulse = 1 + Math.sin(state.clock.elapsedTime * 5) * 0.3;
      
      eyeRef.current.scale.set(pulse, pulse, pulse);
      glowRef.current.scale.set(glowPulse * 1.5, glowPulse * 1.5, glowPulse * 1.5);
      
      // Occasional blink
      const blink = Math.sin(state.clock.elapsedTime * 0.5);
      if (blink > 0.9) {
        eyeRef.current.scale.y = 0.1;
      }
    }
  });

  return (
    <group position={position}>
      {/* Eye glow */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[0.18, 16, 16]} />
        <meshStandardMaterial 
          color="#ff0000" 
          emissive="#ff3333" 
          emissiveIntensity={0.8}
          transparent
          opacity={0.4}
        />
      </mesh>
      
      {/* Main eye */}
      <mesh ref={eyeRef}>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshStandardMaterial 
          color="#000000" 
          emissive="#ff0000" 
          emissiveIntensity={0.5}
        />
      </mesh>
    </group>
  );
}

// Enhanced particle system for spectral effect
function Particles() {
  const particlesRef = useRef<THREE.Points>(null);
  const particleCount = 500;

  const positions = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);
  const velocities = new Float32Array(particleCount * 3);
  const sizes = new Float32Array(particleCount);

  for (let i = 0; i < particleCount; i++) {
    const i3 = i * 3;
    const radius = 2 + Math.random() * 5;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.random() * Math.PI;
    
    positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
    positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
    positions[i3 + 2] = radius * Math.cos(phi);
    
    velocities[i3] = (Math.random() - 0.5) * 0.03;
    velocities[i3 + 1] = (Math.random() - 0.5) * 0.03;
    velocities[i3 + 2] = (Math.random() - 0.5) * 0.03;
    
    // Spectral blue-white-purple colors with more variation
    const hue = Math.random() * 0.3 + 0.55; // Blue-purple range
    colors[i3] = hue; // R
    colors[i3 + 1] = hue * 0.7 + 0.2; // G
    colors[i3 + 2] = 0.9 + Math.random() * 0.1; // B
    
    sizes[i] = 0.05 + Math.random() * 0.1;
  }

  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y = state.clock.elapsedTime * 0.03;
      particlesRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.02) * 0.1;
      
      const positions = particlesRef.current.geometry.attributes.position.array as Float32Array;
      const sizes = particlesRef.current.geometry.attributes.size.array as Float32Array;
      
      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        const time = state.clock.elapsedTime;
        
        // Floating motion
        positions[i3] += velocities[i3] + Math.sin(time * 0.5 + i) * 0.008;
        positions[i3 + 1] += velocities[i3 + 1] + Math.cos(time * 0.7 + i) * 0.008;
        positions[i3 + 2] += velocities[i3 + 2] + Math.sin(time * 0.6 + i) * 0.005;
        
        // Pulsing size
        sizes[i] = (0.05 + Math.random() * 0.1) * (1 + Math.sin(time * 2 + i) * 0.3);
      }
      
      particlesRef.current.geometry.attributes.position.needsUpdate = true;
      particlesRef.current.geometry.attributes.size.needsUpdate = true;
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
        <bufferAttribute
          attach="attributes-size"
          count={particleCount}
          array={sizes}
          itemSize={1}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.1}
        vertexColors
        transparent
        opacity={0.8}
        blending={THREE.AdditiveBlending}
        sizeAttenuation={true}
      />
    </points>
  );
}

// Enhanced CSS-based fallback ghost
function CSSGhost() {
  return (
    <div className="relative w-full h-full min-h-[500px] flex items-center justify-center">
      <div className="relative">
        {/* Ghost body */}
        <div className="relative w-64 h-80 mx-auto">
          {/* Outer glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-48 bg-blue-400/40 rounded-t-full blur-3xl animate-pulse"></div>
          
          {/* Main body - white rounded top */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-36 h-44 bg-white rounded-t-full shadow-2xl" 
               style={{
                 filter: 'drop-shadow(0 0 30px rgba(176, 176, 255, 1)) drop-shadow(0 0 60px rgba(128, 128, 255, 0.6))',
                 animation: 'ghostFloat 4s ease-in-out infinite'
               }}>
            {/* Eyes */}
            <div className="absolute top-14 left-10 w-7 h-7 bg-black rounded-full animate-pulse shadow-[0_0_15px_rgba(255,0,0,0.8)]"></div>
            <div className="absolute top-14 right-10 w-7 h-7 bg-black rounded-full animate-pulse shadow-[0_0_15px_rgba(255,0,0,0.8)]" style={{ animationDelay: '0.5s' }}></div>
            
            {/* Mouth */}
            <div className="absolute top-20 left-1/2 -translate-x-1/2 w-6 h-6 bg-black rounded-full"></div>
            
            {/* Wavy bottom */}
            <div className="absolute bottom-0 left-0 w-full h-10 overflow-hidden">
              <svg viewBox="0 0 144 40" className="w-full h-full">
                <path d="M0,40 Q36,20 72,28 T144,40 L144,40 L0,40 Z" fill="white" />
              </svg>
            </div>
          </div>
          
          {/* Inner glow */}
          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-32 h-38 bg-blue-300/50 rounded-t-full blur-2xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          
          {/* Floating particles */}
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-blue-300 rounded-full opacity-70"
              style={{
                left: `${15 + i * 6}%`,
                top: `${20 + Math.sin(i) * 25}%`,
                animation: `particleFloat ${4 + i * 0.3}s ease-in-out infinite`,
                animationDelay: `${i * 0.2}s`,
                boxShadow: '0 0 10px rgba(176, 196, 255, 0.8)'
              }}
            />
          ))}
        </div>
      </div>
      
      <style>{`
        @keyframes ghostFloat {
          0%, 100% { 
            transform: translateY(0px) translateX(0px) rotate(0deg);
            filter: drop-shadow(0 0 30px rgba(176, 176, 255, 1)) drop-shadow(0 0 60px rgba(128, 128, 255, 0.6));
          }
          25% { 
            transform: translateY(-25px) translateX(5px) rotate(2deg);
            filter: drop-shadow(0 0 40px rgba(176, 176, 255, 1.2)) drop-shadow(0 0 80px rgba(128, 128, 255, 0.8));
          }
          50% { 
            transform: translateY(-30px) translateX(0px) rotate(0deg);
            filter: drop-shadow(0 0 35px rgba(176, 176, 255, 1.1)) drop-shadow(0 0 70px rgba(128, 128, 255, 0.7));
          }
          75% { 
            transform: translateY(-20px) translateX(-5px) rotate(-2deg);
            filter: drop-shadow(0 0 38px rgba(176, 176, 255, 1.15)) drop-shadow(0 0 75px rgba(128, 128, 255, 0.75));
          }
        }
        @keyframes particleFloat {
          0%, 100% { 
            transform: translateY(0px) translateX(0px) scale(1); 
            opacity: 0.7; 
          }
          50% { 
            transform: translateY(-40px) translateX(15px) scale(1.3); 
            opacity: 1; 
          }
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
          camera={{ position: [0, 0, 6], fov: 45 }}
          gl={{ alpha: true, antialias: true }}
          style={{ background: "transparent" }}
          onError={() => setHasError(true)}
        >
          {/* Enhanced Lighting */}
          <ambientLight intensity={0.5} />
          <pointLight position={[3, 3, 3]} intensity={1.5} color="#b0b0ff" />
          <pointLight position={[-3, -3, -3]} intensity={0.8} color="#ffb0b0" />
          <pointLight position={[0, 4, 0]} intensity={1.2} color="#ffffff" />
          <pointLight position={[-2, 2, 2]} intensity={0.6} color="#c0c0ff" />
          
          {/* Ghost mesh */}
          <GhostMesh />
          
          {/* Enhanced spectral particles */}
          <Particles />
          
          {/* Post-processing effects with stronger bloom */}
          <EffectComposer>
            <Bloom intensity={2} luminanceThreshold={0.4} luminanceSmoothing={0.9} />
          </EffectComposer>
          
          {/* Controls - auto rotate */}
          <OrbitControls
            enableZoom={false}
            enablePan={false}
            autoRotate
            autoRotateSpeed={0.5}
            minPolarAngle={Math.PI / 3}
            maxPolarAngle={Math.PI / 1.5}
          />
        </Canvas>
      </Suspense>
    </div>
  );
}
