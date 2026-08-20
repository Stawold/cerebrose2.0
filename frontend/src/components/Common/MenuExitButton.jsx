import { useNavigate, useLocation } from 'react-router-dom';
import { useGame } from '../../context/GameContext.jsx';

// Lets the host or player bail out and go back to the host/player choice
// screen at any point, without needing to reach the end of the party.
const HIDDEN_ON = ['/', '/test-lab', '/projection'];

export default function MenuExitButton() {
  const location = useLocation();
  const navigate = useNavigate();
  const { dispatch } = useGame();

  if (HIDDEN_ON.includes(location.pathname)) return null;

  function handleClick() {
    localStorage.removeItem('cerebrose_host');
    localStorage.removeItem('cerebrose_player');
    dispatch({ type: 'RESET' });
    navigate('/');
  }

  return (
    <button
      onClick={handleClick}
      title="Changer de rôle / retour au menu"
      style={{
        position: 'fixed',
        top: 10,
        right: 10,
        zIndex: 500,
        width: 32,
        height: 32,
        borderRadius: 4,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 0,
        fontSize: '0.95rem',
        background: '#fff',
        color: 'var(--ink)',
        border: '1px solid var(--ink-border)'
      }}
    >
      ↩
    </button>
  );
}
