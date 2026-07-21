import { useEffect, useState } from 'react';
import { getSocket } from '../../services/socketService';
import { useGame } from '../../context/GameContext.jsx';
import Timer from '../Common/Timer.jsx';
import { useAutoSubmitOnExpiry } from '../../services/useAutoSubmitOnExpiry';

export default function GameAnagramme({ game }) {
  const { state } = useGame();
  const feedback = state.feedback;
  const { phase, payload, duration, serverTime } = game;
  const [value, setValue] = useState('');
  const [wrongFlash, setWrongFlash] = useState(false);

  useEffect(() => {
    setValue('');
    setWrongFlash(false);
  }, [payload?.scrambled]);

  // Wrong guess: brief red flash, then clear the field so the player retypes.
  useEffect(() => {
    if (!feedback || feedback.correct !== false) return undefined;
    setValue('');
    setWrongFlash(true);
    const t = setTimeout(() => setWrongFlash(false), 400);
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
      <h1 className="title" style={{ letterSpacing: 6 }}>{payload?.scrambled}</h1>
      <input
        type="text"
        autoFocus
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
        className={wrongFlash ? 'flash-wrong' : ''}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && submit()}
      />
      <br />
      <button onClick={submit}>Envoyer</button>
    </div>
  );
}
