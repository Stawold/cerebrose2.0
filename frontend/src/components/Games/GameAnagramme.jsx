import { useEffect, useState } from 'react';
import { getSocket } from '../../services/socketService';
import { feedbackClass } from '../Common/Feedback.jsx';
import Timer from '../Common/Timer.jsx';

export default function GameAnagramme({ game }) {
  const { phase, payload, duration, serverTime, feedback } = game;
  const [value, setValue] = useState('');

  useEffect(() => {
    setValue('');
  }, [payload?.scrambled]);

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

  function submit() {
    if (!value.trim()) return;
    getSocket().emit('player:answer', { value: value.trim() });
  }

  return (
    <div className="page">
      <Timer duration={duration} serverTime={serverTime} />
      <h1 className="title" style={{ letterSpacing: 6 }}>{payload?.scrambled}</h1>
      <input
        type="text"
        autoFocus
        className={feedback ? feedbackClass(feedback) : ''}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && submit()}
      />
      <br />
      <button onClick={submit}>Envoyer</button>
    </div>
  );
}
