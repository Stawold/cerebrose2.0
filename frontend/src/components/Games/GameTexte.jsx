import { useEffect, useState } from 'react';
import { getSocket } from '../../services/socketService';
import Timer from '../Common/Timer.jsx';

export default function GameTexte({ game }) {
  const { payload, duration, serverTime, feedback } = game;
  const [values, setValues] = useState({});
  const [results, setResults] = useState({}); // wordIndex -> correct boolean

  useEffect(() => {
    setValues({});
    setResults({});
  }, [payload?.textIndex]);

  useEffect(() => {
    if (feedback && feedback.wordIndex !== undefined) {
      setResults((r) => ({ ...r, [feedback.wordIndex]: feedback.correct }));
    }
  }, [feedback]);

  if (!payload) return <p>Chargement du texte...</p>;
  const { words, faultyIndices } = payload;

  function submitWord(wordIndex) {
    const value = (values[wordIndex] || '').trim();
    if (!value) return;
    getSocket().emit('player:answer', { wordIndex, value });
  }

  return (
    <div className="page">
      <Timer duration={duration} serverTime={serverTime} />
      <p style={{ lineHeight: 2.4 }}>
        {words.map((w, i) =>
          faultyIndices.includes(i) ? (
            <input
              key={i}
              type="text"
              size={Math.max(4, w.length)}
              disabled={results[i] !== undefined}
              className={results[i] === true ? 'flash-correct' : results[i] === false ? 'flash-wrong' : ''}
              value={values[i] ?? ''}
              onChange={(e) => setValues((v) => ({ ...v, [i]: e.target.value }))}
              onKeyDown={(e) => e.key === 'Enter' && submitWord(i)}
              onBlur={() => submitWord(i)}
              style={{ margin: '0 4px' }}
            />
          ) : (
            <span key={i} style={{ marginRight: 6 }}>{w}</span>
          )
        )}
      </p>
    </div>
  );
}
