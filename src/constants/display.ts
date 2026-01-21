/**
 * Portrait display constants for 9:16 aspect ratio
 */

// Fixed canvas dimensions
export const CANVAS_WIDTH = 1080;
export const CANVAS_HEIGHT = 1920;
export const ASPECT_RATIO = CANVAS_WIDTH / CANVAS_HEIGHT; // 0.5625

// Export quality settings
export const EXPORT_QUALITY = {
  JPEG: 0.95,
  PNG: 1.0,
} as const;

// Capture quality modes
export const QUALITY_MODES = {
  PREVIEW: {
    poseFPS: 30,
    renderScale: 1.0,
    antialias: true,
  },
  COUNTDOWN: {
    poseFPS: 15,
    renderScale: 1.5, // Supersampling
    antialias: true,
  },
  CAPTURE: {
    poseFPS: 0, // Freeze tracking
    renderScale: 2.0, // High supersampling
    antialias: true,
  },
} as const;

// Countdown settings
export const COUNTDOWN = {
  DURATION_SECONDS: 3,
  FREEZE_BEFORE_CAPTURE_MS: 500, // Freeze tracking 500ms before capture
} as const;

// Display timeout after capture (return to preview)
export const QR_DISPLAY_TIMEOUT_MS = 25000; // 25 seconds

// Z-index layering
export const Z_INDEX = {
  VIDEO_BACKGROUND: 0,
  R3F_SCENE: 1,
  SKELETON_OVERLAY: 5,
  UI_CONTROLS: 10,
  COUNTDOWN: 100,
  QR_DISPLAY: 200,
  ERROR_OVERLAY: 500,
  MODAL: 1000,
} as const;
