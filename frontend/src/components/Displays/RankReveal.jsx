import { useEffect, useState } from 'react';

// Reveals the top `limit` entries one at a time, counting down from the
// worst-placed of the bunch up to 1st place, for suspense on the big screen.
// Anyone beyond the limit is still shown underneath, immediately, so the
// full standings stay visible for larger groups.
// entries: [{ rank, pseudo, value }], already sorted ascending by rank.
export default function RankReveal({ entries, limit, valueLabel, resetKey, big = false }) {
  const top = entries.slice(0, limit);
  const rest = entries.slice(limit);
  const [revealedCount, setRevealedCount] = useState(0);

  useEffect(() => {
    setRevealedCount(0);
    if (!top.length) return undefined;
    const interval = setInterval(() => {
      setRevealedCount((c) => {
        const next = c + 1;
        if (next >= top.length) clearInterval(interval);
        return Math.min(next, top.length);
      });
    }, 1100);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetKey, limit]);

  const revealOrder = [...top].reverse(); // worst-of-top-N first, 1st place last
  const shown = revealOrder.slice(0, revealedCount).reverse(); // back to ascending rank for display

  const rowStyle = big ? { fontSize: '1.5rem', padding: '18px 26px' } : undefined;
  const listStyle = big ? { maxWidth: 'min(90vw, 900px)' } : undefined;
  const maxValue = Math.max(1, ...entries.map((e) => e.value));

  return (
    <div>
      <div className="rank-list" style={listStyle}>
        {shown.map((e) => (
          <div className={`rank-row pop-in${e.rank === 1 ? ' rank-first' : ''}`} key={e.rank} style={rowStyle}>
            <span className="rank-number">{e.rank}</span>
            <span className="name" style={{ flex: 1, textAlign: 'left' }}>{e.pseudo}</span>
            <span className="score">{e.value} {valueLabel}</span>
            <div className="score-bar" style={{ width: `${Math.max(4, (e.value / maxValue) * 100)}%` }} />
          </div>
        ))}
      </div>

      {rest.length > 0 && revealedCount >= top.length && (
        <div style={{ marginTop: 16 }}>
          <p className="section-label" style={big ? { marginBottom: 8, fontSize: '1rem' } : { marginBottom: 8 }}>Reste du classement</p>
          <div className="rank-list" style={listStyle}>
            {rest.map((e) => (
              <div className="rank-row" key={e.rank} style={{ opacity: 0.7, ...rowStyle }}>
                <span className="rank-number">{e.rank}</span>
                <span className="name" style={{ flex: 1, textAlign: 'left' }}>{e.pseudo}</span>
                <span className="score">{e.value} {valueLabel}</span>
                <div className="score-bar" style={{ width: `${Math.max(4, (e.value / maxValue) * 100)}%` }} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
