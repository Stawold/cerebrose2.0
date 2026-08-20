import { useEffect, useRef, useState } from 'react';
import { getSocket } from '../../services/socketService';
import { useGame } from '../../context/GameContext.jsx';
import Timer from '../Common/Timer.jsx';
import ProgressBadge from '../Common/ProgressBadge.jsx';
import { useAutoSubmitOnExpiry } from '../../services/useAutoSubmitOnExpiry';

const MAX_ATTEMPTS = 10;

export default function GameTexte({ game }) {
  const { state } = useGame();
  const feedback = state.feedback;
  const { payload, duration, serverTime, progress } = game;

  const [value, setValue] = useState('');
  const [history, setHistory] = useState([]); // [{ word, correct }]
  const [attemptsLeft, setAttemptsLeft] = useState(MAX_ATTEMPTS);
  const [foundCount, setFoundCount] = useState(0);
  const [flash, setFlash] = useState('');
  const lastWord = useRef('');

  const totalCorrections = payload?.totalCorrections || 10;
  const done = attemptsLeft <= 0 || foundCount >= totalCorrections;

  // Reset on new text
  useEffect(() => {
    setValue('');
    setHistory([]);
    setAttemptsLeft(MAX_ATTEMPTS);
    setFoundCount(0);
    lastWord.current = '';
  }, [payload?.textIndex]);

  // Feedback received from server
  useEffect(() => {
    if (!feedback || lastWord.current === '') return;
    setHistory((h) => [{ word: lastWord.current, correct: feedback.correct }, ...h].slice(0, MAX_ATTEMPTS));
    if (feedback.attemptsLeft !== undefined) setAttemptsLeft(feedback.attemptsLeft);
    if (feedback.correct && feedback.foundCount !== undefined) setFoundCount(feedback.foundCount);
    setFlash(feedback.correct ? 'flash-correct' : 'flash-wrong');
    const t = setTimeout(() => setFlash(''), 500);
    lastWord.current = '';
    return () => clearTimeout(t);
  }, [feedback]);

  function submit() {
    if (!value.trim() || done) return;
    lastWord.current = value.trim();
    getSocket().emit('player:answer', { value: value.trim() });
    setValue('');
  }

  useAutoSubmitOnExpiry(duration, serverTime, () => { if (value.trim() && !done) submit(); });

  return (
    <div className="page" style={{ gap: 16 }}>
      <Timer duration={duration} serverTime={serverTime} />

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
        <ProgressBadge progress={progress} />
        <span className="pill-badge mint">{foundCount} / {totalCorrections} trouvées</span>
        <span className={`pill-badge ${attemptsLeft <= 3 ? 'coral' : 'amber'}`}>
          {attemptsLeft} tentative{attemptsLeft !== 1 ? 's' : ''} restante{attemptsLeft !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="card" style={{ maxWidth: 640, width: '100%', display: 'flex', gap: 20, flexWrap: 'wrap', alignItems: 'flex-start' }}>
        <div style={{ flex: '1 1 260px', minWidth: 220 }}>
          {done ? (
            <p style={{ color: foundCount >= totalCorrections ? 'var(--mint)' : 'var(--text-muted)', fontWeight: 700, margin: '0 0 12px' }}>
              {foundCount >= totalCorrections ? '🎉 Toutes les fautes trouvées !' : 'Plus de tentatives !'}
            </p>
          ) : (
            <p className="section-label" style={{ marginBottom: 12 }}>
              Lisez le texte sur l'écran, tapez une correction
            </p>
          )}

          <input
            type="text"
            autoFocus
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            disabled={done}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && submit()}
            placeholder="Mot corrigé…"
            className={flash}
          />
          <button
            onClick={submit}
            disabled={done}
            className="btn-validate"
            style={{ marginTop: 12 }}
          >
            Valider
          </button>
        </div>

        {/* Side column: color-coded history of past answers */}
        {history.length > 0 && (
          <div style={{
            flex: '0 0 140px',
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
            maxHeight: 260,
            overflowY: 'auto',
            paddingLeft: 16,
            borderLeft: '1px solid var(--ink-border)'
          }}>
            {history.map((entry, i) => (
              <span
                key={i}
                style={{
                  padding: '4px 12px',
                  borderRadius: 4,
                  borderLeft: `3px solid ${entry.correct ? 'var(--mint)' : 'var(--coral)'}`,
                  fontFamily: "'IBM Plex Sans', sans-serif",
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  textAlign: 'left',
                  background: entry.correct ? 'var(--mint-dim)' : 'var(--coral-dim)',
                  color: 'var(--ink)',
                  opacity: i === 0 ? 1 : 0.55 + (history.length - i) * 0.04
                }}
              >
                {entry.word}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
