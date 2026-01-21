import { create } from 'zustand';
import type { AppMode, QualityMode } from '../types';

interface AppState {
  // Current application mode
  mode: AppMode;
  setMode: (mode: AppMode) => void;

  // Quality mode for capture optimization
  qualityMode: QualityMode;
  setQualityMode: (mode: QualityMode) => void;

  // Countdown state
  countdownValue: number;
  setCountdownValue: (value: number) => void;

  // Error state
  error: string | null;
  setError: (error: string | null) => void;

  // Loading state
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;

  // Camera ready state
  cameraReady: boolean;
  setCameraReady: (ready: boolean) => void;

  // MediaPipe ready state
  poseTrackerReady: boolean;
  setPoseTrackerReady: (ready: boolean) => void;

  // Reset to preview mode
  resetToPreview: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  mode: 'preview',
  setMode: (mode) => set({ mode }),

  qualityMode: 'preview',
  setQualityMode: (mode) => set({ qualityMode: mode }),

  countdownValue: 3,
  setCountdownValue: (value) => set({ countdownValue: value }),

  error: null,
  setError: (error) => set({ error, mode: error ? 'error' : 'preview' }),

  isLoading: true,
  setIsLoading: (isLoading) => set({ isLoading }),

  cameraReady: false,
  setCameraReady: (ready) => set({ cameraReady: ready }),

  poseTrackerReady: false,
  setPoseTrackerReady: (ready) => set({ poseTrackerReady: ready }),

  resetToPreview: () => set({
    mode: 'preview',
    qualityMode: 'preview',
    countdownValue: 3,
    error: null,
  }),
}));
