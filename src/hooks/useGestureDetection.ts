import { useEffect, useRef } from 'react';
import { usePoseStore } from '../store/poseStore';
import type { GestureResult, LandmarkPoint } from '../types';

// MediaPipe Pose landmark indices
const LANDMARK = {
  LEFT_WRIST: 15,
  RIGHT_WRIST: 16,
  LEFT_SHOULDER: 11,
  RIGHT_SHOULDER: 12,
} as const;

// Gesture detection configuration
const GESTURE_CONFIG = {
  // Hand must be above shoulder by this margin (in normalized coordinates)
  HAND_RAISE_THRESHOLD: 0.15,
  // Minimum visibility confidence
  MIN_VISIBILITY: 0.5,
  // Detection cooldown (ms)
  COOLDOWN_MS: 3000,
  // Required hold time (ms)
  HOLD_TIME_MS: 500,
};

/**
 * Detect hand-raise gesture from pose landmarks
 */
function detectHandRaise(landmarks: LandmarkPoint[] | null): GestureResult {
  if (!landmarks || landmarks.length < 17) {
    return { detected: false, gesture: 'none', confidence: 0 };
  }

  const leftWrist = landmarks[LANDMARK.LEFT_WRIST];
  const rightWrist = landmarks[LANDMARK.RIGHT_WRIST];
  const leftShoulder = landmarks[LANDMARK.LEFT_SHOULDER];
  const rightShoulder = landmarks[LANDMARK.RIGHT_SHOULDER];

  // Check visibility
  const minVis = GESTURE_CONFIG.MIN_VISIBILITY;
  const leftVisible = (leftWrist.visibility ?? 0) > minVis && (leftShoulder.visibility ?? 0) > minVis;
  const rightVisible = (rightWrist.visibility ?? 0) > minVis && (rightShoulder.visibility ?? 0) > minVis;

  if (!leftVisible && !rightVisible) {
    return { detected: false, gesture: 'none', confidence: 0 };
  }

  // Check if either hand is raised above shoulder level
  const threshold = GESTURE_CONFIG.HAND_RAISE_THRESHOLD;
  const shoulderY = (leftShoulder.y + rightShoulder.y) / 2;

  const leftRaised = leftVisible && leftWrist.y < (shoulderY - threshold);
  const rightRaised = rightVisible && rightWrist.y < (shoulderY - threshold);

  // Calculate confidence based on how high the hand is raised
  let confidence = 0;
  if (leftRaised) {
    confidence = Math.max(confidence, (shoulderY - leftWrist.y) / 0.3);
  }
  if (rightRaised) {
    confidence = Math.max(confidence, (shoulderY - rightWrist.y) / 0.3);
  }
  confidence = Math.min(confidence, 1);

  return {
    detected: leftRaised || rightRaised,
    gesture: leftRaised || rightRaised ? 'hand_raise' : 'none',
    confidence,
  };
}

/**
 * Custom hook for gesture detection with hold time and cooldown
 */
export function useGestureDetection() {
  const lastTriggerTimeRef = useRef<number>(0);
  const holdStartTimeRef = useRef<number | null>(null);

  const poseData = usePoseStore((s) => s.poseData);
  const setGestureResult = usePoseStore((s) => s.setGestureResult);

  useEffect(() => {
    if (!poseData?.poseLandmarks) {
      setGestureResult({ detected: false, gesture: 'none', confidence: 0 });
      holdStartTimeRef.current = null;
      return;
    }

    const now = Date.now();

    // Check cooldown
    if (now - lastTriggerTimeRef.current < GESTURE_CONFIG.COOLDOWN_MS) {
      return;
    }

    // Detect gesture
    const result = detectHandRaise(poseData.poseLandmarks);

    if (result.detected) {
      // Start hold timer if not already started
      if (holdStartTimeRef.current === null) {
        holdStartTimeRef.current = now;
      }

      // Check if held long enough
      const holdDuration = now - holdStartTimeRef.current;
      if (holdDuration >= GESTURE_CONFIG.HOLD_TIME_MS) {
        // Trigger gesture and start cooldown
        setGestureResult(result);
        lastTriggerTimeRef.current = now;
        holdStartTimeRef.current = null;
      }
    } else {
      // Reset hold timer
      holdStartTimeRef.current = null;
      setGestureResult({ detected: false, gesture: 'none', confidence: 0 });
    }
  }, [poseData, setGestureResult]);
}
