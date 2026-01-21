import { useEffect, useCallback, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { useAppStore } from './store/appStore';
import { usePoseStore } from './store/poseStore';
import { usePhotoStore } from './store/photoStore';
import { usePoseLandmarker } from './hooks/usePoseLandmarker';
import { useGestureDetection } from './hooks/useGestureDetection';
import { useCountdown } from './hooks/useCountdown';
import { useCapture } from './hooks/useCapture';
import { StadiumScene } from './components/StadiumScene';
import { CountdownOverlay } from './components/CountdownOverlay';
import { QRDisplay } from './components/QRDisplay';
import { StatusBar } from './components/StatusBar';
import { GestureInstruction } from './components/GestureInstruction';
import { ErrorDisplay } from './components/ErrorDisplay';
import { CANVAS_WIDTH, CANVAS_HEIGHT, QR_DISPLAY_TIMEOUT_MS } from './constants/display';

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const captureCanvasRef = useRef<HTMLCanvasElement>(null);

  // App state
  const mode = useAppStore((s) => s.mode);
  const setMode = useAppStore((s) => s.setMode);
  const error = useAppStore((s) => s.error);
  const resetToPreview = useAppStore((s) => s.resetToPreview);
  const cameraReady = useAppStore((s) => s.cameraReady);
  const poseTrackerReady = useAppStore((s) => s.poseTrackerReady);

  // Pose state
  const gestureResult = usePoseStore((s) => s.gestureResult);
  const setIsFrozen = usePoseStore((s) => s.setIsFrozen);

  // Photo state
  const qrCodeDataUrl = usePhotoStore((s) => s.qrCodeDataUrl);
  const shortUrl = usePhotoStore((s) => s.shortUrl);
  const clearPhoto = usePhotoStore((s) => s.clearPhoto);

  // Initialize pose landmarker
  usePoseLandmarker();

  // Gesture detection hook
  useGestureDetection();

  // Countdown hook
  const { startCountdown, countdownValue } = useCountdown();

  // Capture hook
  const { capturePhoto } = useCapture(captureCanvasRef);

  // Handle gesture detection -> start countdown
  useEffect(() => {
    if (mode === 'preview' && gestureResult.detected && gestureResult.gesture === 'hand_raise') {
      console.log('Hand raise detected, starting countdown');
      setMode('countdown');
      startCountdown();
    }
  }, [mode, gestureResult, setMode, startCountdown]);

  // Handle countdown completion -> capture
  useEffect(() => {
    if (mode === 'countdown' && countdownValue === 0) {
      console.log('Countdown complete, capturing photo');
      setIsFrozen(true); // Freeze tracking
      setMode('capturing');
      capturePhoto();
    }
  }, [mode, countdownValue, setMode, setIsFrozen, capturePhoto]);

  // Handle QR display timeout -> return to preview
  useEffect(() => {
    if (mode === 'display') {
      const timeout = setTimeout(() => {
        console.log('QR display timeout, returning to preview');
        clearPhoto();
        setIsFrozen(false);
        resetToPreview();
      }, QR_DISPLAY_TIMEOUT_MS);

      return () => clearTimeout(timeout);
    }
  }, [mode, clearPhoto, setIsFrozen, resetToPreview]);

  // Handle manual return to preview (touch anywhere on QR screen)
  const handleReturnToPreview = useCallback(() => {
    if (mode === 'display') {
      clearPhoto();
      setIsFrozen(false);
      resetToPreview();
    }
  }, [mode, clearPhoto, setIsFrozen, resetToPreview]);

  return (
    <div className="app-container">
      {/* Hidden capture canvas at full resolution */}
      <canvas
        ref={captureCanvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        style={{ display: 'none' }}
      />

      {/* Main R3F canvas */}
      <Canvas
        ref={canvasRef}
        className="r3f-canvas"
        camera={{ position: [0, 0, 5], fov: 50 }}
        gl={{
          antialias: true,
          alpha: true,
          preserveDrawingBuffer: true, // Required for capture
          powerPreference: 'high-performance',
        }}
        style={{
          width: '100%',
          height: '100%',
          touchAction: 'none',
        }}
      >
        <StadiumScene />
      </Canvas>

      {/* UI Overlay */}
      <div className="ui-overlay">
        {/* Status bar (top right) */}
        <StatusBar
          cameraReady={cameraReady}
          poseTrackerReady={poseTrackerReady}
        />

        {/* Gesture instruction (bottom center) - only in preview mode */}
        {mode === 'preview' && (
          <GestureInstruction />
        )}

        {/* Countdown overlay */}
        {mode === 'countdown' && (
          <CountdownOverlay value={countdownValue} />
        )}

        {/* QR Display */}
        {mode === 'display' && qrCodeDataUrl && shortUrl && (
          <QRDisplay
            qrCodeDataUrl={qrCodeDataUrl}
            shortUrl={shortUrl}
            onTap={handleReturnToPreview}
          />
        )}

        {/* Error display */}
        {mode === 'error' && error && (
          <ErrorDisplay
            message={error}
            onDismiss={resetToPreview}
          />
        )}

        {/* Loading/uploading indicator */}
        {(mode === 'capturing' || mode === 'uploading') && (
          <div className="countdown-overlay">
            <div className="loading-spinner" />
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
