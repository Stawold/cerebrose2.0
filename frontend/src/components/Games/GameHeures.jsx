import { useEffect, useState } from 'react';
import { getSocket } from '../../services/socketService';
import { feedbackClass } from '../Common/Feedback.jsx';
import Timer from '../Common/Timer.jsx';

export default function GameHeures({ game }) {
  const { phase, duration, serverTime, feedback } = game;
  const [value, setValue] = useState('');
  const [sent, setSent] = useState(false);

  useEffect(() => {
    setValue('');
    setSent(false);
  }, [phase]);

  if (phase === 'observe') {
    return (
      <div className="page">
        <Timer duration={duration} serverTime={serverTime} />
        <span className="pulse-dot" />
        <h1 className="title">Observez les deux horloges à l'écran...</h1>
      </div>
    );
  }

  function submit() {
    if (sent || !value.trim()) return;
    setSent(true);
    getSocket().emit('player:answer', { value: value.trim() });
  }

  return (
    <div className="page">
      <Timer duration={duration} serverTime={serverTime} />
      <h1 className="title">Quelle est la différence, en minutes ?</h1>
      <input
        type="number"
        autoFocus
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
