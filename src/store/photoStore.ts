import { create } from 'zustand';
import type { CaptureResult, UploadResult } from '../types';

interface PhotoState {
  // Current capture
  captureResult: CaptureResult | null;
  setCaptureResult: (result: CaptureResult | null) => void;

  // Upload result
  uploadResult: UploadResult | null;
  setUploadResult: (result: UploadResult | null) => void;

  // QR code data URL
  qrCodeDataUrl: string | null;
  setQrCodeDataUrl: (dataUrl: string | null) => void;

  // Short URL for display
  shortUrl: string | null;
  setShortUrl: (url: string | null) => void;

  // Upload progress
  uploadProgress: number;
  setUploadProgress: (progress: number) => void;

  // Upload status
  isUploading: boolean;
  setIsUploading: (uploading: boolean) => void;

  // Clear photo state (for new capture)
  clearPhoto: () => void;
}

export const usePhotoStore = create<PhotoState>((set) => ({
  captureResult: null,
  setCaptureResult: (result) => set({ captureResult: result }),

  uploadResult: null,
  setUploadResult: (result) => set({ uploadResult: result }),

  qrCodeDataUrl: null,
  setQrCodeDataUrl: (dataUrl) => set({ qrCodeDataUrl: dataUrl }),

  shortUrl: null,
  setShortUrl: (url) => set({ shortUrl: url }),

  uploadProgress: 0,
  setUploadProgress: (progress) => set({ uploadProgress: progress }),

  isUploading: false,
  setIsUploading: (uploading) => set({ isUploading: uploading }),

  clearPhoto: () => set({
    captureResult: null,
    uploadResult: null,
    qrCodeDataUrl: null,
    shortUrl: null,
    uploadProgress: 0,
    isUploading: false,
  }),
}));
