export default function ScoreBoard({ players, scores }) {
  const sorted = [...players].sort((a, b) => (scores[b.id] || 0) - (scores[a.id] || 0));
  return (
    <div className="scoreboard card">
      {sorted.map((p) => (
        <div className="scoreboard-row" key={p.id}>
          <span>{p.pseudo}</span>
          <span>{scores[p.id] || 0}</span>
        </div>
      ))}
    </div>
  );
}
