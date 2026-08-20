// Big, hard-to-miss correct/wrong pill. `feedback.correct` can be null
// (server sends that when time ran out with no answer submitted) — that's
// deliberately not shown as "wrong", since the player never got a chance.
export default function AnswerFeedback({ feedback, correctLabel = '+1 · Juste !', wrongLabel = 'Faux' }) {
  if (!feedback || feedback.correct === null || feedback.correct === undefined) return null;
  return (
    <span className={`pill-badge ${feedback.correct ? 'mint' : 'coral'}`} style={{ fontSize: '0.9rem', padding: '9px 18px' }}>
      {feedback.correct ? correctLabel : wrongLabel}
    </span>
  );
}
