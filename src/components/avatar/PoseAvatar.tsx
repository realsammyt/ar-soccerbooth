import { usePoseStore } from '../../store/poseStore';
import { SkeletonAvatar } from './SkeletonAvatar';
import type { PoseAvatarProps } from '../../types/avatar';

/**
 * Main avatar component that renders a pose-driven 3D character
 *
 * Uses worldLandmarks from MediaPipe for accurate 3D positioning
 */
export function PoseAvatar({
  avatarType = 'skeleton',
  scale = 1.0,
  position = [0, 0, 0],
  visibilityThreshold = 0.5,
}: PoseAvatarProps) {
  const poseData = usePoseStore((s) => s.poseData);
  const isTracking = usePoseStore((s) => s.isTracking);

  // Only render when tracking and have world landmarks
  if (!isTracking || !poseData?.worldLandmarks) {
    return null;
  }

  return (
    <group position={position}>
      {avatarType === 'skeleton' && (
        <SkeletonAvatar
          landmarks={poseData.worldLandmarks}
          visibilityThreshold={visibilityThreshold}
          scale={scale}
        />
      )}
    </group>
  );
}
