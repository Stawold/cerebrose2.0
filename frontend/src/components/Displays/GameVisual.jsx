import Timer from '../Common/Timer.jsx';

// Big-screen visualisation shared by the host dashboard and the projection screen.
export default function GameVisual({ game }) {
  if (!game || !game.type) return <p>En attente...</p>;
  const { type, phase, payload, duration, serverTime } = game;

  return (
    <div className="card" style={{ maxWidth: 800 }}>
      <h2>{type}</h2>
      {duration > 0 && <Timer duration={duration} serverTime={serverTime} />}
      {renderByType(type, phase, payload)}
    </div>
  );
}

function renderByType(type, phase, payload) {
  if (!payload) return null;
  switch (type) {
    case 'calculs':
      return <p>{payload.questions?.length} calculs envoyés aux téléphones des joueurs.</p>;
    case 'texte':
      return (
        <p style={{ lineHeight: 2 }}>
          {payload.words.map((w, i) => (
            <span
              key={i}
              style={{ color: payload.faultyIndices.includes(i) ? 'var(--gold)' : 'inherit', marginRight: 6 }}
            >
              {w}
            </span>
          ))}
        </p>
      );
    case 'memoire':
      if (phase === 'display') return <h1 style={{ fontSize: '3rem', letterSpacing: 8 }}>{payload.sequence}</h1>;
      return <p>Saisissez la séquence sur votre téléphone...</p>;
    case 'anagramme':
      if (phase === 'play') return <h1 style={{ fontSize: '2.5rem', letterSpacing: 6 }}>{payload.scrambled}</h1>;
      if (phase === 'result')
        return (
          <p>
            {payload.winnerPseudo ? `${payload.winnerPseudo} a trouvé : ${payload.answer}` : `Personne n'a trouvé : ${payload.answer}`}
          </p>
        );
      return null;
    default:
      // generic-engine games: balance, heures, pfc, couleurs, grille
      if (phase === 'observe' || phase === 'answer') {
        return <GenericVisual type={type} item={payload.item} />;
      }
      return null;
  }
}

function GenericVisual({ type, item }) {
  if (!item) return null;
  if (type === 'balance') return <p>⚖️ {item.leftColor} vs {item.rightColor}</p>;
  if (type === 'heures') return <p>🕐 {item.value1} ({item.type1}) — 🕐 {item.value2} ({item.type2})</p>;
  if (type === 'pfc') return <p>{item.shape.toUpperCase()} — Consigne : {item.instruction === 'win' ? 'Gagnez' : 'Perdez'}</p>;
  if (type === 'couleurs')
    return <h1 style={{ color: item.color, fontSize: '3rem' }}>{item.word.toUpperCase()}</h1>;
  if (type === 'grille')
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(9, 20px)', gap: 2, justifyContent: 'center' }}>
        {item.grid.flat().map((c, i) => (
          <div key={i} style={{ width: 20, height: 20, background: colorHex(c) }} />
        ))}
      </div>
    );
  return null;
}

function colorHex(name) {
  const map = { vert: '#00d966', rouge: '#ff6b6b', jaune: '#ffd700', violet: '#9b5de5' };
  return map[name] || '#888';
}
