import { useGame } from '../../context/GameContext.jsx';

export default function ConnectionBanner() {
  const { state } = useGame();
  if (state.ui.connected) return null;
  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
      background: 'var(--coral)',
      color: '#fff',
      padding: '10px 16px', textAlign: 'center',
      fontFamily: "'IBM Plex Mono', monospace",
      fontSize: '0.78rem', fontWeight: 500,
      letterSpacing: '0.1em',
      textTransform: 'uppercase'
    }}>
      Connexion perdue — reconnexion en cours...
    </div>
  );
}
