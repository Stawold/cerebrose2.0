import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { hostAction } from '../services/socketService';
import { useGame } from '../context/GameContext.jsx';
import Avatar from '../components/Common/Avatar.jsx';
import GameIcon from '../components/Common/GameIcon.jsx';
import { GAMES_LIST as ALL_GAMES } from '../services/gameLogic';

const DIFFICULTIES = [
  { id: 'normal', label: 'Moyen' },
  { id: 'difficile', label: 'Difficile' },
  { id: 'hardcore', label: 'Hardcore' }
];

export default function HostDashboard() {
  const { state, dispatch } = useGame();
  const navigate = useNavigate();
  const location = useLocation();
  const code = location.state?.code || state.party.code;
  const selected = state.party.selectedGames || [];
  const difficulty = state.party.difficulty || 'normal';
  const [startError, setStartError] = useState('');

  function toggleGame(id) {
    const next = selected.includes(id) ? selected.filter((g) => g !== id) : [...selected, id];
    dispatch({ type: 'PARTY_UPDATE', payload: { selectedGames: next } });
    hostAction('host:selectGames', { code, gameIds: next });
  }

  function selectPreset(count) {
    const next = ALL_GAMES.slice(0, count).map((g) => g.id);
    dispatch({ type: 'PARTY_UPDATE', payload: { selectedGames: next } });
    hostAction('host:selectGames', { code, gameIds: next });
  }

  function selectDifficulty(id) {
    dispatch({ type: 'PARTY_UPDATE', payload: { difficulty: id } });
    hostAction('host:setDifficulty', { code, difficulty: id });
  }

  async function handleStart() {
    setStartError('');
    const res = await hostAction('host:startParty', { code });
    if (res && res.ok) navigate('/rules');
    else setStartError("Le lancement n'a pas abouti, réessayez.");
  }

  const playerCount = state.party.players?.length || 0;
  const ordinal = (n) => (n === 1 ? '1re' : `${n}e`);

  return (
    <div className="page" style={{ gap: 20, maxWidth: 560, margin: '0 auto' }}>
      {/* Party code header */}
      <div style={{ width: '100%', background: 'var(--ink)', borderRadius: 6, padding: '20px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
        <span className="section-label on-ink">Code de la partie</span>
        <div className="pin-display" style={{ background: 'transparent', padding: 0 }}>{code}</div>
        <span className="pill-badge on-ink" style={{ borderColor: 'rgba(245,246,242,.4)', color: 'var(--paper-70)' }}>
          {playerCount} joueur{playerCount !== 1 ? 's' : ''} connecté{playerCount !== 1 ? 's' : ''}
        </span>
      </div>

      {playerCount > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'center' }}>
          {(state.party.players || []).map((p) => (
            <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--surface)', border: '1px solid var(--ink-border)', borderRadius: 4, padding: '4px 10px 4px 4px' }}>
              <Avatar pseudo={p.pseudo} connected={p.connected} size={26} />
              <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{p.pseudo}</span>
            </div>
          ))}
        </div>
      )}

      {/* Difficulty */}
      <div className="card" style={{ maxWidth: 560, textAlign: 'left' }}>
        <span className="section-label">Niveau de difficulté</span>
        <div className="button-grid" style={{ marginTop: 12 }}>
          {DIFFICULTIES.map((d) => (
            <button
              key={d.id}
              className={difficulty === d.id ? 'btn-pill-selected' : 'btn-secondary'}
              onClick={() => selectDifficulty(d.id)}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>

      {/* Game selection */}
      <div className="card" style={{ maxWidth: 560, textAlign: 'left' }}>
        <span className="section-label">Configuration des manches</span>
        <div className="button-grid" style={{ margin: '12px 0 16px' }}>
          <button className="btn-secondary" onClick={() => selectPreset(3)}>3 manches</button>
          <button className="btn-secondary" onClick={() => selectPreset(6)}>6 manches</button>
          <button className="btn-secondary" onClick={() => selectPreset(9)}>9 manches</button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
          {ALL_GAMES.map((g) => {
            const order = selected.indexOf(g.id);
            return (
              <div key={g.id} onClick={() => toggleGame(g.id)} style={{ cursor: 'pointer', display: 'flex', justifyContent: 'center' }}>
                <GameIcon gameId={g.id} size={78} selected={order >= 0} badge={order >= 0 ? ordinal(order + 1) : null} />
              </div>
            );
          })}
        </div>
        {selected.length > 0 && (
          <p style={{ margin: '16px 0 0', color: 'var(--ink-66)', fontSize: '0.8rem' }}>
            {selected.length} manche{selected.length > 1 ? 's' : ''} sélectionnée{selected.length > 1 ? 's' : ''}
          </p>
        )}
      </div>

      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <button
          className="btn-secondary"
          onClick={() => window.open(`/projection?code=${code}`, '_blank', 'noopener')}
          style={{ width: '100%' }}
        >
          Ouvrir l'écran de projection
        </button>
        <button
          onClick={handleStart}
          disabled={!selected.length || playerCount === 0}
          className="btn-validate"
        >
          Lancer la partie
        </button>
      </div>
      {playerCount === 0 && (
        <p style={{ color: 'var(--ink-66)', fontSize: '0.8rem', margin: 0 }}>
          En attente de joueurs...
        </p>
      )}
      {startError && (
        <p style={{ color: 'var(--coral)', fontSize: '0.8rem', margin: 0 }}>{startError}</p>
      )}
    </div>
  );
}
