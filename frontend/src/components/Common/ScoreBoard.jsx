import Avatar from './Avatar.jsx';

export default function ScoreBoard({ players, scores }) {
  const sorted = [...players].sort((a, b) => (scores[b.id] || 0) - (scores[a.id] || 0));
  return (
    <div className="scoreboard card">
      {sorted.map((p) => (
        <div className="scoreboard-row" key={p.id}>
          <Avatar pseudo={p.pseudo} connected={p.connected} size={32} />
          <span>{p.pseudo}</span>
          <span className="score">{scores[p.id] || 0}</span>
        </div>
      ))}
    </div>
  );
}
