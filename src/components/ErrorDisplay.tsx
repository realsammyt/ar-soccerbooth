import { useEffect } from 'react';
import { Z_INDEX } from '../constants/display';

interface ErrorDisplayProps {
  message: string;
  onDismiss: () => void;
}

/**
 * Error display overlay with auto-dismiss
 */
export function ErrorDisplay({ message, onDismiss }: ErrorDisplayProps) {
  // Auto-dismiss after 10 seconds
  useEffect(() => {
    const timer = setTimeout(onDismiss, 10000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <div
      className="error-overlay"
      onClick={onDismiss}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'rgba(0, 0, 0, 0.8)',
        zIndex: Z_INDEX.ERROR_OVERLAY,
        cursor: 'pointer',
      }}
    >
      <div
        className="error-display"
        style={{
          background: '#f44336',
          padding: '40px',
          borderRadius: '20px',
          textAlign: 'center',
          maxWidth: '80%',
          color: '#ffffff',
        }}
      >
        <h3 style={{ fontSize: '32px', marginBottom: '20px' }}>
          Oops! Something went wrong
        </h3>
        <p style={{ fontSize: '24px', opacity: 0.9, marginBottom: '20px' }}>
          {message}
        </p>
        <p style={{ fontSize: '18px', opacity: 0.7 }}>
          Tap anywhere to continue
        </p>
      </div>
    </div>
  );
}
