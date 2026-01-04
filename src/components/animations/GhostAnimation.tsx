import React, { useRef, Suspense, useEffect, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import * as THREE from "three";

// Fluorescent color palette from CodePen
const fluorescentColors: Record<string, number> = {
  cyan: 0x00ffff,
  lime: 0x00ff00,
  magenta: 0xff00ff,
  yellow: 0xffff00,
  orange: 0xff4500,
  pink: 0xff1493,
  purple: 0x9400d3,
  blue: 0x0080ff,
  green: 0x00ff80,
  red: 0xff0040,
  teal: 0x00ffaa,
  violet: 0x8a2be2,
};

// Detect mobile device
function isMobileDevice(): boolean {
  if (typeof window === 'undefined') return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
    (window.matchMedia && window.matchMedia('(max-width: 768px)').matches) ||
    ('ontouchstart' in window);
}

// Parameters from CodePen - same on all devices (mobile = web)
const params = {
  bodyColor: 0x0f2027,
  glowColor: "orange",
  eyeGlowColor: "green",
  ghostOpacity: 0.88,
  ghostScale: 2.4,
  emissiveIntensity: 5.8,
  pulseSpeed: 1.6,
  pulseIntensity: 0.6,
  eyeGlowIntensity: 4.5,
  eyeGlowDecay: 0.95,
  eyeGlowResponse: 0.31,
  rimLightIntensity: 1.8,
  followSpeed: 0.075,
  wobbleAmount: 0.35,
  floatSpeed: 1.6,
  movementThreshold: 0.07,
  particleCount: 250,
  particleDecayRate: 0.005,
  particleColor: "orange",
  fireflyGlowIntensity: 2.6,
  fireflySpeed: 0.04,
  fireflyCount: 20,
};

// Ghost mesh - CodePen exact implementation
function GhostMesh() {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.MeshStandardMaterial>(null);
  const groupRef = useRef<THREE.Group>(null);
  const [mouse] = useState({ x: 0, y: 0 });
  const [prevPosition] = useState(new THREE.Vector3());
  const [currentMovement, setCurrentMovement] = useState(0);
  const [time, setTime] = useState(0);

  // Mouse/touch tracking
  useEffect(() => {
    const handleMove = (e: MouseEvent | TouchEvent) => {
      // User requested: "dont respond to touch on mobile let it keep floating"
      // Skip updates for touch events on mobile
      if ('touches' in e && isMobileDevice()) return;

      let clientX = 0;
      let clientY = 0;
      
      if ('touches' in e && e.touches.length > 0) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else if ('clientX' in e) {
        clientX = e.clientX;
        clientY = e.clientY;
      }
      
      mouse.x = (clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(clientY / window.innerHeight) * 2 + 1;
    };
    
    window.addEventListener("mousemove", handleMove);
    window.addEventListener("touchmove", handleMove);
    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("touchmove", handleMove);
    };
  }, [mouse]);

  useFrame((state) => {
    if (!meshRef.current || !groupRef.current || !materialRef.current) return;

    const elapsedTime = state.clock.elapsedTime;
    setTime(elapsedTime);

    // Ghost follows mouse
    const targetX = mouse.x * 11;
    const targetY = mouse.y * 7;
    const prevPos = groupRef.current.position.clone();

    groupRef.current.position.x += (targetX - groupRef.current.position.x) * params.followSpeed;
    groupRef.current.position.y += (targetY - groupRef.current.position.y) * params.followSpeed;

    // Calculate movement
    const movementAmount = prevPos.distanceTo(groupRef.current.position);
    setCurrentMovement(
      currentMovement * params.eyeGlowDecay + movementAmount * (1 - params.eyeGlowDecay)
    );

    // Floating animation
    const float1 = Math.sin(elapsedTime * params.floatSpeed * 1.5) * 0.03;
    const float2 = Math.cos(elapsedTime * params.floatSpeed * 0.7) * 0.018;
    const float3 = Math.sin(elapsedTime * params.floatSpeed * 2.3) * 0.008;
    groupRef.current.position.y += float1 + float2 + float3;

    // Pulsing effects
    const pulse1 = Math.sin(elapsedTime * params.pulseSpeed) * params.pulseIntensity;
    const pulse2 = Math.cos(elapsedTime * params.pulseSpeed * 1.4) * params.pulseIntensity * 0.6;
    const breathe = Math.sin(elapsedTime * 0.6) * 0.12;
    materialRef.current.emissiveIntensity = params.emissiveIntensity + pulse1 + breathe;

    // Body animations
    const mouseDirection = new THREE.Vector2(
      targetX - groupRef.current.position.x,
      targetY - groupRef.current.position.y
    ).normalize();

    const tiltStrength = 0.1 * params.wobbleAmount;
    const tiltDecay = 0.95;
    meshRef.current.rotation.z =
      meshRef.current.rotation.z * tiltDecay + -mouseDirection.x * tiltStrength * (1 - tiltDecay);
    meshRef.current.rotation.x =
      meshRef.current.rotation.x * tiltDecay + mouseDirection.y * tiltStrength * (1 - tiltDecay);
    meshRef.current.rotation.y = Math.sin(elapsedTime * 1.4) * 0.05 * params.wobbleAmount;

    // Scale variations
    const scaleVariation =
      1 + Math.sin(elapsedTime * 2.1) * 0.025 * params.wobbleAmount + pulse1 * 0.015;
    const scaleBreath = 1 + Math.sin(elapsedTime * 0.8) * 0.012;
    const finalScale = scaleVariation * scaleBreath;
    meshRef.current.scale.set(finalScale, finalScale, finalScale);
  });

  // Create ghost geometry - CodePen uses SphereGeometry with modified vertices
  const ghostGeometry = useRef<THREE.SphereGeometry | null>(null);
  if (!ghostGeometry.current) {
    ghostGeometry.current = new THREE.SphereGeometry(2, 40, 40);
    // Create organic wavy bottom
    const positionAttribute = ghostGeometry.current.getAttribute("position");
    const positions = positionAttribute.array;
    for (let i = 0; i < positions.length; i += 3) {
      if (positions[i + 1] < -0.2) {
        const x = positions[i];
        const z = positions[i + 2];
        const noise1 = Math.sin(x * 5) * 0.35;
        const noise2 = Math.cos(z * 4) * 0.25;
        const noise3 = Math.sin((x + z) * 3) * 0.15;
        const combinedNoise = noise1 + noise2 + noise3;
        positions[i + 1] = -2.0 + combinedNoise;
      }
    }
    ghostGeometry.current.computeVertexNormals();
  }

  return (
    <group ref={groupRef}>
      <mesh ref={meshRef} geometry={ghostGeometry.current}>
        <meshStandardMaterial
          ref={materialRef}
          color={params.bodyColor}
          transparent
          opacity={params.ghostOpacity}
          emissive={fluorescentColors[params.glowColor]}
          emissiveIntensity={params.emissiveIntensity}
          roughness={0.02}
          metalness={0.0}
          side={THREE.DoubleSide}
          alphaTest={0.01}
          depthWrite={false}
          blending={THREE.NormalBlending}
          fog={false}
        />
      </mesh>
      <Eyes currentMovement={currentMovement} />
    </group>
  );
}

// Eyes component - CodePen exact implementation
function Eyes({ currentMovement }: { currentMovement: number }) {
  const eyeGroupRef = useRef<THREE.Group>(null);
  const leftEyeRef = useRef<THREE.Mesh>(null);
  const rightEyeRef = useRef<THREE.Mesh>(null);
  const leftEyeMaterialRef = useRef<THREE.MeshBasicMaterial>(null);
  const rightEyeMaterialRef = useRef<THREE.MeshBasicMaterial>(null);
  const leftOuterGlowRef = useRef<THREE.Mesh>(null);
  const rightOuterGlowRef = useRef<THREE.Mesh>(null);
  const leftOuterGlowMaterialRef = useRef<THREE.MeshBasicMaterial>(null);
  const rightOuterGlowMaterialRef = useRef<THREE.MeshBasicMaterial>(null);

  useFrame(() => {
    if (
      !leftEyeMaterialRef.current ||
      !rightEyeMaterialRef.current ||
      !leftOuterGlowMaterialRef.current ||
      !rightOuterGlowMaterialRef.current
    )
      return;

    const isMoving = currentMovement > params.movementThreshold;
    const targetGlow = isMoving ? 1.0 : 0.0;
    const glowChangeSpeed = isMoving
      ? params.eyeGlowResponse * 2
      : params.eyeGlowResponse;

    const newOpacity =
      (leftEyeMaterialRef.current.opacity || 0) +
      (targetGlow - (leftEyeMaterialRef.current.opacity || 0)) * glowChangeSpeed;

    leftEyeMaterialRef.current.opacity = newOpacity;
    rightEyeMaterialRef.current.opacity = newOpacity;
    leftOuterGlowMaterialRef.current.opacity = newOpacity * 0.3;
    rightOuterGlowMaterialRef.current.opacity = newOpacity * 0.3;
  });

  const socketGeometry = new THREE.SphereGeometry(0.45, 16, 16);
  const socketMaterial = new THREE.MeshBasicMaterial({
    color: 0x000000,
    transparent: false,
  });

  const eyeGeometry = new THREE.SphereGeometry(0.3, 12, 12);
  const outerGlowGeometry = new THREE.SphereGeometry(0.525, 12, 12);

  const eyeColor = fluorescentColors[params.eyeGlowColor];

  return (
    <group ref={eyeGroupRef}>
      {/* Eye sockets */}
      <mesh geometry={socketGeometry} material={socketMaterial} position={[-0.7, 0.6, 1.9]} scale={[1.1, 1.0, 0.6]} />
      <mesh geometry={socketGeometry} material={socketMaterial} position={[0.7, 0.6, 1.9]} scale={[1.1, 1.0, 0.6]} />

      {/* Left eye */}
      <mesh
        ref={leftEyeRef}
        geometry={eyeGeometry}
        position={[-0.7, 0.6, 2.0]}
      >
        <meshBasicMaterial
          ref={leftEyeMaterialRef}
          color={eyeColor}
          transparent
          opacity={0}
        />
      </mesh>

      {/* Right eye */}
      <mesh
        ref={rightEyeRef}
        geometry={eyeGeometry}
        position={[0.7, 0.6, 2.0]}
      >
        <meshBasicMaterial
          ref={rightEyeMaterialRef}
          color={eyeColor}
          transparent
          opacity={0}
        />
      </mesh>

      {/* Outer glows */}
      <mesh
        ref={leftOuterGlowRef}
        geometry={outerGlowGeometry}
        position={[-0.7, 0.6, 1.95]}
      >
        <meshBasicMaterial
          ref={leftOuterGlowMaterialRef}
          color={eyeColor}
          transparent
          opacity={0}
          side={THREE.BackSide}
        />
      </mesh>

      <mesh
        ref={rightOuterGlowRef}
        geometry={outerGlowGeometry}
        position={[0.7, 0.6, 1.95]}
      >
        <meshBasicMaterial
          ref={rightOuterGlowMaterialRef}
          color={eyeColor}
          transparent
          opacity={0}
          side={THREE.BackSide}
        />
      </mesh>
    </group>
  );
}

// Fireflies - CodePen exact implementation
function Fireflies() {
  const firefliesRef = useRef<THREE.Group>(null);
  const fireflies = useRef<THREE.Mesh[]>([]);

  useEffect(() => {
    if (!firefliesRef.current) return;

    const fireflyGroup = firefliesRef.current;
    const firefliesArray: THREE.Mesh[] = [];
    const fireflyCount = params.fireflyCount; // Same count on all devices

    for (let i = 0; i < fireflyCount; i++) {
      const fireflyGeometry = new THREE.SphereGeometry(0.02, 2, 2);
      // Use orange glow instead of yellow to match ghost theme
      const fireflyMaterial = new THREE.MeshBasicMaterial({
        color: 0xff6600,
        transparent: true,
        opacity: 0.9,
      });

      const firefly = new THREE.Mesh(fireflyGeometry, fireflyMaterial);
      firefly.position.set(
        (Math.random() - 0.5) * 40,
        (Math.random() - 0.5) * 30,
        (Math.random() - 0.5) * 20
      );

      const glowGeometry = new THREE.SphereGeometry(0.08, 8, 8);
      // Use orange glow instead of yellow
      const glowMaterial = new THREE.MeshBasicMaterial({
        color: 0xff8800,
        transparent: true,
        opacity: 0.4,
        side: THREE.BackSide,
      });
      const glow = new THREE.Mesh(glowGeometry, glowMaterial);
      firefly.add(glow);

      // Use orange light instead of yellow
      const fireflyLight = new THREE.PointLight(0xff6600, 0.8, 3, 2);
      firefly.add(fireflyLight);

      (firefly as any).userData = {
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * params.fireflySpeed,
          (Math.random() - 0.5) * params.fireflySpeed,
          (Math.random() - 0.5) * params.fireflySpeed
        ),
        phase: Math.random() * Math.PI * 2,
        pulseSpeed: 2 + Math.random() * 3,
        glow,
        glowMaterial,
        fireflyMaterial,
        light: fireflyLight,
      };

      fireflyGroup.add(firefly);
      firefliesArray.push(firefly);
    }

    fireflies.current = firefliesArray;

    return () => {
      firefliesArray.forEach((firefly) => {
        firefly.geometry.dispose();
        (firefly.material as THREE.Material).dispose();
      });
    };
  }, []);

  useFrame((state) => {
    const elapsedTime = state.clock.elapsedTime;
    fireflies.current.forEach((firefly) => {
      const userData = (firefly as any).userData;
      const pulsePhase = elapsedTime + userData.phase;
      const pulse = Math.sin(pulsePhase * userData.pulseSpeed) * 0.4 + 0.6;

      userData.glowMaterial.opacity = params.fireflyGlowIntensity * 0.4 * pulse;
      userData.fireflyMaterial.opacity = params.fireflyGlowIntensity * 0.9 * pulse;
      userData.light.intensity = params.fireflyGlowIntensity * 0.8 * pulse;

      userData.velocity.x += (Math.random() - 0.5) * 0.001;
      userData.velocity.y += (Math.random() - 0.5) * 0.001;
      userData.velocity.z += (Math.random() - 0.5) * 0.001;
      userData.velocity.clampLength(0, params.fireflySpeed);

      firefly.position.add(userData.velocity);

      if (Math.abs(firefly.position.x) > 30) userData.velocity.x *= -0.5;
      if (Math.abs(firefly.position.y) > 20) userData.velocity.y *= -0.5;
      if (Math.abs(firefly.position.z) > 15) userData.velocity.z *= -0.5;
    });
  });

  return <group ref={firefliesRef} />;
}

// Particles - CodePen exact implementation
function Particles() {
  const particlesRef = useRef<THREE.Group>(null);
  const particles = useRef<THREE.Mesh[]>([]);
  const particlePool = useRef<THREE.Mesh[]>([]);
  const lastParticleTime = useRef(0);

  const particleGeometries = [
    new THREE.SphereGeometry(0.05, 6, 6),
    new THREE.TetrahedronGeometry(0.04, 0),
    new THREE.OctahedronGeometry(0.045, 0),
  ];

  const particleBaseMaterial = new THREE.MeshBasicMaterial({
    color: fluorescentColors[params.particleColor],
    transparent: true,
    opacity: 0,
    alphaTest: 0.1,
  });

  useEffect(() => {
    if (!particlesRef.current) return;

    // Initialize particle pool
    for (let i = 0; i < 100; i++) {
      const geomIndex = Math.floor(Math.random() * particleGeometries.length);
      const geometry = particleGeometries[geomIndex];
      const material = particleBaseMaterial.clone();
      const particle = new THREE.Mesh(geometry, material);
      particle.visible = false;
      particlesRef.current.add(particle);
      particlePool.current.push(particle);
    }

    return () => {
      particleGeometries.forEach((geom) => geom.dispose());
      particleBaseMaterial.dispose();
    };
  }, []);

  const createParticle = (ghostPosition: THREE.Vector3) => {
    if (!particlesRef.current) return null;

    let particle: THREE.Mesh | null = null;
    if (particlePool.current.length > 0) {
      particle = particlePool.current.pop()!;
      particle.visible = true;
    } else if (particles.current.length < params.particleCount) {
      const geomIndex = Math.floor(Math.random() * particleGeometries.length);
      const geometry = particleGeometries[geomIndex];
      const material = particleBaseMaterial.clone();
      particle = new THREE.Mesh(geometry, material);
      particlesRef.current.add(particle);
    } else {
      return null;
    }

    const particleColor = new THREE.Color(fluorescentColors[params.particleColor]);
    const hue = Math.random() * 0.1 - 0.05;
    particleColor.offsetHSL(hue, 0, 0);
    particle.material.color = particleColor;

    particle.position.copy(ghostPosition);
    particle.position.z -= 0.8 + Math.random() * 0.6;
    const scatterRange = 3.5;
    particle.position.x += (Math.random() - 0.5) * scatterRange;
    particle.position.y += (Math.random() - 0.5) * scatterRange - 0.8;

    const sizeVariation = 0.6 + Math.random() * 0.7;
    particle.scale.set(sizeVariation, sizeVariation, sizeVariation);
    particle.rotation.set(
      Math.random() * Math.PI * 2,
      Math.random() * Math.PI * 2,
      Math.random() * Math.PI * 2
    );

    (particle as any).userData = {
      life: 1.0,
      decay: Math.random() * 0.003 + params.particleDecayRate,
      rotationSpeed: {
        x: (Math.random() - 0.5) * 0.015,
        y: (Math.random() - 0.5) * 0.015,
        z: (Math.random() - 0.5) * 0.015,
      },
      velocity: {
        x: (Math.random() - 0.5) * 0.012,
        y: (Math.random() - 0.5) * 0.012 - 0.002,
        z: (Math.random() - 0.5) * 0.012 - 0.006,
      },
    };

    particle.material.opacity = Math.random() * 0.9;
    particles.current.push(particle);
    return particle;
  };

  useFrame((state, delta) => {
    if (!particlesRef.current) return;

    const elapsedTime = state.clock.elapsedTime;
    const timestamp = elapsedTime * 1000;

    // Create particles periodically
    if (timestamp - lastParticleTime.current > 100) {
      const ghostPosition = new THREE.Vector3(0, 0, 0); // Get from ghost if needed
      for (let i = 0; i < 5; i++) {
        createParticle(ghostPosition);
      }
      lastParticleTime.current = timestamp;
    }

    // Update particles
    for (let i = particles.current.length - 1; i >= 0; i--) {
      const particle = particles.current[i];
      const userData = (particle as any).userData;

      userData.life -= userData.decay;
      particle.material.opacity = userData.life * 0.85;

      if (userData.velocity) {
        particle.position.x += userData.velocity.x;
        particle.position.y += userData.velocity.y;
        particle.position.z += userData.velocity.z;

        const swirl = Math.cos(elapsedTime * 1.8 + particle.position.y) * 0.0008;
        particle.position.x += swirl;
      }

      if (userData.rotationSpeed) {
        particle.rotation.x += userData.rotationSpeed.x;
        particle.rotation.y += userData.rotationSpeed.y;
        particle.rotation.z += userData.rotationSpeed.z;
      }

      if (userData.life <= 0) {
        particle.visible = false;
        particle.material.opacity = 0;
        particlePool.current.push(particle);
        particles.current.splice(i, 1);
      }
    }
  });

  return <group ref={particlesRef} />;
}

export function GhostAnimation() {
  const isMobile = isMobileDevice();
  
  return (
    <div className="relative w-full h-full min-h-[500px] lg:min-h-[600px] flex items-center justify-center" style={{ background: "transparent", backgroundColor: "transparent" }}>
      <Suspense fallback={<div className="w-full h-full flex items-center justify-center text-muted-foreground">Loading ghost...</div>}>
        <Canvas
          camera={{ position: [0, 0, 20], fov: 60 }}
          gl={{
            antialias: true,
            alpha: true,
            powerPreference: "high-performance",
            premultipliedAlpha: false,
            preserveDrawingBuffer: false,
          }}
          style={{ 
            background: "transparent !important", 
            width: "100%", 
            height: "100%",
            backgroundColor: "transparent !important",
            pointerEvents: isMobile ? "none" : "auto"
          }}
          dpr={Math.min(window.devicePixelRatio, 2)}
          onCreated={({ gl, scene }) => {
            gl.setClearColor(0x000000, 0); // Fully transparent background
            gl.clearColor(); // Clear with transparent
            scene.background = null; // Ensure no background
            scene.fog = null; // Remove any fog
            // Force transparent on all devices
            gl.domElement.style.backgroundColor = "transparent";
            gl.domElement.style.background = "transparent";
          }}
          frameloop="always"
        >
          {/* Minimal lighting on mobile - only subtle ambient for ghost visibility, no directional lights */}
          {isMobile ? (
            <ambientLight color={0x0a0a2e} intensity={0.12} />
          ) : (
            <>
              <ambientLight color={0x0a0a2e} intensity={0.08} />
              <directionalLight color={0x4a90e2} intensity={params.rimLightIntensity} position={[-8, 6, -4]} />
              <directionalLight color={0x50e3c2} intensity={params.rimLightIntensity * 0.7} position={[8, -4, -6]} />
            </>
          )}

          {/* Ghost - always visible */}
          <GhostMesh />

          {/* Fireflies - only on desktop to avoid creepy lights on mobile */}
          {!isMobile && <Fireflies />}

          {/* Particles - only on desktop to avoid creepy lights on mobile */}
          {!isMobile && <Particles />}

          {/* Post-processing - minimal bloom on mobile to avoid creepy lights */}
          {!isMobile && (
            <EffectComposer>
              <Bloom 
                intensity={0.3} 
                luminanceThreshold={0.0} 
                luminanceSmoothing={1.25} 
              />
            </EffectComposer>
          )}

          {/* Auto rotate - wider vertical angle to show full ghost */}
          <OrbitControls
            enableZoom={false}
            enablePan={false}
            enableRotate={!isMobile}
            enableDamping={true}
            dampingFactor={0.05}
            autoRotate
            autoRotateSpeed={0.5}
            minPolarAngle={Math.PI / 6}
            maxPolarAngle={Math.PI / 1.1}
            touches={{
              ONE: isMobile ? undefined : THREE.TOUCH.ROTATE,
              TWO: undefined
            }}
          />
        </Canvas>
      </Suspense>
    </div>
  );
}
