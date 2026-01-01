import React, { useRef, Suspense } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import * as THREE from "three";

// Ghost mesh component - exact CodePen style
function GhostMesh() {
  const meshRef = useRef<THREE.Group>(null);
  const materialRef = useRef<THREE.MeshStandardMaterial>(null);
  const glow1Ref = useRef<THREE.MeshStandardMaterial>(null);
  const glow2Ref = useRef<THREE.MeshStandardMaterial>(null);

  useFrame((state) => {
    if (meshRef.current) {
      const time = state.clock.elapsedTime;
      // Smooth floating like CodePen
      meshRef.current.position.y = Math.sin(time * 0.6) * 0.5 + Math.cos(time * 0.4) * 0.2;
      meshRef.current.rotation.y = Math.sin(time * 0.3) * 0.2;
      meshRef.current.rotation.z = Math.sin(time * 0.5) * 0.15;
      meshRef.current.rotation.x = Math.sin(time * 0.4) * 0.1;
    }

    // Pulsing glow effects
    if (materialRef.current) {
      const pulse = Math.sin(state.clock.elapsedTime * 2) * 0.3 + 0.7;
      materialRef.current.emissiveIntensity = pulse * 1.2;
      materialRef.current.opacity = 0.92 + Math.sin(state.clock.elapsedTime * 2.5) * 0.08;
    }
    if (glow1Ref.current) {
      const pulse = Math.sin(state.clock.elapsedTime * 1.8) * 0.2 + 0.8;
      glow1Ref.current.emissiveIntensity = pulse * 0.8;
      glow1Ref.current.opacity = 0.3 + Math.sin(state.clock.elapsedTime * 1.5) * 0.1;
    }
    if (glow2Ref.current) {
      const pulse = Math.sin(state.clock.elapsedTime * 2.2) * 0.25 + 0.75;
      glow2Ref.current.emissiveIntensity = pulse * 0.6;
      glow2Ref.current.opacity = 0.2 + Math.sin(state.clock.elapsedTime * 1.8) * 0.15;
    }
  });

  // Create ghost shape - CodePen style
  const ghostShape = new THREE.Shape();
  ghostShape.moveTo(0, 2.2);
  ghostShape.quadraticCurveTo(0.7, 2, 1, 1.5);
  ghostShape.quadraticCurveTo(1.2, 0.8, 1.1, 0.2);
  ghostShape.lineTo(0.9, -0.8);
  ghostShape.lineTo(0.6, -1.8);
  ghostShape.lineTo(0.3, -2.2);
  ghostShape.lineTo(0, -2.4);
  ghostShape.lineTo(-0.3, -2.2);
  ghostShape.lineTo(-0.6, -1.8);
  ghostShape.lineTo(-0.9, -0.8);
  ghostShape.lineTo(-1.1, 0.2);
  ghostShape.quadraticCurveTo(-1.2, 0.8, -1, 1.5);
  ghostShape.quadraticCurveTo(-0.7, 2, 0, 2.2);

  const extrudeSettings = {
    depth: 0.5,
    bevelEnabled: true,
    bevelThickness: 0.2,
    bevelSize: 0.15,
    bevelSegments: 16,
  };

  return (
    <group ref={meshRef}>
      {/* Outer glow layer */}
      <mesh scale={1.25} position={[0, 0, -0.1]}>
        <extrudeGeometry args={[ghostShape, extrudeSettings]} />
        <meshStandardMaterial
          ref={glow2Ref}
          color="#a0a0ff"
          emissive="#6060ff"
          emissiveIntensity={0.6}
          transparent
          opacity={0.2}
        />
      </mesh>

      {/* Middle glow layer */}
      <mesh scale={1.15} position={[0, 0, -0.05]}>
        <extrudeGeometry args={[ghostShape, extrudeSettings]} />
        <meshStandardMaterial
          ref={glow1Ref}
          color="#b0b0ff"
          emissive="#7070ff"
          emissiveIntensity={0.7}
          transparent
          opacity={0.3}
        />
      </mesh>

      {/* Main ghost body */}
      <mesh>
        <extrudeGeometry args={[ghostShape, extrudeSettings]} />
        <meshStandardMaterial
          ref={materialRef}
          color="#ffffff"
          emissive="#b0b0ff"
          emissiveIntensity={1.2}
          transparent
          opacity={0.95}
          roughness={0.1}
          metalness={0.1}
        />
      </mesh>

      {/* Eyes */}
      <PulsingEye position={[-0.4, 0.3, 0.6]} />
      <PulsingEye position={[0.4, 0.3, 0.6]} />
    </group>
  );
}

// Pulsing eye component
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

// Particle system - CodePen style
function Particles() {
  const particlesRef = useRef<THREE.Points>(null);
  const particleCount = 500;

  const positions = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);
  const sizes = new Float32Array(particleCount);

  for (let i = 0; i < particleCount; i++) {
    const i3 = i * 3;
    const radius = 2 + Math.random() * 5;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.random() * Math.PI;

    positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
    positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
    positions[i3 + 2] = radius * Math.cos(phi);

    const hue = Math.random() * 0.3 + 0.55;
    colors[i3] = hue;
    colors[i3 + 1] = hue * 0.7 + 0.2;
    colors[i3 + 2] = 0.9 + Math.random() * 0.1;

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

        positions[i3] += Math.sin(time * 0.5 + i) * 0.008;
        positions[i3 + 1] += Math.cos(time * 0.7 + i) * 0.008;
        positions[i3 + 2] += Math.sin(time * 0.6 + i) * 0.005;

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

export function GhostAnimation() {
  return (
    <div className="relative w-full h-full min-h-[500px]">
      <Suspense fallback={<div className="w-full h-full flex items-center justify-center text-muted-foreground">Loading ghost...</div>}>
        <Canvas
          camera={{ position: [0, 0, 6], fov: 45 }}
          gl={{ alpha: true, antialias: true }}
          style={{ background: "transparent" }}
        >
          {/* Lighting - CodePen style */}
          <ambientLight intensity={0.5} />
          <pointLight position={[3, 3, 3]} intensity={1.5} color="#b0b0ff" />
          <pointLight position={[-3, -3, -3]} intensity={0.8} color="#ffb0b0" />
          <pointLight position={[0, 4, 0]} intensity={1.2} color="#ffffff" />
          <pointLight position={[-2, 2, 2]} intensity={0.6} color="#c0c0ff" />

          {/* Ghost mesh */}
          <GhostMesh />

          {/* Particles */}
          <Particles />

          {/* Post-processing - Strong bloom like CodePen */}
          <EffectComposer>
            <Bloom intensity={2.5} luminanceThreshold={0.3} luminanceSmoothing={0.9} />
          </EffectComposer>

          {/* Auto rotate */}
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
