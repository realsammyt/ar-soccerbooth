import type { BoneConnection } from '../types/avatar';

/**
 * MediaPipe Pose Landmark indices
 */
export const LANDMARK = {
  NOSE: 0,
  LEFT_EYE_INNER: 1,
  LEFT_EYE: 2,
  LEFT_EYE_OUTER: 3,
  RIGHT_EYE_INNER: 4,
  RIGHT_EYE: 5,
  RIGHT_EYE_OUTER: 6,
  LEFT_EAR: 7,
  RIGHT_EAR: 8,
  MOUTH_LEFT: 9,
  MOUTH_RIGHT: 10,
  LEFT_SHOULDER: 11,
  RIGHT_SHOULDER: 12,
  LEFT_ELBOW: 13,
  RIGHT_ELBOW: 14,
  LEFT_WRIST: 15,
  RIGHT_WRIST: 16,
  LEFT_PINKY: 17,
  RIGHT_PINKY: 18,
  LEFT_INDEX: 19,
  RIGHT_INDEX: 20,
  LEFT_THUMB: 21,
  RIGHT_THUMB: 22,
  LEFT_HIP: 23,
  RIGHT_HIP: 24,
  LEFT_KNEE: 25,
  RIGHT_KNEE: 26,
  LEFT_ANKLE: 27,
  RIGHT_ANKLE: 28,
  LEFT_HEEL: 29,
  RIGHT_HEEL: 30,
  LEFT_FOOT_INDEX: 31,
  RIGHT_FOOT_INDEX: 32,
} as const;

/**
 * Skeleton bone connections defining the avatar structure
 */
export const SKELETON_CONNECTIONS: BoneConnection[] = [
  // Torso (red/coral)
  { start: 11, end: 12, name: 'shoulders', color: '#ff6b6b', radius: 0.04 },
  { start: 11, end: 23, name: 'left_torso', color: '#ff6b6b', radius: 0.05 },
  { start: 12, end: 24, name: 'right_torso', color: '#ff6b6b', radius: 0.05 },
  { start: 23, end: 24, name: 'hips', color: '#ff6b6b', radius: 0.04 },

  // Left arm (cyan/teal)
  { start: 11, end: 13, name: 'left_upper_arm', color: '#4ecdc4', radius: 0.04 },
  { start: 13, end: 15, name: 'left_forearm', color: '#4ecdc4', radius: 0.035 },
  { start: 15, end: 19, name: 'left_hand', color: '#4ecdc4', radius: 0.025 },

  // Right arm (blue)
  { start: 12, end: 14, name: 'right_upper_arm', color: '#45b7d1', radius: 0.04 },
  { start: 14, end: 16, name: 'right_forearm', color: '#45b7d1', radius: 0.035 },
  { start: 16, end: 20, name: 'right_hand', color: '#45b7d1', radius: 0.025 },

  // Left leg (yellow/gold)
  { start: 23, end: 25, name: 'left_thigh', color: '#f9d56e', radius: 0.05 },
  { start: 25, end: 27, name: 'left_shin', color: '#f9d56e', radius: 0.04 },
  { start: 27, end: 31, name: 'left_foot', color: '#f9d56e', radius: 0.03 },

  // Right leg (orange)
  { start: 24, end: 26, name: 'right_thigh', color: '#ff8a5b', radius: 0.05 },
  { start: 26, end: 28, name: 'right_shin', color: '#ff8a5b', radius: 0.04 },
  { start: 28, end: 32, name: 'right_foot', color: '#ff8a5b', radius: 0.03 },

  // Head/neck (purple)
  { start: 0, end: 11, name: 'left_neck', color: '#9b59b6', radius: 0.03 },
  { start: 0, end: 12, name: 'right_neck', color: '#9b59b6', radius: 0.03 },
];

/**
 * Joint radii by landmark index (differentiated by body part)
 */
export const JOINT_RADII: Record<number, number> = {
  // Head
  0: 0.10,   // Nose (head sphere)

  // Shoulders
  11: 0.07,
  12: 0.07,

  // Elbows
  13: 0.05,
  14: 0.05,

  // Wrists
  15: 0.045,
  16: 0.045,

  // Hands (fingers)
  17: 0.03, 18: 0.03, 19: 0.035, 20: 0.035, 21: 0.03, 22: 0.03,

  // Hips
  23: 0.07,
  24: 0.07,

  // Knees
  25: 0.06,
  26: 0.06,

  // Ankles
  27: 0.05,
  28: 0.05,

  // Feet
  29: 0.04, 30: 0.04, 31: 0.04, 32: 0.04,
};

export const DEFAULT_JOINT_RADIUS = 0.04;

/**
 * Get joint radius for a given landmark index
 */
export function getJointRadius(landmarkIndex: number): number {
  return JOINT_RADII[landmarkIndex] ?? DEFAULT_JOINT_RADIUS;
}

/**
 * Get joint color based on body part grouping
 */
export function getJointColor(landmarkIndex: number): string {
  // Head (purple)
  if (landmarkIndex <= 10) return '#9b59b6';

  // Shoulders (coral)
  if (landmarkIndex === 11 || landmarkIndex === 12) return '#ff6b6b';

  // Left arm (cyan)
  if (landmarkIndex === 13 || landmarkIndex === 15 || landmarkIndex === 17 || landmarkIndex === 19 || landmarkIndex === 21) {
    return '#4ecdc4';
  }

  // Right arm (blue)
  if (landmarkIndex === 14 || landmarkIndex === 16 || landmarkIndex === 18 || landmarkIndex === 20 || landmarkIndex === 22) {
    return '#45b7d1';
  }

  // Hips (coral)
  if (landmarkIndex === 23 || landmarkIndex === 24) return '#ff6b6b';

  // Left leg (yellow)
  if (landmarkIndex === 25 || landmarkIndex === 27 || landmarkIndex === 29 || landmarkIndex === 31) {
    return '#f9d56e';
  }

  // Right leg (orange)
  if (landmarkIndex === 26 || landmarkIndex === 28 || landmarkIndex === 30 || landmarkIndex === 32) {
    return '#ff8a5b';
  }

  return '#ffffff';
}

/**
 * Key joints to render (excludes face landmarks except nose)
 */
export const KEY_JOINT_INDICES = [
  0,                    // Nose (head)
  11, 12,              // Shoulders
  13, 14,              // Elbows
  15, 16,              // Wrists
  19, 20,              // Index fingers (hand tips)
  23, 24,              // Hips
  25, 26,              // Knees
  27, 28,              // Ankles
  31, 32,              // Foot tips
];
