import { Z_INDEX } from '../constants/display';

interface CountdownOverlayProps {
  value: number;
}

/**
 * Full-screen countdown overlay displayed during capture countdown
 */
export function CountdownOverlay({ value }: CountdownOverlayProps) {
  return (
    <div
      className="countdown-overlay"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'rgba(0, 0, 0, 0.5)',
        zIndex: Z_INDEX.COUNTDOWN,
      }}
    >
      <div
        className="countdown-number"
        style={{
          fontSize: '300px',
          fontWeight: 'bold',
          color: '#ffffff',
          textShadow: '0 0 50px rgba(255, 255, 255, 0.5)',
          animation: 'pulse 1s ease-in-out infinite',
        }}
      >
        {value > 0 ? value : '📸'}
      </div>
    </div>
  );
}
