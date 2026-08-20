import { useEffect, useState } from 'react';
import { getSocket } from '../../services/socketService';
import { useGame } from '../../context/GameContext.jsx';
import { feedbackClass } from '../Common/Feedback.jsx';
import Timer from '../Common/Timer.jsx';
import ProgressBadge from '../Common/ProgressBadge.jsx';
import MyScore from '../Common/MyScore.jsx';
import AnswerFeedback from '../Common/AnswerFeedback.jsx';
import { useAutoSubmitOnExpiry } from '../../services/useAutoSubmitOnExpiry';

export default function GameHeures({ game }) {
  const { state } = useGame();
  const feedback = state.feedback;
  const { phase, duration, serverTime, progress } = game;
  const [value, setValue] = useState('');
  const [sent, setSent] = useState(false);

  useEffect(() => {
    setValue('');
    setSent(false);
  }, [phase]);

  useAutoSubmitOnExpiry(duration, serverTime, () => { if (phase === 'answer' && value.trim()) submit(); });

  if (phase === 'observe') {
    return (
      <div className="page">
        <Timer duration={duration} serverTime={serverTime} />
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
          <ProgressBadge progress={progress} />
          <MyScore />
        </div>
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
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
        <ProgressBadge progress={progress} />
        <MyScore />
      </div>
      <h1 className="title">Quelle est la différence, en minutes ?</h1>
      <input
        type="number"
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
      <button onClick={submit} disabled={sent} className="btn-validate">Valider</button>
      <AnswerFeedback feedback={feedback} />
    </div>
  );
}
