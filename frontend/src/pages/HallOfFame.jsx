import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { GAMES_LIST } from '../services/gameLogic';
import GameIcon from '../components/Common/GameIcon.jsx';

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
    <div className="page" style={{ gap: 16, alignItems: 'stretch', maxWidth: 640, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: 8 }}>
        <div>
          <h1 className="title" style={{ fontSize: '1.9rem', marginBottom: 4 }}>Records</h1>
          <p className="section-label">Le top 5 all-time de chaque jeu</p>
        </div>
        <Link to="/" className="mono" style={{ color: 'var(--ink-66)', fontSize: '0.75rem', textDecoration: 'underline' }}>← Retour au menu</Link>
      </div>

      {error && <p style={{ color: 'var(--coral)' }}>{error}</p>}

      {GAMES_LIST.map((g) => {
        const entries = records[g.id] || [];
        return (
          <div key={g.id} className="card" style={{ width: '100%', textAlign: 'left', display: 'flex', gap: 16 }}>
            <GameIcon gameId={g.id} size={56} />
            <div style={{ flex: 1 }}>
              <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '1.1rem', letterSpacing: '-0.03em', margin: '0 0 10px' }}>{g.label}</h2>
              {entries.length === 0 ? (
                <p style={{ color: 'var(--ink-66)', margin: 0, fontStyle: 'italic', fontSize: '0.9rem' }}>
                  Aucun record pour l'instant — soyez les premiers !
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {entries.map((e, i) => (
                    <div
                      key={i}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        padding: '6px 10px',
                        borderRadius: 4,
                        background: i === 0 ? 'var(--amber-dim)' : 'transparent'
                      }}
                    >
                      <span className="mono" style={{ fontWeight: 600, color: 'var(--amber)', width: 20 }}>{i + 1}.</span>
                      <span style={{ flex: 1, fontWeight: 600 }}>{e.pseudo}</span>
                      <span className="mono" style={{ fontWeight: 600 }}>{e.score} pts</span>
                      <span className="mono" style={{ color: 'var(--ink-38)', fontSize: '0.75rem' }}>{formatDate(e.date)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      })}

      <Link to="/" style={{ alignSelf: 'center', marginTop: 8 }}>
        <button className="btn-secondary">← Retour au menu</button>
      </Link>
    </div>
  );
}
