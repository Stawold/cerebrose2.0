import { getRulesText } from '../services/gameLogic';
import { getSocket } from '../services/socketService';

export default function RulesExplanation({ rules, isHost, code }) {
  if (!rules) return null;
  return (
    <div className="page">
      <span className="pill-badge">Manche {rules.gameIndex + 1} / {rules.totalGames}</span>
      <h1 className="title">{rules.label}</h1>
      <div className="card">
        <p>{getRulesText(rules.game)}</p>
      </div>
      {isHost ? (
        <button onClick={() => getSocket().emit('host:beginGame', { code })}>C'est parti !</button>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span className="pulse-dot" />
          <p style={{ margin: 0, color: 'var(--text-muted)' }}>En attente du lancement par l'animateur...</p>
        </div>
      )}
    </div>
  );
}
