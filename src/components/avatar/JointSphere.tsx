import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface JointSphereProps {
  targetPosition: THREE.Vector3;
  radius: number;
  color: string;
  lerpFactor?: number;
}

/**
 * Renders a single joint as a glowing sphere with smooth position interpolation
 */
export function JointSphere({
  targetPosition,
  radius,
  color,
  lerpFactor = 0.25,
}: JointSphereProps) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (!meshRef.current) return;
    // Smooth position interpolation
    meshRef.current.position.lerp(targetPosition, lerpFactor);
  });

  return (
    <mesh ref={meshRef} position={targetPosition.clone()}>
      <sphereGeometry args={[radius, 16, 16]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={0.3}
        roughness={0.3}
        metalness={0.7}
      />
    </mesh>
  );
}
