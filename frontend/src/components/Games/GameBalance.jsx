import { useEffect, useState } from 'react';
import { getSocket } from '../../services/socketService';
import { colorHex } from '../../services/gameLogic';
import Timer from '../Common/Timer.jsx';

export default function GameBalance({ game }) {
  const { phase, payload, duration, serverTime, feedback } = game;
  const [sent, setSent] = useState(false);

  useEffect(() => {
    setSent(false);
  }, [payload?.item?.id]);

  if (phase === 'observe') {
    return (
      <div className="page">
        <Timer duration={duration} serverTime={serverTime} />
        <span className="pulse-dot" />
        <h1 className="title">Observez la balance à l'écran...</h1>
      </div>
    );
  }

  if (phase === 'grayout') return <div className="page" />;

  function submit(color) {
    if (sent) return;
    setSent(true);
    getSocket().emit('player:answer', { value: color });
  }

  const item = payload?.item;
  const choices = item ? [item.leftColor, item.rightColor] : [];

  return (
    <div className="page">
      <Timer duration={duration} serverTime={serverTime} />
      <h1 className="title">Quel côté est le plus lourd ?</h1>
      <div className="button-grid">
        {choices.map((c) => (
          <button
            key={c}
            disabled={sent}
            onClick={() => submit(c)}
            style={{ background: colorHex(c), boxShadow: `0 6px 16px ${colorHex(c)}55`, minWidth: 120 }}
          >
            &nbsp;
          </button>
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
