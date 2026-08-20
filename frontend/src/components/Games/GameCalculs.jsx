import { useEffect, useRef, useState } from 'react';
import { getSocket } from '../../services/socketService';
import { useGame } from '../../context/GameContext.jsx';
import { feedbackClass } from '../Common/Feedback.jsx';
import Timer from '../Common/Timer.jsx';
import ProgressBadge from '../Common/ProgressBadge.jsx';
import MyScore from '../Common/MyScore.jsx';
import AnswerFeedback from '../Common/AnswerFeedback.jsx';
import { useAutoSubmitOnExpiry } from '../../services/useAutoSubmitOnExpiry';

export default function GameCalculs({ game }) {
  const { state } = useGame();
  const feedback = state.feedback;
  const { payload, duration, serverTime } = game;
  const [index, setIndex] = useState(0);
  const [value, setValue] = useState('');
  const [flash, setFlash] = useState(null); // last feedback shown, cleared after a beat
  const lastQuestionId = useRef(null);
  const questions = payload?.questions || [];
  const current = questions[index];

  function submit() {
    if (!current || !value.trim()) return;
    lastQuestionId.current = current.id;
    getSocket().emit('player:answer', { questionId: current.id, value: value.trim() });
    setValue('');
    setTimeout(() => setIndex((i) => Math.min(i + 1, questions.length - 1)), 400);
  }

  useAutoSubmitOnExpiry(duration, serverTime, () => { if (value.trim()) submit(); });

  // Calculs runs as one continuous phase for every question — there's no
  // per-question phase change to clear stale feedback on, so hold it locally
  // and time it out ourselves instead of trusting state.feedback to reset.
  useEffect(() => {
    if (!feedback || feedback.questionId !== lastQuestionId.current) return undefined;
    setFlash(feedback);
    const t = setTimeout(() => setFlash(null), 900);
    return () => clearTimeout(t);
  }, [feedback]);

  if (!current) return <p>Aucun calcul disponible.</p>;
  const isCurrentFeedback = feedback && feedback.questionId === current.id;

  return (
    <div className="page">
      <Timer duration={duration} serverTime={serverTime} />
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
        <ProgressBadge progress={{ index, total: questions.length }} />
        <MyScore />
      </div>
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
      <AnswerFeedback feedback={flash} />
    </div>
  );
}
