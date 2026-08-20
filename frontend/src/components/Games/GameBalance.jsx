import { useEffect, useState } from 'react';
import { getSocket } from '../../services/socketService';
import { useGame } from '../../context/GameContext.jsx';
import { colorHex } from '../../services/gameLogic';
import Timer from '../Common/Timer.jsx';
import ProgressBadge from '../Common/ProgressBadge.jsx';
import MyScore from '../Common/MyScore.jsx';
import AnswerFeedback from '../Common/AnswerFeedback.jsx';

export default function GameBalance({ game }) {
  const { state } = useGame();
  const feedback = state.feedback;
  const { phase, payload, duration, serverTime, progress } = game;
  const [sent, setSent] = useState(false);
  const [locked, setLocked] = useState(false);

  useEffect(() => {
    setSent(false);
  }, [payload?.puzzle?.id]);

  // The answer buttons appear as soon as the 'answer' phase starts, but
  // stay unclickable for the first `answerDelay` seconds — the server
  // enforces this too, so a locked click can't sneak through either way.
  useEffect(() => {
    const delay = payload?.answerDelay || 0;
    if (phase !== 'answer' || !delay) {
      setLocked(false);
      return undefined;
    }
    setLocked(true);
    const elapsed = (Date.now() - (serverTime || Date.now())) / 1000;
    const remaining = Math.max(0, delay - elapsed);
    const t = setTimeout(() => setLocked(false), remaining * 1000);
    return () => clearTimeout(t);
  }, [phase, payload?.puzzle?.id, payload?.answerDelay, serverTime]);

  if (phase === 'observe') {
    return (
      <div className="page">
        <Timer duration={duration} serverTime={serverTime} />
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
          <ProgressBadge progress={progress} />
          <MyScore />
        </div>
        <span className="pulse-dot" />
        <h1 className="title">Observez les balances à l'écran...</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Déduisez quelle boule est la plus lourde
        </p>
      </div>
    );
  }

  if (phase === 'grayout') return <div className="page" />;

  function submit(color) {
    if (sent || locked) return;
    setSent(true);
    getSocket().emit('player:answer', { value: color });
  }

  const puzzle = payload?.puzzle;
  const choices = puzzle?.colors || [];
  const disabled = sent || locked;

  return (
    <div className="page" style={{ gap: 20 }}>
      <Timer duration={duration} serverTime={serverTime} />
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
        <ProgressBadge progress={progress} />
        <MyScore />
      </div>
      <h1 className="title">Quelle boule est la plus lourde ?</h1>
      {locked && (
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Patientez, la sélection s'ouvre dans un instant...
        </p>
      )}

      <div className="button-grid">
        {choices.map((c) => (
          <button
            key={c}
            disabled={disabled}
            onClick={() => submit(c)}
            className="color-btn"
            style={{
              background: colorHex(c),
              opacity: disabled ? 0.5 : 1
            }}
          />
        ))}
      </div>

      <AnswerFeedback feedback={feedback} correctLabel="Bonne réponse !" wrongLabel="Mauvaise réponse" />
    </div>
  );
}
