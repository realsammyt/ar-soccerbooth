import { useCallback, useRef } from 'react';
import { useAppStore } from '../store/appStore';
import { COUNTDOWN } from '../constants/display';

/**
 * Custom hook for countdown timer with quality mode switching
 */
export function useCountdown() {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const countdownValue = useAppStore((s) => s.countdownValue);
  const setCountdownValue = useAppStore((s) => s.setCountdownValue);
  const setQualityMode = useAppStore((s) => s.setQualityMode);

  const startCountdown = useCallback(() => {
    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Reset countdown value
    setCountdownValue(COUNTDOWN.DURATION_SECONDS);

    // Switch to countdown quality mode (reduced pose FPS, higher render quality)
    setQualityMode('countdown');

    // Start countdown interval
    intervalRef.current = setInterval(() => {
      const currentValue = useAppStore.getState().countdownValue;

      if (currentValue <= 1) {
        // Countdown complete
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        // Switch to capture quality mode (freeze tracking, max quality)
        setQualityMode('capture');
        setCountdownValue(0);
      } else {
        setCountdownValue(currentValue - 1);
      }
    }, 1000);
  }, [setCountdownValue, setQualityMode]);

  const cancelCountdown = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setCountdownValue(COUNTDOWN.DURATION_SECONDS);
    setQualityMode('preview');
  }, [setCountdownValue, setQualityMode]);

  return {
    countdownValue,
    startCountdown,
    cancelCountdown,
  };
}
