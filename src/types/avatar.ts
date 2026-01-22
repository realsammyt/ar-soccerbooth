import type * as THREE from 'three';

/**
 * Avatar-specific type definitions for pose-driven 3D skeleton
 */

export interface Joint {
  position: THREE.Vector3;
  radius: number;
  color: string;
  landmarkIndex: number;
  visibility: number;
}

export interface Bone {
  start: THREE.Vector3;
  end: THREE.Vector3;
  radius: number;
  color: string;
  startIndex: number;
  endIndex: number;
  length: number;
}

export interface SkeletonData {
  joints: Joint[];
  connections: Bone[];
  timestamp: number;
}

export interface BoneConnection {
  start: number;      // Landmark index
  end: number;        // Landmark index
  name: string;
  color: string;
  radius: number;
}

export type AvatarType = 'skeleton' | 'glb';

export interface PoseAvatarProps {
  avatarType?: AvatarType;
  scale?: number;
  position?: [number, number, number];
  visibilityThreshold?: number;
  showDebugLandmarks?: boolean;
}
