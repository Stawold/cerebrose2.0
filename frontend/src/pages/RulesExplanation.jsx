import { useState } from 'react';
import { getRulesText } from '../services/gameLogic';
import { hostAction } from '../services/socketService';
import GameIcon from '../components/Common/GameIcon.jsx';

export default function RulesExplanation({ rules, isHost, code }) {
  const [error, setError] = useState('');
  if (!rules) return null;

  async function begin() {
    setError('');
    const res = await hostAction('host:beginGame', { code });
    if (!res || !res.ok) setError("Le lancement n'a pas abouti, réessayez.");
  }

  return (
    <div className="page" style={{ gap: 20, maxWidth: 440, margin: '0 auto' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
        <GameIcon gameId={rules.game} size={110} showName />
        <span className="pill-badge">Manche {rules.gameIndex + 1} / {rules.totalGames}</span>
        <h1 className="title" style={{ fontSize: '1.9rem' }}>{rules.label}</h1>
      </div>

      <div className="card">
        <span className="section-label">Protocole</span>
        <p style={{ margin: '12px 0 0', lineHeight: 1.7, color: 'var(--ink-70)', fontSize: '0.95rem', textAlign: 'left' }}>
          {getRulesText(rules.game)}
        </p>
      </div>

      {isHost ? (
        <>
          <button onClick={begin} className="btn-validate">
            C'est parti
          </button>
          {error && <p style={{ color: 'var(--coral)', fontSize: '0.85rem', margin: 0 }}>{error}</p>}
        </>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'var(--surface)', border: '1px solid var(--ink-border)', borderRadius: 6, padding: '10px 20px' }}>
          <span className="pulse-dot" />
          <p className="mono" style={{ margin: 0, color: 'var(--ink-66)', fontSize: '0.75rem', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            En attente du lancement
          </p>
        </div>
      )}
    </div>
  );
}
