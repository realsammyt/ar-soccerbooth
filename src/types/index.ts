/**
 * Type definitions for AR Soccer Booth
 */

// App states
export type AppMode = 'preview' | 'countdown' | 'capturing' | 'uploading' | 'display' | 'error';

// Quality modes for capture optimization
export type QualityMode = 'preview' | 'countdown' | 'capture';

// Pose landmark data
export interface LandmarkPoint {
  x: number;
  y: number;
  z: number;
  visibility?: number;
}

// Pose data from MediaPipe
export interface PoseData {
  poseLandmarks: LandmarkPoint[] | null;
  worldLandmarks: LandmarkPoint[] | null;
  timestamp: number;
}

// Segmentation mask data
export interface SegmentationMask {
  data: Float32Array;
  width: number;
  height: number;
}

// Gesture detection result
export interface GestureResult {
  detected: boolean;
  gesture: 'hand_raise' | 'none';
  confidence: number;
}

// Photo capture result
export interface CaptureResult {
  blob: Blob;
  dataUrl: string;
  width: number;
  height: number;
  timestamp: number;
}

// Upload result from GCS
export interface UploadResult {
  success: boolean;
  publicUrl: string;
  shortUrl: string;
  objectPath: string;
  error?: string;
}

// Photo metadata for admin gallery
export interface PhotoMetadata {
  id: string;
  publicUrl: string;
  shortUrl: string;
  capturedAt: Date;
  kioskId: string;
  objectPath: string;
}

// GCS configuration
export interface GCSConfig {
  bucketName: string;
  projectId: string;
  keyFilePath: string;
  publicUrlBase: string;
}

// URL shortener configuration
export interface URLShortenerConfig {
  provider: 'tinyurl' | 'bitly';
  apiKey?: string;
}

// Kiosk configuration
export interface KioskConfig {
  kioskId: string;
  gcs: GCSConfig;
  urlShortener: URLShortenerConfig;
  countdownDuration: number;
  qrDisplayTimeout: number;
  photoRetentionDays: number;
}
