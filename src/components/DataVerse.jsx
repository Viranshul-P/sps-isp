import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Points, PointMaterial, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

// Enhanced 3D Data Particles with multiple layers
function DataParticles({ count = 8000, color = "#00ff88", speed = 0.05 }) {
  const pointsRef = useRef();
  const { viewport, mouse } = useThree();
  const timeRef = useRef(0);

  // Generate random positions for the particles with more complex distribution
  const particles = useMemo(() => {
    const temp = [];
    const t = Math.random() * 100;
    const f = 0.002;
    const a = 4;
    
    const graph = (x, z, time) => {
      // More complex wave function for data visualization
      return Math.sin(f * (x ** 2 + z ** 2 + time)) * a + 
             Math.cos(f * 0.5 * (x + z + time)) * (a * 0.5);
    };

    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * viewport.width * 3;
      const z = (Math.random() - 0.5) * viewport.height * 3;
      const y = graph(x, z, t);
      temp.push(x, y, z);
    }
    return new Float32Array(temp);
  }, [count, viewport.width, viewport.height]);

  // Enhanced animation with time-based effects
  useFrame((state, delta) => {
    timeRef.current += delta;
    
    if (pointsRef.current) {
      // Slow rotation with time-based variation
      pointsRef.current.rotation.y += delta * speed;
      pointsRef.current.rotation.x = Math.sin(timeRef.current * 0.1) * 0.1;

      // Enhanced mouse interaction
      const positions = pointsRef.current.geometry.attributes.position.array;
      const targetX = mouse.x * viewport.width * 1.5;
      const targetY = mouse.y * viewport.height * 1.5;

      for (let i = 0; i < positions.length; i += 3) {
        const x = positions[i];
        const y = positions[i + 1];
        const z = positions[i + 2];

        // Calculate distance from mouse with 3D consideration
        const dist = Math.sqrt((x - targetX) ** 2 + (y - targetY) ** 2);

        // Enhanced interaction: particles move away and glow when mouse is near
        if (dist < 2.0) {
          const pushStrength = (2.0 - dist) / 2.0;
          positions[i + 2] = THREE.MathUtils.lerp(
            positions[i + 2], 
            positions[i + 2] + pushStrength * 2, 
            0.05
          );
        } else {
          // Return to original position with wave effect
          const originalZ = particles[i + 2];
          const waveOffset = Math.sin(timeRef.current + i * 0.01) * 0.5;
          positions[i + 2] = THREE.MathUtils.lerp(
            positions[i + 2], 
            originalZ + waveOffset, 
            0.03
          );
        }
      }
      pointsRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <Points ref={pointsRef} positions={particles} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color={color}
        size={0.02}
        sizeAttenuation={true}
        depthWrite={false}
        opacity={0.8}
      />
    </Points>
  );
}

// Secondary particle layer for depth
function SecondaryParticles({ count = 3000 }) {
  return <DataParticles count={count} color="#00aaff" speed={0.03} />;
}

// Tertiary particle layer for atmosphere
function TertiaryParticles({ count = 2000 }) {
  return <DataParticles count={count} color="#ff3366" speed={0.08} />;
}

// Main wrapper with enhanced 3D scene
export default function DataVerse() {
  return (
    <div className="data-verse-container">
      <Canvas 
        camera={{ position: [0, 0, 8], fov: 75 }}
        gl={{ alpha: true, antialias: true }}
      >
        {/* Ambient lighting for better visibility */}
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={0.5} color="#00ff88" />
        <pointLight position={[-10, -10, -10]} intensity={0.3} color="#00aaff" />
        
        {/* Multiple particle layers for depth */}
        <DataParticles count={6000} />
        <SecondaryParticles />
        <TertiaryParticles />
        
        {/* Subtle camera controls for interactivity */}
        <OrbitControls 
          enableZoom={false}
          enablePan={false}
          autoRotate
          autoRotateSpeed={0.2}
          minPolarAngle={Math.PI / 3}
          maxPolarAngle={Math.PI / 1.5}
        />
      </Canvas>
    </div>
  );
}