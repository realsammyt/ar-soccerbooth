import { useEffect, useState } from 'react';
import { Z_INDEX, QR_DISPLAY_TIMEOUT_MS } from '../constants/display';

interface QRDisplayProps {
  qrCodeDataUrl: string;
  shortUrl: string;
  onTap?: () => void;
}

/**
 * Full-screen QR code display for photo sharing
 */
export function QRDisplay({ qrCodeDataUrl, shortUrl, onTap }: QRDisplayProps) {
  const [remaining, setRemaining] = useState(Math.floor(QR_DISPLAY_TIMEOUT_MS / 1000));

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setRemaining((r) => Math.max(0, r - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div
      className="qr-display"
      onClick={onTap}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #1a237e 0%, #0d47a1 100%)',
        zIndex: Z_INDEX.QR_DISPLAY,
        padding: '40px',
        cursor: 'pointer',
      }}
    >
      {/* Title */}
      <h2
        style={{
          fontSize: '48px',
          color: '#ffffff',
          marginBottom: '40px',
          textAlign: 'center',
        }}
      >
        Scan to Get Your Photo!
      </h2>

      {/* QR Code */}
      <div
        className="qr-code-container"
        style={{
          background: '#ffffff',
          padding: '30px',
          borderRadius: '20px',
          marginBottom: '40px',
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)',
        }}
      >
        <img
          src={qrCodeDataUrl}
          alt="QR Code"
          style={{
            width: '400px',
            height: '400px',
            display: 'block',
          }}
        />
      </div>

      {/* Short URL */}
      <div
        className="short-url"
        style={{
          fontSize: '32px',
          fontFamily: 'monospace',
          color: '#ffffff',
          background: 'rgba(255, 255, 255, 0.1)',
          padding: '20px 40px',
          borderRadius: '10px',
          marginBottom: '40px',
          wordBreak: 'break-all',
          textAlign: 'center',
          maxWidth: '90%',
        }}
      >
        {shortUrl}
      </div>

      {/* Instructions */}
      <div
        className="instructions"
        style={{
          fontSize: '24px',
          color: 'rgba(255, 255, 255, 0.8)',
          textAlign: 'center',
          lineHeight: 1.6,
        }}
      >
        <p>1. Open your camera app</p>
        <p>2. Point at the QR code</p>
        <p>3. Tap to view your photo</p>
      </div>

      {/* Timer */}
      <div
        className="timer"
        style={{
          position: 'absolute',
          bottom: '40px',
          fontSize: '20px',
          color: 'rgba(255, 255, 255, 0.6)',
        }}
      >
        Returning to camera in {remaining}s • Tap anywhere to continue
      </div>
    </div>
  );
}
