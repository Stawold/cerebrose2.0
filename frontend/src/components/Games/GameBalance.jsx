import { useEffect, useState } from 'react';
import { getSocket } from '../../services/socketService';
import { useGame } from '../../context/GameContext.jsx';
import { colorHex } from '../../services/gameLogic';
import Timer from '../Common/Timer.jsx';

export default function GameBalance({ game }) {
  const { state } = useGame();
  const feedback = state.feedback;
  const { phase, payload, duration, serverTime } = game;
  const [sent, setSent] = useState(false);

  useEffect(() => {
    setSent(false);
  }, [payload?.puzzle?.id]);

  if (phase === 'observe') {
    return (
      <div className="page">
        <Timer duration={duration} serverTime={serverTime} />
        <span className="pulse-dot" />
        <h1 className="title">Observez les balances à l'écran...</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Déduisez quelle boule est la plus lourde
        </p>
      </div>
    );
  }

  if (phase === 'grayout') return <div className="page" />;

  function submit(color) {
    if (sent) return;
    setSent(true);
    getSocket().emit('player:answer', { value: color });
  }

  const puzzle = payload?.puzzle;
  const choices = puzzle?.colors || [];

  return (
    <div className="page" style={{ gap: 20 }}>
      <Timer duration={duration} serverTime={serverTime} />
      <h1 className="title">Quelle boule est la plus lourde ?</h1>

      <div className="button-grid">
        {choices.map((c) => (
          <button
            key={c}
            disabled={sent}
            onClick={() => submit(c)}
            style={{
              background: colorHex(c),
              boxShadow: sent ? 'none' : `0 6px 16px ${colorHex(c)}55`,
              minWidth: 100,
              minHeight: 52,
              border: 'none',
              borderRadius: 12,
              cursor: sent ? 'default' : 'pointer',
              opacity: sent ? 0.6 : 1,
              transition: 'opacity 0.2s'
            }}
          />
        ))}
      </div>

      {feedback && (
        <span className={`pill-badge ${feedback.correct ? 'mint' : 'coral'}`}>
          {feedback.correct ? 'Bonne réponse !' : 'Mauvaise réponse'}
        </span>
      )}
    </div>
  );
}
