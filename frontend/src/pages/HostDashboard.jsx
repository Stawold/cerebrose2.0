import { useLocation, useNavigate } from 'react-router-dom';
import { getSocket } from '../services/socketService';
import { useGame } from '../context/GameContext.jsx';
import Avatar from '../components/Common/Avatar.jsx';
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

  function toggleGame(id) {
    const next = selected.includes(id) ? selected.filter((g) => g !== id) : [...selected, id];
    dispatch({ type: 'PARTY_UPDATE', payload: { selectedGames: next } });
    getSocket().emit('host:selectGames', { code, gameIds: next });
  }

  function selectPreset(count) {
    const next = ALL_GAMES.slice(0, count).map((g) => g.id);
    dispatch({ type: 'PARTY_UPDATE', payload: { selectedGames: next } });
    getSocket().emit('host:selectGames', { code, gameIds: next });
  }

  function selectDifficulty(id) {
    dispatch({ type: 'PARTY_UPDATE', payload: { difficulty: id } });
    getSocket().emit('host:setDifficulty', { code, difficulty: id });
  }

  function handleStart() {
    getSocket().emit('host:startParty', { code });
    navigate('/rules');
  }

  const playerCount = state.party.players?.length || 0;

  return (
    <div className="page" style={{ gap: 20 }}>
      <h1 className="logo" style={{ fontSize: '2.2rem' }}>Tableau de bord</h1>

      {/* Party code */}
      <div className="card" style={{ maxWidth: 440 }}>
        <span className="section-label">Code de la partie</span>
        <div className="pin-display" style={{ margin: '12px 0' }}>{code}</div>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
          <span className="pill-badge mint">{playerCount} joueur{playerCount !== 1 ? 's' : ''} connecté{playerCount !== 1 ? 's' : ''}</span>
        </div>
        <button
          className="btn-secondary"
          onClick={() => window.open(`/projection?code=${code}`, '_blank', 'noopener')}
          style={{ width: '100%', marginBottom: 16 }}
        >
          🖥️ Ouvrir l'écran de projection (à mettre sur le grand écran)
        </button>
        {playerCount > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center' }}>
            {(state.party.players || []).map((p) => (
              <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.05)', borderRadius: 999, padding: '4px 12px 4px 4px', border: '1px dashed var(--chalk-line-strong)' }}>
                <Avatar pseudo={p.pseudo} connected={p.connected} />
                <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{p.pseudo}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Difficulty */}
      <div className="card" style={{ maxWidth: 560 }}>
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
      <div className="card" style={{ maxWidth: 560 }}>
        <span className="section-label">Configuration des manches</span>
        <h2 style={{ color: 'var(--mint)', margin: '8px 0 16px' }}>Sélection des jeux</h2>
        <div className="button-grid" style={{ marginBottom: 16 }}>
          <button className="btn-secondary" onClick={() => selectPreset(3)}>3 manches</button>
          <button className="btn-secondary" onClick={() => selectPreset(6)}>6 manches</button>
          <button className="btn-secondary" onClick={() => selectPreset(9)}>9 manches</button>
        </div>
        <div style={{ width: '100%', height: '1px', background: 'var(--chalk-line)', margin: '4px 0 16px' }} />
        <div className="button-grid">
          {ALL_GAMES.map((g) => (
            <button
              key={g.id}
              className={selected.includes(g.id) ? 'btn-pill-selected' : 'btn-secondary'}
              onClick={() => toggleGame(g.id)}
              style={{ fontSize: '0.9rem' }}
            >
              {selected.includes(g.id) ? `${selected.indexOf(g.id) + 1}. ` : ''}{g.label}
            </button>
          ))}
        </div>
        {selected.length > 0 && (
          <p style={{ margin: '16px 0 0', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            {selected.length} manche{selected.length > 1 ? 's' : ''} sélectionnée{selected.length > 1 ? 's' : ''}
          </p>
        )}
      </div>

      <button
        onClick={handleStart}
        disabled={!selected.length || playerCount === 0}
        style={{ fontSize: '1.1rem', padding: '14px 40px' }}
      >
        Lancer la partie 🚀
      </button>
      {playerCount === 0 && (
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0 }}>
          En attente de joueurs...
        </p>
      )}
    </div>
  );
}
