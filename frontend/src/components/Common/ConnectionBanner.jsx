import { useGame } from '../../context/GameContext.jsx';

export default function ConnectionBanner() {
  const { state } = useGame();
  if (state.ui.connected) return null;
  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
      background: 'var(--coral)',
      color: '#0e180e',
      padding: '10px 16px', textAlign: 'center',
      fontSize: '0.9rem', fontWeight: 700,
      boxShadow: '0 2px 16px rgba(252,165,165,0.4)',
      letterSpacing: '0.5px'
    }}>
      Connexion perdue — reconnexion en cours...
    </div>
  );
}
