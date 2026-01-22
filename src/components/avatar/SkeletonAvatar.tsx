import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { JointSphere } from './JointSphere';
import { BoneCylinder } from './BoneCylinder';
import { SKELETON_CONNECTIONS, KEY_JOINT_INDICES, getJointRadius, getJointColor } from '../../utils/skeletonConfig';
import type { LandmarkPoint } from '../../types';

interface SkeletonAvatarProps {
  landmarks: LandmarkPoint[];
  visibilityThreshold: number;
  scale?: number;
}

// Scale factor to convert MediaPipe world coordinates to scene coordinates
const WORLD_SCALE = 2.5;

/**
 * Converts MediaPipe world landmark to Three.js scene position
 */
function landmarkToScene(landmark: LandmarkPoint): THREE.Vector3 {
  // MediaPipe world landmarks are in meters
  // X: horizontal (already mirrored in usePoseLandmarker)
  // Y: vertical (MediaPipe uses -Y down, we flip)
  // Z: depth
  return new THREE.Vector3(
    landmark.x * WORLD_SCALE,
    -landmark.y * WORLD_SCALE,
    -landmark.z * WORLD_SCALE
  );
}

/**
 * Renders a stick-figure skeleton avatar driven by pose landmarks
 */
export function SkeletonAvatar({
  landmarks,
  visibilityThreshold,
  scale = 1.0,
}: SkeletonAvatarProps) {
  // Cache Vector3 instances for each landmark to avoid allocations
  const positionsRef = useRef<Map<number, THREE.Vector3>>(new Map());

  // Initialize position cache
  useMemo(() => {
    for (let i = 0; i < 33; i++) {
      positionsRef.current.set(i, new THREE.Vector3());
    }
  }, []);

  // Update positions each frame
  useFrame(() => {
    if (!landmarks || landmarks.length < 33) return;

    landmarks.forEach((lm, i) => {
      const pos = positionsRef.current.get(i);
      if (pos && (lm.visibility ?? 0) >= visibilityThreshold) {
        const newPos = landmarkToScene(lm);
        pos.lerp(newPos, 0.3);
      }
    });
  });

  // Filter visible joints
  const visibleJoints = useMemo(() => {
    if (!landmarks || landmarks.length < 33) return [];

    return KEY_JOINT_INDICES.filter((idx) => {
      const lm = landmarks[idx];
      return lm && (lm.visibility ?? 0) >= visibilityThreshold;
    }).map((idx) => ({
      index: idx,
      position: landmarkToScene(landmarks[idx]),
      radius: getJointRadius(idx) * scale,
      color: getJointColor(idx),
    }));
  }, [landmarks, visibilityThreshold, scale]);

  // Filter visible bones
  const visibleBones = useMemo(() => {
    if (!landmarks || landmarks.length < 33) return [];

    return SKELETON_CONNECTIONS.filter((conn) => {
      const startLm = landmarks[conn.start];
      const endLm = landmarks[conn.end];
      return (
        startLm && endLm &&
        (startLm.visibility ?? 0) >= visibilityThreshold &&
        (endLm.visibility ?? 0) >= visibilityThreshold
      );
    }).map((conn) => ({
      ...conn,
      startPosition: landmarkToScene(landmarks[conn.start]),
      endPosition: landmarkToScene(landmarks[conn.end]),
      radius: conn.radius * scale,
    }));
  }, [landmarks, visibilityThreshold, scale]);

  if (!landmarks || landmarks.length < 33) return null;

  return (
    <group scale={[1, 1, 1]}>
      {/* Render bones first (behind joints) */}
      {visibleBones.map((bone, i) => (
        <BoneCylinder
          key={`bone-${bone.name}-${i}`}
          startPosition={bone.startPosition}
          endPosition={bone.endPosition}
          radius={bone.radius}
          color={bone.color}
        />
      ))}

      {/* Render joints on top */}
      {visibleJoints.map((joint) => (
        <JointSphere
          key={`joint-${joint.index}`}
          targetPosition={joint.position}
          radius={joint.radius}
          color={joint.color}
        />
      ))}
    </group>
  );
}
