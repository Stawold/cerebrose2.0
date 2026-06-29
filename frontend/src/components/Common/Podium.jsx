import Avatar from './Avatar.jsx';

// Top 3 shown as podium bars, the rest as a ranked list below.
export default function Podium({ leaderboard }) {
  const top3 = leaderboard.slice(0, 3);
  const rest = leaderboard.slice(3);
  const order = [1, 0, 2].filter((i) => top3[i]);

  return (
    <>
      <div className="podium">
        {order.map((i) => {
          const p = top3[i];
          const rank = i + 1;
          return (
            <div key={p.id} className={`podium-step rank-${rank} pop-in`}>
              <Avatar pseudo={p.pseudo} size={44} />
              <span className="podium-name">{p.pseudo}</span>
              <div className="podium-bar">{rank}</div>
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
              <span>{p.pseudo}</span>
              <span className="score">{p.total} pts</span>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
