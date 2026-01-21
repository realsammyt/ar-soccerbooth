import { Z_INDEX } from '../constants/display';

interface StatusBarProps {
  cameraReady: boolean;
  poseTrackerReady: boolean;
}

/**
 * Status bar showing camera and tracking status
 */
export function StatusBar({ cameraReady, poseTrackerReady }: StatusBarProps) {
  return (
    <div
      className="status-bar"
      style={{
        position: 'absolute',
        top: '20px',
        right: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        zIndex: Z_INDEX.UI_CONTROLS,
      }}
    >
      {/* Camera status */}
      <div
        className="status-indicator"
        style={{
          background: 'rgba(0, 0, 0, 0.7)',
          padding: '10px 20px',
          borderRadius: '20px',
          fontSize: '16px',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
        }}
      >
        <div
          className={`status-dot ${cameraReady ? 'active' : 'inactive'}`}
          style={{
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            background: cameraReady ? '#4caf50' : '#f44336',
            animation: cameraReady ? 'blink 1s ease-in-out infinite' : 'none',
          }}
        />
        Camera
      </div>

      {/* Pose tracker status */}
      <div
        className="status-indicator"
        style={{
          background: 'rgba(0, 0, 0, 0.7)',
          padding: '10px 20px',
          borderRadius: '20px',
          fontSize: '16px',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
        }}
      >
        <div
          className={`status-dot ${poseTrackerReady ? 'active' : 'inactive'}`}
          style={{
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            background: poseTrackerReady ? '#4caf50' : '#f44336',
            animation: poseTrackerReady ? 'blink 1s ease-in-out infinite' : 'none',
          }}
        />
        Tracking
      </div>
    </div>
  );
}
