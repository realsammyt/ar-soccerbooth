import { useEffect, useRef, useCallback } from 'react';
import {
  PoseLandmarker,
  FilesetResolver,
} from '@mediapipe/tasks-vision';
import { useAppStore } from '../store/appStore';
import { usePoseStore } from '../store/poseStore';
import type { LandmarkPoint } from '../types';
import { QUALITY_MODES } from '../constants/display';

// MediaPipe model paths
const WASM_PATH = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.8/wasm';
const MODEL_PATH = 'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task';

/**
 * Custom hook for MediaPipe Pose Landmarker with quality mode support
 * Adjusts frame rate based on app mode (preview vs countdown/capture)
 */
export function usePoseLandmarker() {
  const landmarkerRef = useRef<PoseLandmarker | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const animationRef = useRef<number>(0);
  const lastFrameTimeRef = useRef<number>(0);

  // Store state
  const setCameraReady = useAppStore((s) => s.setCameraReady);
  const setPoseTrackerReady = useAppStore((s) => s.setPoseTrackerReady);
  const setError = useAppStore((s) => s.setError);
  const qualityMode = useAppStore((s) => s.qualityMode);

  const setPoseData = usePoseStore((s) => s.setPoseData);
  const setSegmentationMask = usePoseStore((s) => s.setSegmentationMask);
  const setIsTracking = usePoseStore((s) => s.setIsTracking);
  const isFrozen = usePoseStore((s) => s.isFrozen);

  // Get target FPS based on quality mode
  const getTargetFPS = useCallback(() => {
    switch (qualityMode) {
      case 'capture':
        return QUALITY_MODES.CAPTURE.poseFPS;
      case 'countdown':
        return QUALITY_MODES.COUNTDOWN.poseFPS;
      default:
        return QUALITY_MODES.PREVIEW.poseFPS;
    }
  }, [qualityMode]);

  // Initialize MediaPipe
  useEffect(() => {
    let mounted = true;

    const initLandmarker = async () => {
      try {
        console.log('Initializing MediaPipe Pose Landmarker...');

        // Load WASM and create landmarker
        const vision = await FilesetResolver.forVisionTasks(WASM_PATH);

        const landmarker = await PoseLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: MODEL_PATH,
            delegate: 'GPU',
          },
          runningMode: 'VIDEO',
          numPoses: 1,
          minPoseDetectionConfidence: 0.5,
          minPosePresenceConfidence: 0.5,
          minTrackingConfidence: 0.5,
          outputSegmentationMasks: true,
        });

        if (!mounted) {
          landmarker.close();
          return;
        }

        landmarkerRef.current = landmarker;
        setPoseTrackerReady(true);
        console.log('MediaPipe Pose Landmarker initialized');
      } catch (error) {
        console.error('Failed to initialize MediaPipe:', error);
        if (mounted) {
          setError(`MediaPipe initialization failed: ${error}`);
        }
      }
    };

    initLandmarker();

    return () => {
      mounted = false;
      if (landmarkerRef.current) {
        landmarkerRef.current.close();
        landmarkerRef.current = null;
      }
    };
  }, [setPoseTrackerReady, setError]);

  // Initialize camera
  useEffect(() => {
    let mounted = true;
    let stream: MediaStream | null = null;

    const initCamera = async () => {
      try {
        console.log('Requesting camera access...');

        // Request portrait-optimized camera
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'user',
            width: { ideal: 1080 },
            height: { ideal: 1920 },
            frameRate: { ideal: 30 },
          },
          audio: false,
        });

        if (!mounted) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        // Create video element
        const video = document.createElement('video');
        video.srcObject = stream;
        video.autoplay = true;
        video.playsInline = true;
        video.muted = true;

        // Style for portrait background display
        video.style.position = 'absolute';
        video.style.top = '50%';
        video.style.left = '50%';
        video.style.transform = 'translate(-50%, -50%) scaleX(-1)';
        video.style.minWidth = '100%';
        video.style.minHeight = '100%';
        video.style.width = 'auto';
        video.style.height = 'auto';
        video.style.objectFit = 'cover';
        video.style.zIndex = '0';

        document.body.appendChild(video);
        videoRef.current = video;

        await video.play();

        setCameraReady(true);
        console.log(`Camera ready: ${video.videoWidth}x${video.videoHeight}`);
      } catch (error) {
        console.error('Camera access failed:', error);
        if (mounted) {
          setError(`Camera access denied: ${error}`);
        }
      }
    };

    initCamera();

    return () => {
      mounted = false;
      if (stream) {
        stream.getTracks().forEach((t) => t.stop());
      }
      if (videoRef.current) {
        videoRef.current.remove();
        videoRef.current = null;
      }
    };
  }, [setCameraReady, setError]);

  // Pose detection loop
  useEffect(() => {
    if (!landmarkerRef.current || !videoRef.current) return;

    const video = videoRef.current;
    const landmarker = landmarkerRef.current;

    const detectPose = (timestamp: number) => {
      // Skip if frozen (during capture)
      if (isFrozen) {
        animationRef.current = requestAnimationFrame(detectPose);
        return;
      }

      // Throttle based on quality mode
      const targetFPS = getTargetFPS();
      if (targetFPS > 0) {
        const frameInterval = 1000 / targetFPS;
        if (timestamp - lastFrameTimeRef.current < frameInterval) {
          animationRef.current = requestAnimationFrame(detectPose);
          return;
        }
      }
      lastFrameTimeRef.current = timestamp;

      if (video.readyState >= 2) {
        try {
          const result = landmarker.detectForVideo(video, timestamp);

          if (result.landmarks && result.landmarks.length > 0) {
            // Mirror X coordinates for selfie view
            const mirroredLandmarks: LandmarkPoint[] = result.landmarks[0].map((lm) => ({
              x: 1 - lm.x,
              y: lm.y,
              z: lm.z,
              visibility: lm.visibility,
            }));

            const mirroredWorldLandmarks: LandmarkPoint[] | null = result.worldLandmarks?.[0]?.map((lm) => ({
              x: -lm.x,
              y: lm.y,
              z: lm.z,
              visibility: lm.visibility,
            })) || null;

            setPoseData({
              poseLandmarks: mirroredLandmarks,
              worldLandmarks: mirroredWorldLandmarks,
              timestamp,
            });

            setIsTracking(true);

            // Handle segmentation mask
            if (result.segmentationMasks && result.segmentationMasks.length > 0) {
              const mask = result.segmentationMasks[0];
              if (mask && 'getAsFloat32Array' in mask) {
                const maskData = (mask as any).getAsFloat32Array();
                setSegmentationMask({
                  data: maskData,
                  width: mask.width,
                  height: mask.height,
                });
              }
            }
          } else {
            setIsTracking(false);
          }
        } catch (error) {
          console.error('Pose detection error:', error);
        }
      }

      animationRef.current = requestAnimationFrame(detectPose);
    };

    animationRef.current = requestAnimationFrame(detectPose);

    return () => {
      cancelAnimationFrame(animationRef.current);
    };
  }, [isFrozen, getTargetFPS, setPoseData, setSegmentationMask, setIsTracking]);

  return {
    videoRef,
    landmarkerRef,
  };
}
