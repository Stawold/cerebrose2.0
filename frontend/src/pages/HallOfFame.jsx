import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { GAMES_LIST } from '../services/gameLogic';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:4000';

function formatDate(iso) {
  try {
    return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  } catch {
    return '';
  }
}

export default function HallOfFame() {
  const [records, setRecords] = useState({});
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`${SOCKET_URL}/hall-of-fame`)
      .then((res) => res.json())
      .then(setRecords)
      .catch(() => setError("Impossible de charger le Hall of Fame (le serveur est-il démarré ?)"));
  }, []);

  return (
    <div className="page" style={{ gap: 20, alignItems: 'stretch', maxWidth: 720, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: 8 }}>
        <div>
          <h1 className="logo" style={{ fontSize: '2rem', marginBottom: 4 }}>🏆 Hall of Fame</h1>
          <p className="section-label">Le top 5 all-time de chaque jeu</p>
        </div>
        <Link to="/" style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>← Retour au menu</Link>
      </div>

      {error && <p style={{ color: 'var(--coral)' }}>{error}</p>}

      {GAMES_LIST.map((g) => {
        const entries = records[g.id] || [];
        return (
          <div key={g.id} className="card" style={{ width: '100%', textAlign: 'left' }}>
            <h2 style={{ color: 'var(--amber)', margin: '0 0 12px' }}>{g.label}</h2>
            {entries.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', margin: 0, fontStyle: 'italic' }}>
                Aucun record pour l'instant — soyez les premiers !
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {entries.map((e, i) => (
                  <div
                    key={i}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: '6px 10px',
                      borderRadius: 8,
                      background: i === 0 ? 'var(--amber-dim)' : 'transparent'
                    }}
                  >
                    <span style={{ fontWeight: 700, color: 'var(--amber)', width: 20 }}>{i + 1}.</span>
                    <span style={{ flex: 1, fontWeight: 600 }}>{e.pseudo}</span>
                    <span style={{ fontWeight: 700 }}>{e.score} pts</span>
                    <span style={{ color: 'var(--text-faint)', fontSize: '0.8rem' }}>{formatDate(e.date)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}

      <Link to="/" style={{ alignSelf: 'center', marginTop: 8 }}>
        <button>← Retour au menu</button>
      </Link>
    </div>
  );
}
