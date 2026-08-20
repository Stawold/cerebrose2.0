import { useEffect, useState } from 'react';
import { getSocket } from '../../services/socketService';
import { colorHex } from '../../services/gameLogic';
import Timer from '../Common/Timer.jsx';
import ProgressBadge from '../Common/ProgressBadge.jsx';

const CHOICES = ['rouge', 'bleu', 'vert', 'jaune', 'violet', 'orange', 'blanc'];

export default function GameCouleurs({ game }) {
  const { phase, payload, duration, serverTime, progress } = game;
  const [sent, setSent] = useState(false);

  useEffect(() => {
    setSent(false);
  }, [payload?.item?.id]);

  if (phase === 'grayout') return <div className="page" />;

  function submit(color) {
    if (sent) return;
    setSent(true);
    getSocket().emit('player:answer', { value: color });
  }

  return (
    <div className="page">
      <Timer duration={duration} serverTime={serverTime} />
      <ProgressBadge progress={progress} />
      <h1 className="title">Dans quelle couleur le mot est-il écrit ?</h1>
      <div className="button-grid">
        {CHOICES.map((c) => (
          <button
            key={c}
            disabled={sent}
            onClick={() => submit(c)}
            className="color-btn"
            style={{ background: colorHex(c) }}
          >
            &nbsp;
          </button>
        ))}
      </div>
    </div>
  );
}
