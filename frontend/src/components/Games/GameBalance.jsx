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

  // One single timer runs for the whole puzzle — the buttons are visible
  // from the start but stay unclickable for the first `answerDelay`
  // seconds (server enforces this too, so a locked click can't sneak in).
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

  if (phase === 'grayout') {
    return (
      <div className="page">
        <MyScore />
        <AnswerFeedback feedback={feedback} correctLabel="Bonne réponse !" wrongLabel="Mauvaise réponse" />
      </div>
    );
  }

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
      <p style={{ color: 'var(--ink-66)', fontSize: '0.9rem' }}>
        Observez les balances sur l'écran de projection
      </p>
      {locked && (
        <p className="pill-badge amber">
          Réponse possible dans un instant...
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
