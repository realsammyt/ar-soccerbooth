import { Z_INDEX } from '../constants/display';

/**
 * Gesture instruction displayed in preview mode
 */
export function GestureInstruction() {
  return (
    <div
      className="gesture-instruction"
      style={{
        position: 'absolute',
        bottom: '100px',
        left: '50%',
        transform: 'translateX(-50%)',
        background: 'rgba(0, 0, 0, 0.7)',
        padding: '20px 40px',
        borderRadius: '50px',
        fontSize: '28px',
        color: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        gap: '15px',
        zIndex: Z_INDEX.UI_CONTROLS,
        animation: 'float 2s ease-in-out infinite',
      }}
    >
      <span className="gesture-icon" style={{ fontSize: '40px' }}>
        ✋
      </span>
      Raise your hand to take a photo!
    </div>
  );
}
