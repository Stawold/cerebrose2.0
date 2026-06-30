import { getRulesText } from '../services/gameLogic';
import { getSocket } from '../services/socketService';

export default function RulesExplanation({ rules, isHost, code }) {
  if (!rules) return null;
  return (
    <div className="page" style={{ gap: 20 }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
        <span className="pill-badge amber">
          Manche {rules.gameIndex + 1} / {rules.totalGames}
        </span>
        <h1 className="title" style={{ fontSize: '2.2rem', color: 'var(--violet)' }}>{rules.label}</h1>
      </div>

      <div className="card" style={{ maxWidth: 480 }}>
        <span className="section-label">Règles du jeu</span>
        <p style={{ margin: '12px 0 0', lineHeight: 1.7, color: 'var(--text-muted)', fontSize: '1rem' }}>
          {getRulesText(rules.game)}
        </p>
      </div>

      {isHost ? (
        <button
          onClick={() => getSocket().emit('host:beginGame', { code })}
          style={{ fontSize: '1.1rem', padding: '14px 40px' }}
        >
          C'est parti !
        </button>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(255,255,255,0.04)', border: 'var(--chalk-border)', borderRadius: 999, padding: '10px 20px' }}>
          <span className="pulse-dot" />
          <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            En attente du lancement par l'animateur...
          </p>
        </div>
      )}
    </div>
  );
}
