import { useEffect, useState } from 'react';
import { getSocket } from '../../services/socketService';
import { useGame } from '../../context/GameContext.jsx';
import { PFC_ICONS } from '../../services/gameLogic';
import Timer from '../Common/Timer.jsx';
import ProgressBadge from '../Common/ProgressBadge.jsx';

const CHOICES = ['pierre', 'feuille', 'ciseaux'];

export default function GamePFC({ game }) {
  const { state } = useGame();
  const feedback = state.feedback;
  const { payload, duration, serverTime, progress } = game;
  const [sent, setSent] = useState(false);

  useEffect(() => {
    setSent(false);
  }, [payload?.item?.id]);

  function submit(choice) {
    if (sent) return;
    setSent(true);
    getSocket().emit('player:answer', { value: choice });
  }

  const instruction = payload?.item?.instruction;

  return (
    <div className="page">
      <Timer duration={duration} serverTime={serverTime} />
      <ProgressBadge progress={progress} />
      <span
        className={`pill-badge ${instruction === 'win' ? 'mint' : 'coral'}`}
        style={{ fontSize: '1.6rem', padding: '12px 28px', fontWeight: 800 }}
      >
        {instruction === 'win' ? 'Gagnez !' : 'Perdez !'}
      </span>
      <h1 className="title">Que choisissez-vous ?</h1>
      <div className="button-grid">
        {CHOICES.map((c) => (
          <button key={c} disabled={sent} onClick={() => submit(c)} style={{ fontSize: '1.6rem', padding: '16px 24px' }}>
            {PFC_ICONS[c]} {c}
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
