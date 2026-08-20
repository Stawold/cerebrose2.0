import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { GAMES_LIST, getRulesText, describeGameStats } from '../services/gameLogic';
import GameIcon from '../components/Common/GameIcon.jsx';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:4000';

export default function RulesOverview() {
  const [stats, setStats] = useState({});
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`${SOCKET_URL}/games`)
      .then((res) => res.json())
      .then((list) => {
        const byId = {};
        list.forEach((g) => { byId[g.id] = g; });
        setStats(byId);
      })
      .catch(() => setError("Impossible de charger le détail des jeux (le serveur est-il démarré ?)"));
  }, []);

  return (
    <div className="page" style={{ gap: 16, alignItems: 'stretch', maxWidth: 640, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: 8 }}>
        <div>
          <h1 className="title" style={{ fontSize: '1.9rem', marginBottom: 4 }}>Fiches des 9 jeux</h1>
          <p className="section-label">Pour se remettre dans le bain avant de lancer une partie</p>
        </div>
        <Link to="/" className="mono" style={{ color: 'var(--ink-66)', fontSize: '0.75rem', textDecoration: 'underline' }}>← Retour au menu</Link>
      </div>

      {error && <p style={{ color: 'var(--coral)' }}>{error}</p>}

      {GAMES_LIST.map((g) => (
        <div key={g.id} className="card" style={{ width: '100%', textAlign: 'left', display: 'flex', gap: 16 }}>
          <GameIcon gameId={g.id} size={56} />
          <div style={{ flex: 1 }}>
            <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '1.1rem', letterSpacing: '-0.03em', margin: '0 0 8px' }}>{g.label}</h2>
            <p style={{ color: 'var(--ink-70)', margin: '0 0 10px', lineHeight: 1.6, fontSize: '0.9rem' }}>{getRulesText(g.id)}</p>
            {stats[g.id] && (
              <span className="pill-badge amber">{describeGameStats(g.id, stats[g.id])}</span>
            )}
          </div>
        </div>
      ))}

      <Link to="/" style={{ alignSelf: 'center', marginTop: 8 }}>
        <button className="btn-secondary">← Retour au menu</button>
      </Link>
    </div>
  );
}
