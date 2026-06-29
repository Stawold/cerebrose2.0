import { useState } from 'react';
import { getSocket } from '../../services/socketService';
import { feedbackClass } from '../Common/Feedback.jsx';
import Timer from '../Common/Timer.jsx';

export default function GameCalculs({ game }) {
  const { payload, duration, serverTime, feedback } = game;
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

  if (!current) return <p>Aucun calcul disponible.</p>;
  const isCurrentFeedback = feedback && feedback.questionId === current.id;

  return (
    <div className="page">
      <Timer duration={duration} serverTime={serverTime} />
      <p>{index + 1} / {questions.length}</p>
      <h1 className="title">{current.operation} = ?</h1>
      <input
        type="number"
        autoFocus
        className={isCurrentFeedback ? feedbackClass(feedback) : ''}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && submit()}
      />
      <br />
      <button onClick={submit}>Valider</button>
    </div>
  );
}
