import { create } from 'zustand';
import type { PoseData, SegmentationMask, GestureResult } from '../types';

interface PoseState {
  // Pose tracking data
  poseData: PoseData | null;
  setPoseData: (data: PoseData | null) => void;

  // Segmentation mask for background removal
  segmentationMask: SegmentationMask | null;
  setSegmentationMask: (mask: SegmentationMask | null) => void;

  // Gesture detection result
  gestureResult: GestureResult;
  setGestureResult: (result: GestureResult) => void;

  // Tracking state
  isTracking: boolean;
  setIsTracking: (tracking: boolean) => void;

  // Freeze tracking (during final capture)
  isFrozen: boolean;
  setIsFrozen: (frozen: boolean) => void;

  // Clear all pose data
  clearPoseData: () => void;
}

export const usePoseStore = create<PoseState>((set) => ({
  poseData: null,
  setPoseData: (data) => set({ poseData: data }),

  segmentationMask: null,
  setSegmentationMask: (mask) => set({ segmentationMask: mask }),

  gestureResult: { detected: false, gesture: 'none', confidence: 0 },
  setGestureResult: (result) => set({ gestureResult: result }),

  isTracking: false,
  setIsTracking: (tracking) => set({ isTracking: tracking }),

  isFrozen: false,
  setIsFrozen: (frozen) => set({ isFrozen: frozen }),

  clearPoseData: () => set({
    poseData: null,
    segmentationMask: null,
    gestureResult: { detected: false, gesture: 'none', confidence: 0 },
  }),
}));
