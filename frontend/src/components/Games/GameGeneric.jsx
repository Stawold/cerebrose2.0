import { useEffect, useState } from 'react';
import { getSocket } from '../../services/socketService';
import { feedbackClass } from '../Common/Feedback.jsx';
import Timer from '../Common/Timer.jsx';

const NO_FEEDBACK_GAMES = ['couleurs', 'grille'];

export default function GameGeneric({ game }) {
  const { type, phase, payload, duration, serverTime, feedback } = game;
  const [sent, setSent] = useState(false);
  const [value, setValue] = useState('');

  useEffect(() => {
    setSent(false);
    setValue('');
  }, [phase, payload?.item?.id]);

  if (phase === 'observe') {
    return (
      <div className="page">
        <Timer duration={duration} serverTime={serverTime} />
        <h1 className="title">Observez l'écran...</h1>
      </div>
    );
  }

  if (phase === 'grayout') {
    return (
      <div className="page">
        <h1 className="title">...</h1>
      </div>
    );
  }

  function submit(answer) {
    if (sent) return;
    setSent(true);
    getSocket().emit('player:answer', { value: answer });
  }

  const showFeedback = !!feedback && !NO_FEEDBACK_GAMES.includes(type);

  if (payload?.inputType === 'number') {
    return (
      <div className="page">
        <Timer duration={duration} serverTime={serverTime} />
        <h1 className="title">Combien de minutes ?</h1>
        <input
          type="number"
          autoFocus
          disabled={sent}
          className={showFeedback ? feedbackClass(feedback) : ''}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && submit(value)}
        />
        <br />
        <button onClick={() => submit(value)} disabled={sent}>Valider</button>
      </div>
    );
  }

  return (
    <div className="page">
      <Timer duration={duration} serverTime={serverTime} />
      <div className={`button-grid ${sent ? 'grayed' : ''}`}>
        {(payload?.options || []).map((opt) => (
          <button key={opt} onClick={() => submit(opt)} disabled={sent}>{opt}</button>
        ))}
      </div>
      {showFeedback && (
        <span className={`pill-badge ${feedback.correct ? 'mint' : 'coral'}`}>
          {feedback.correct ? 'Bonne réponse !' : 'Mauvaise réponse'}
        </span>
      )}
    </div>
  );
}
