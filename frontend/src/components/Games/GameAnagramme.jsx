import { useEffect, useState } from 'react';
import { getSocket } from '../../services/socketService';
import { useGame } from '../../context/GameContext.jsx';
import Timer from '../Common/Timer.jsx';
import ProgressBadge from '../Common/ProgressBadge.jsx';
import MyScore from '../Common/MyScore.jsx';
import AnswerFeedback from '../Common/AnswerFeedback.jsx';
import { useAutoSubmitOnExpiry } from '../../services/useAutoSubmitOnExpiry';

export default function GameAnagramme({ game }) {
  const { state } = useGame();
  const feedback = state.feedback;
  const { phase, payload, duration, serverTime, progress } = game;
  const [value, setValue] = useState('');
  const [flash, setFlash] = useState('');
  const [wrongPill, setWrongPill] = useState(false);

  useEffect(() => {
    setValue('');
    setFlash('');
    setWrongPill(false);
  }, [payload?.scrambled]);

  // Wrong guess: brief red flash, then clear the field so the player retypes.
  // Correct guess: brief green flash before the round moves to the result screen.
  useEffect(() => {
    if (!feedback) return undefined;
    if (feedback.correct === false) setValue('');
    setFlash(feedback.correct ? 'flash-correct' : 'flash-wrong');
    setWrongPill(feedback.correct === false);
    const t = setTimeout(() => { setFlash(''); setWrongPill(false); }, 900);
    return () => clearTimeout(t);
  }, [feedback]);

  function submit() {
    if (!value.trim()) return;
    getSocket().emit('player:answer', { value: value.trim() });
  }

  useAutoSubmitOnExpiry(duration, serverTime, () => { if (phase === 'play' && value.trim()) submit(); });

  if (phase === 'result') {
    return (
      <div className="page">
        <MyScore />
        <h1 className="title">
          {payload.winnerPseudo ? `${payload.winnerPseudo} a trouvé !` : 'Personne n\'a trouvé...'}
        </h1>
        <p>Réponse : {payload.answer}</p>
      </div>
    );
  }

  return (
    <div className="page">
      <Timer duration={duration} serverTime={serverTime} />
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
        <ProgressBadge progress={progress} />
        <MyScore />
      </div>
      <div style={{ display: 'flex', gap: 6, justifyContent: 'center', flexWrap: 'wrap' }}>
        {String(payload?.scrambled || '').split('').map((letter, i) => (
          <div
            key={i}
            style={{
              width: 44,
              height: 56,
              borderRadius: 4,
              background: 'var(--ink)',
              color: 'var(--paper)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 700,
              fontSize: '1.6rem',
              letterSpacing: '-0.03em'
            }}
          >
            {letter}
          </div>
        ))}
      </div>
      <input
        type="text"
        autoFocus
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
        className={flash}
        style={{ textTransform: 'uppercase' }}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && submit()}
      />
      <br />
      <button onClick={submit} className="btn-validate">Envoyer</button>
      {wrongPill && <AnswerFeedback feedback={{ correct: false }} wrongLabel="Refusé — réessayez" />}
    </div>
  );
}
