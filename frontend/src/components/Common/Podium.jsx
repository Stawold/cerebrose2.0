import Avatar from './Avatar.jsx';

// Top 3 as cards side by side (1st in amber fill), rank 4+ as a table row
// with a proportional score bar — a session of 10-30 people reads better
// as a table than as a staircase.
export default function Podium({ leaderboard }) {
  const top3 = leaderboard.slice(0, 3);
  const rest = leaderboard.slice(3);
  const maxScore = leaderboard[0]?.total || 1;

  return (
    <>
      <div className="podium-top3">
        {top3.map((p, i) => {
          const rank = i + 1;
          return (
            <div key={p.id} className={`podium-card rank-${rank} pop-in`}>
              <span className="rank-tag mono">RANG {String(rank).padStart(2, '0')}</span>
              <Avatar pseudo={p.pseudo} size={44} />
              <span className="podium-name">{p.pseudo}</span>
              <span className="podium-score">{p.total} pts</span>
            </div>
          );
        })}
      </div>
      {rest.length > 0 && (
        <div className="rank-list">
          {rest.map((p, i) => (
            <div className="rank-row" key={p.id}>
              <span className="rank-number">{i + 4}</span>
              <Avatar pseudo={p.pseudo} size={28} />
              <span className="name" style={{ flex: 1, textAlign: 'left' }}>{p.pseudo}</span>
              <span className="score">{p.total} pts</span>
              <div className="score-bar" style={{ width: `${Math.max(4, (p.total / maxScore) * 100)}%` }} />
            </div>
          ))}
        </div>
      )}
    </>
  );
}
