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
        width: 36,
        height: 36,
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 0,
        fontSize: '1.1rem',
        background: 'rgba(14, 24, 14, 0.75)',
        border: '2px dashed var(--chalk-line-strong)',
        boxShadow: 'none'
      }}
    >
      ↩️
    </button>
  );
}
