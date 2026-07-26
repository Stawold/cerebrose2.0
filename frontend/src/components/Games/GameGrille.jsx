import { useEffect, useState } from 'react';
import { getSocket } from '../../services/socketService';
import { colorHex } from '../../services/gameLogic';
import Timer from '../Common/Timer.jsx';
import ProgressBadge from '../Common/ProgressBadge.jsx';

const CHOICES = ['vert', 'rouge', 'jaune', 'violet'];

export default function GameGrille({ game }) {
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
      <h1 className="title">Quelle est la couleur dominante de la grille ?</h1>
      <div className="button-grid">
        {CHOICES.map((c) => (
          <button
            key={c}
            disabled={sent}
            onClick={() => submit(c)}
            style={{ background: colorHex(c), boxShadow: `0 6px 16px ${colorHex(c)}55`, minWidth: 100 }}
          >
            &nbsp;
          </button>
        ))}
      </div>
    </div>
  );
}
