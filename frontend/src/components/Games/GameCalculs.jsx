import { useState } from 'react';
import { getSocket } from '../../services/socketService';
import { useGame } from '../../context/GameContext.jsx';
import { feedbackClass } from '../Common/Feedback.jsx';
import Timer from '../Common/Timer.jsx';
import ProgressBadge from '../Common/ProgressBadge.jsx';
import { useAutoSubmitOnExpiry } from '../../services/useAutoSubmitOnExpiry';

export default function GameCalculs({ game }) {
  const { state } = useGame();
  const feedback = state.feedback;
  const { payload, duration, serverTime } = game;
  const [index, setIndex] = useState(0);
  const [value, setValue] = useState('');
  const questions = payload?.questions || [];
  const current = questions[index];

  function submit() {
    if (!current || !value.trim()) return;
    getSocket().emit('player:answer', { questionId: current.id, value: value.trim() });
    setValue('');
    setTimeout(() => setIndex((i) => Math.min(i + 1, questions.length - 1)), 400);
  }

  useAutoSubmitOnExpiry(duration, serverTime, () => { if (value.trim()) submit(); });

  if (!current) return <p>Aucun calcul disponible.</p>;
  const isCurrentFeedback = feedback && feedback.questionId === current.id;

  return (
    <div className="page">
      <Timer duration={duration} serverTime={serverTime} />
      <ProgressBadge progress={{ index, total: questions.length }} />
      <h1 className="title">{current.operation} = ?</h1>
      <input
        type="number"
        autoFocus
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
        className={isCurrentFeedback ? feedbackClass(feedback) : ''}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && submit()}
      />
      <br />
      <button onClick={submit} className="btn-validate">Valider</button>
    </div>
  );
}
