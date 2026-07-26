import { useEffect, useState } from 'react';
import { getSocket } from '../../services/socketService';
import { useGame } from '../../context/GameContext.jsx';
import { feedbackClass } from '../Common/Feedback.jsx';
import Timer from '../Common/Timer.jsx';
import ProgressBadge from '../Common/ProgressBadge.jsx';
import { useAutoSubmitOnExpiry } from '../../services/useAutoSubmitOnExpiry';

export default function GameMemoire({ game }) {
  const { state } = useGame();
  const feedback = state.feedback;
  const { phase, payload, duration, serverTime, progress } = game;
  const [value, setValue] = useState('');
  const [sent, setSent] = useState(false);

  useEffect(() => {
    setValue('');
    setSent(false);
  }, [phase, payload?.length]);

  function submit() {
    if (sent || !value.trim()) return;
    getSocket().emit('player:answer', { value: value.trim() });
    setSent(true);
  }

  useAutoSubmitOnExpiry(duration, serverTime, () => { if (phase === 'input' && value.trim()) submit(); });

  if (phase === 'display') {
    return (
      <div className="page">
        <Timer duration={duration} serverTime={serverTime} />
        <ProgressBadge progress={progress} />
        <h1 className="title">Regardez l'écran !</h1>
        <p>Mémorisez la séquence de {payload?.length} chiffres affichée sur l'écran de projection.</p>
      </div>
    );
  }

  return (
    <div className="page">
      <Timer duration={duration} serverTime={serverTime} />
      <ProgressBadge progress={progress} />
      <h1 className="title">À vous !</h1>
      <input
        type="text"
        inputMode="numeric"
        autoFocus
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
        disabled={sent}
        className={feedback ? feedbackClass(feedback) : ''}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && submit()}
      />
      <br />
      <button onClick={submit} disabled={sent}>Valider</button>
    </div>
  );
}
