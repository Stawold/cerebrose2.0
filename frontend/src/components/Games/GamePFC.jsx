import { useEffect, useState } from 'react';
import { getSocket } from '../../services/socketService';
import { useGame } from '../../context/GameContext.jsx';
import { PFC_ICONS } from '../../services/gameLogic';
import Timer from '../Common/Timer.jsx';
import ProgressBadge from '../Common/ProgressBadge.jsx';
import MyScore from '../Common/MyScore.jsx';
import AnswerFeedback from '../Common/AnswerFeedback.jsx';

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
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
        <ProgressBadge progress={progress} />
        <MyScore />
      </div>
      <div
        style={{
          width: '100%',
          borderRadius: 6,
          padding: '20px 16px',
          background: instruction === 'win' ? 'var(--green)' : 'var(--coral)',
          color: '#fff',
          fontFamily: "'Space Grotesk', sans-serif",
          fontWeight: 700,
          fontSize: '2.6rem',
          letterSpacing: '-0.03em',
          textTransform: 'uppercase'
        }}
      >
        {instruction === 'win' ? 'Gagnez' : 'Perdez'}
      </div>
      <h1 className="title">Que choisissez-vous ?</h1>
      <div className="button-grid">
        {CHOICES.map((c) => (
          <button key={c} disabled={sent} onClick={() => submit(c)} style={{ fontSize: '1.1rem', padding: '22px 24px' }}>
            {PFC_ICONS[c]} {c}
          </button>
        ))}
      </div>
      <AnswerFeedback feedback={feedback} correctLabel="Bonne réponse !" wrongLabel="Mauvaise réponse" />
    </div>
  );
}
