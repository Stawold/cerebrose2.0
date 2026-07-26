import { useEffect, useState } from 'react';
import { getSocket } from '../../services/socketService';
import { useGame } from '../../context/GameContext.jsx';
import Timer from '../Common/Timer.jsx';
import ProgressBadge from '../Common/ProgressBadge.jsx';
import { useAutoSubmitOnExpiry } from '../../services/useAutoSubmitOnExpiry';

export default function GameAnagramme({ game }) {
  const { state } = useGame();
  const feedback = state.feedback;
  const { phase, payload, duration, serverTime, progress } = game;
  const [value, setValue] = useState('');
  const [flash, setFlash] = useState('');

  useEffect(() => {
    setValue('');
    setFlash('');
  }, [payload?.scrambled]);

  // Wrong guess: brief red flash, then clear the field so the player retypes.
  // Correct guess: brief green flash before the round moves to the result screen.
  useEffect(() => {
    if (!feedback) return undefined;
    if (feedback.correct === false) setValue('');
    setFlash(feedback.correct ? 'flash-correct' : 'flash-wrong');
    const t = setTimeout(() => setFlash(''), 400);
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
      <ProgressBadge progress={progress} />
      <h1 className="title" style={{ letterSpacing: 6 }}>{payload?.scrambled}</h1>
      <input
        type="text"
        autoFocus
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
        className={flash}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && submit()}
      />
      <br />
      <button onClick={submit}>Envoyer</button>
    </div>
  );
}
