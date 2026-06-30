import { useGame } from '../../context/GameContext.jsx';

export default function ConnectionBanner() {
  const { state } = useGame();
  if (state.ui.connected) return null;
  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
      background: 'var(--coral)', color: '#fff',
      padding: '10px 16px', textAlign: 'center',
      fontSize: '0.9rem', fontWeight: 600,
      boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
    }}>
      Connexion perdue — reconnexion en cours...
    </div>
  );
}
