import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';

// This is the main 3D component
function DataParticles({ count = 5000 }) {
  const pointsRef = useRef();
  const { viewport, mouse } = useThree();

  // Generate random positions for the particles
  const particles = useMemo(() => {
    const temp = [];
    const t = Math.random() * 100;
    const f = 0.002;
    const a = 3;
    const graph = (x, z) => {
      // This creates a cool, wavy "data plane"
      return Math.sin(f * (x ** 2 + z ** 2 + t)) * a;
    };

    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * viewport.width * 2;
      const z = (Math.random() - 0.5) * viewport.height * 2;
      const y = graph(x, z);
      temp.push(x, y, z);
    }
    return new Float32Array(temp);
  }, [count, viewport.width, viewport.height]);

  // This hook runs on every frame
  useFrame((state, delta) => {
    // Make the particles slowly rotate
    if (pointsRef.current) {
        pointsRef.current.rotation.y += delta * 0.05;

        // Make the particles react to the mouse
        const positions = pointsRef.current.geometry.attributes.position.array;
        const targetX = mouse.x * viewport.width / 2;
        const targetY = mouse.y * viewport.height / 2;

        for (let i = 0; i < positions.length; i += 3) {
        const x = positions[i];
        const y = positions[i + 1];

        // Calculate distance from mouse
        const dist = Math.sqrt((x - targetX) ** 2 + (y - targetY) ** 2);

        // If close to the mouse, "push" the particle up (on the z-axis)
        if (dist < 1.5) {
            // Use lerp for a smooth animation
            positions[i + 2] = THREE.MathUtils.lerp(positions[i + 2], 3.0, 0.03); 
        } else {
            // Otherwise, return to original z-position
            const originalZ = particles[i + 2];
            positions[i + 2] = THREE.MathUtils.lerp(positions[i + 2], originalZ, 0.05);
        }
        }
        pointsRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <Points ref={pointsRef} positions={particles} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color="#00ff41" // Matrix green
        size={0.015}
        sizeAttenuation={true}
        depthWrite={false}
      />
    </Points>
  );
}

// This is the wrapper component that holds the 3D canvas
export default function DataVerse() {
  return (
    <div className="data-verse-container">
      <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
        <DataParticles />
      </Canvas>
    </div>
  );
}