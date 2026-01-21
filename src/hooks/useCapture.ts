import { useCallback, RefObject } from 'react';
import QRCode from 'qrcode';
import { useAppStore } from '../store/appStore';
import { usePhotoStore } from '../store/photoStore';
import { usePoseStore } from '../store/poseStore';
import { uploadToGCS } from '../services/gcsUploader';
import { shortenURL } from '../services/urlShortener';
import { CANVAS_WIDTH, CANVAS_HEIGHT, EXPORT_QUALITY } from '../constants/display';
import type { CaptureResult } from '../types';

/**
 * Custom hook for capturing photos from the R3F canvas
 */
export function useCapture(canvasRef: RefObject<HTMLCanvasElement>) {
  const setMode = useAppStore((s) => s.setMode);
  const setError = useAppStore((s) => s.setError);
  const setQualityMode = useAppStore((s) => s.setQualityMode);
  const resetToPreview = useAppStore((s) => s.resetToPreview);

  const setCaptureResult = usePhotoStore((s) => s.setCaptureResult);
  const setUploadResult = usePhotoStore((s) => s.setUploadResult);
  const setQrCodeDataUrl = usePhotoStore((s) => s.setQrCodeDataUrl);
  const setShortUrl = usePhotoStore((s) => s.setShortUrl);
  const setIsUploading = usePhotoStore((s) => s.setIsUploading);

  const setIsFrozen = usePoseStore((s) => s.setIsFrozen);

  const capturePhoto = useCallback(async () => {
    try {
      // Get the R3F canvas (preserveDrawingBuffer must be true)
      const r3fCanvas = document.querySelector('.r3f-canvas canvas') as HTMLCanvasElement;
      if (!r3fCanvas) {
        throw new Error('R3F canvas not found');
      }

      // Get the capture canvas
      const captureCanvas = canvasRef.current;
      if (!captureCanvas) {
        throw new Error('Capture canvas not found');
      }

      const ctx = captureCanvas.getContext('2d');
      if (!ctx) {
        throw new Error('Could not get canvas context');
      }

      // Set capture canvas size
      captureCanvas.width = CANVAS_WIDTH;
      captureCanvas.height = CANVAS_HEIGHT;

      // Get video element for background
      const video = document.querySelector('video') as HTMLVideoElement;

      // Draw video background (mirrored to match selfie view)
      if (video && video.readyState >= 2) {
        ctx.save();
        ctx.translate(CANVAS_WIDTH, 0);
        ctx.scale(-1, 1);

        // Calculate crop to fill portrait canvas (object-fit: cover)
        const videoAspect = video.videoWidth / video.videoHeight;
        const canvasAspect = CANVAS_WIDTH / CANVAS_HEIGHT;

        let sx = 0, sy = 0, sw = video.videoWidth, sh = video.videoHeight;

        if (videoAspect > canvasAspect) {
          // Video is wider - crop sides
          sw = video.videoHeight * canvasAspect;
          sx = (video.videoWidth - sw) / 2;
        } else {
          // Video is taller - crop top/bottom
          sh = video.videoWidth / canvasAspect;
          sy = (video.videoHeight - sh) / 2;
        }

        ctx.drawImage(video, sx, sy, sw, sh, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        ctx.restore();
      }

      // Draw R3F scene on top (with transparency)
      ctx.drawImage(r3fCanvas, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Convert to blob
      const blob = await new Promise<Blob>((resolve, reject) => {
        captureCanvas.toBlob(
          (b) => {
            if (b) resolve(b);
            else reject(new Error('Failed to create blob'));
          },
          'image/jpeg',
          EXPORT_QUALITY.JPEG
        );
      });

      // Create data URL for preview
      const dataUrl = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(blob);
      });

      // Store capture result
      const captureResult: CaptureResult = {
        blob,
        dataUrl,
        width: CANVAS_WIDTH,
        height: CANVAS_HEIGHT,
        timestamp: Date.now(),
      };
      setCaptureResult(captureResult);

      // Move to uploading state
      setMode('uploading');
      setIsUploading(true);

      // Upload to GCS
      const uploadResult = await uploadToGCS(blob, {
        timestamp: captureResult.timestamp,
        kioskId: 'kiosk-1', // TODO: Get from config
      });

      if (!uploadResult.success) {
        throw new Error(uploadResult.error || 'Upload failed');
      }

      setUploadResult(uploadResult);

      // Get short URL
      let shortUrl = uploadResult.publicUrl;
      try {
        shortUrl = await shortenURL(uploadResult.publicUrl);
      } catch (err) {
        console.warn('URL shortening failed, using full URL:', err);
      }
      setShortUrl(shortUrl);

      // Generate QR code
      const qrDataUrl = await QRCode.toDataURL(shortUrl, {
        width: 400,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
        errorCorrectionLevel: 'M',
      });
      setQrCodeDataUrl(qrDataUrl);

      // Move to display state
      setIsUploading(false);
      setMode('display');
      setQualityMode('preview');

    } catch (error) {
      console.error('Capture failed:', error);
      setError(`Capture failed: ${error}`);
      setIsUploading(false);
      setIsFrozen(false);
      setQualityMode('preview');
    }
  }, [
    canvasRef,
    setMode,
    setError,
    setQualityMode,
    setCaptureResult,
    setUploadResult,
    setQrCodeDataUrl,
    setShortUrl,
    setIsUploading,
    setIsFrozen,
    resetToPreview,
  ]);

  return { capturePhoto };
}
