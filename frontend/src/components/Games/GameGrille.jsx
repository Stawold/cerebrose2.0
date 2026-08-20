import { useEffect, useState } from 'react';
import { getSocket } from '../../services/socketService';
import { useGame } from '../../context/GameContext.jsx';
import { colorHex } from '../../services/gameLogic';
import Timer from '../Common/Timer.jsx';
import ProgressBadge from '../Common/ProgressBadge.jsx';
import MyScore from '../Common/MyScore.jsx';
import AnswerFeedback from '../Common/AnswerFeedback.jsx';

const CHOICES = ['vert', 'rouge', 'jaune', 'violet'];

export default function GameGrille({ game }) {
  const { state } = useGame();
  const feedback = state.feedback;
  const { phase, payload, duration, serverTime, progress } = game;
  const [sent, setSent] = useState(false);

  useEffect(() => {
    setSent(false);
  }, [payload?.item?.id]);

  if (phase === 'grayout') {
    return (
      <div className="page">
        <MyScore />
        <AnswerFeedback feedback={feedback} />
      </div>
    );
  }

  function submit(color) {
    if (sent) return;
    setSent(true);
    getSocket().emit('player:answer', { value: color });
  }

  return (
    <div className="page">
      <Timer duration={duration} serverTime={serverTime} />
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
        <ProgressBadge progress={progress} />
        <MyScore />
      </div>
      <h1 className="title">Quelle est la couleur dominante de la grille ?</h1>
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
