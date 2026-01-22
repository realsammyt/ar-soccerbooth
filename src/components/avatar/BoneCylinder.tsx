import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface BoneCylinderProps {
  startPosition: THREE.Vector3;
  endPosition: THREE.Vector3;
  radius: number;
  color: string;
  lerpFactor?: number;
}

/**
 * Renders a bone as a cylinder connecting two joints
 * Handles rotation to align cylinder with bone direction
 */
export function BoneCylinder({
  startPosition,
  endPosition,
  radius,
  color,
  lerpFactor = 0.25,
}: BoneCylinderProps) {
  const meshRef = useRef<THREE.Mesh>(null);

  // Smoothed positions
  const smoothedStart = useRef(startPosition.clone());
  const smoothedEnd = useRef(endPosition.clone());

  // Reusable vectors to avoid allocations
  const tempDirection = useMemo(() => new THREE.Vector3(), []);
  const tempCenter = useMemo(() => new THREE.Vector3(), []);
  const upVector = useMemo(() => new THREE.Vector3(0, 1, 0), []);
  const quaternion = useMemo(() => new THREE.Quaternion(), []);

  useFrame(() => {
    if (!meshRef.current) return;

    // Smooth position interpolation
    smoothedStart.current.lerp(startPosition, lerpFactor);
    smoothedEnd.current.lerp(endPosition, lerpFactor);

    // Calculate bone properties
    tempDirection.subVectors(smoothedEnd.current, smoothedStart.current);
    const length = tempDirection.length();

    if (length < 0.001) return; // Skip if too short

    // Center position
    tempCenter.addVectors(smoothedStart.current, smoothedEnd.current).multiplyScalar(0.5);
    meshRef.current.position.copy(tempCenter);

    // Calculate rotation to align cylinder with bone direction
    tempDirection.normalize();
    quaternion.setFromUnitVectors(upVector, tempDirection);
    meshRef.current.quaternion.copy(quaternion);

    // Scale cylinder to match bone length
    meshRef.current.scale.set(1, length, 1);
  });

  return (
    <mesh ref={meshRef}>
      <cylinderGeometry args={[radius, radius, 1, 8]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={0.15}
        roughness={0.4}
        metalness={0.5}
      />
    </mesh>
  );
}
