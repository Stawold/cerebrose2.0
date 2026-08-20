import { useLocation } from 'react-router-dom';
import { useGame } from '../../context/GameContext.jsx';
import Logo from './Logo.jsx';

// Small, persistent "Cérébr'Ose." mark shown on player-facing screens
// (lobby and projection already carry their own full-size logo/title).
// Hidden during active play — PlayerGameHeader already carries the brand
// context there (game name + score), a second mark would just be clutter.
const HIDDEN_ON = ['/', '/test-lab', '/projection'];

export default function BrandMark() {
  const location = useLocation();
  const { state } = useGame();
  if (HIDDEN_ON.includes(location.pathname)) return null;
  if (state.game.type && state.game.phase && !state.ui.isHost) return null;

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
      <Logo size={16} />
    </div>
  );
}
