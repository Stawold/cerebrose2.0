import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { GAMES_LIST, getRulesText, describeGameStats } from '../services/gameLogic';

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
    <div className="page" style={{ gap: 20, alignItems: 'stretch', maxWidth: 720, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: 8 }}>
        <div>
          <h1 className="logo" style={{ fontSize: '2rem', marginBottom: 4 }}>Règles des jeux</h1>
          <p className="section-label">Pour se remettre dans le bain avant de lancer une partie</p>
        </div>
        <Link to="/" style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>← Retour au menu</Link>
      </div>

      {error && <p style={{ color: 'var(--coral)' }}>{error}</p>}

      {GAMES_LIST.map((g) => (
        <div key={g.id} className="card" style={{ width: '100%', textAlign: 'left' }}>
          <h2 style={{ color: 'var(--violet)', margin: '0 0 8px' }}>{g.label}</h2>
          <p style={{ color: 'var(--text)', margin: '0 0 10px', lineHeight: 1.6 }}>{getRulesText(g.id)}</p>
          {stats[g.id] && (
            <span className="pill-badge amber">{describeGameStats(g.id, stats[g.id])}</span>
          )}
        </div>
      ))}

      <Link to="/" style={{ alignSelf: 'center', marginTop: 8 }}>
        <button>← Retour au menu</button>
      </Link>
    </div>
  );
}
