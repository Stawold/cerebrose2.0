import { useLocation } from 'react-router-dom';

// Small, persistent "Cérébr'Ose" mark shown on player-facing screens
// (lobby and projection already carry their own full-size logo/title).
const HIDDEN_ON = ['/', '/test-lab', '/projection'];

export default function BrandMark() {
  const location = useLocation();
  if (HIDDEN_ON.includes(location.pathname)) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 10,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 400,
        pointerEvents: 'none'
      }}
    >
      <span className="logo" style={{ fontSize: '1.1rem', opacity: 0.7 }}>Cérébr'Ose</span>
    </div>
  );
}
