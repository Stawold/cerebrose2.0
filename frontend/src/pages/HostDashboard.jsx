import { useLocation, useNavigate } from 'react-router-dom';
import { getSocket } from '../services/socketService';
import { useGame } from '../context/GameContext.jsx';
import Avatar from '../components/Common/Avatar.jsx';

const ALL_GAMES = [
  { id: 'calculs', label: 'Calculs mentaux' },
  { id: 'texte', label: 'Correction de texte' },
  { id: 'memoire', label: 'Mémoire des chiffres' },
  { id: 'balance', label: 'Balance' },
  { id: 'heures', label: "Différence d'heures" },
  { id: 'pfc', label: 'Pierre Feuille Ciseaux' },
  { id: 'anagramme', label: 'Anagramme' },
  { id: 'couleurs', label: 'Test des couleurs' },
  { id: 'grille', label: 'Grille spatiale' }
];

export default function HostDashboard() {
  const { state, dispatch } = useGame();
  const navigate = useNavigate();
  const location = useLocation();
  const code = location.state?.code || state.party.code;
  const selected = state.party.selectedGames || [];

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

  function handleStart() {
    getSocket().emit('host:startParty', { code });
    navigate('/rules');
  }

  return (
    <div className="page">
      <h1 className="logo" style={{ fontSize: '2.4rem' }}>Tableau de bord animateur</h1>
      <div className="card">
        <p style={{ color: 'var(--text-muted)', margin: 0 }}>Code de la partie</p>
        <div className="pin-display">{code}</div>
        <p>
          <span className="pill-badge mint">{state.party.players?.length || 0} joueur(s) connecté(s)</span>
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center' }}>
          {(state.party.players || []).map((p) => (
            <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Avatar pseudo={p.pseudo} connected={p.connected} />
              <span>{p.pseudo}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="card">
        <h2>Manches</h2>
        <div className="button-grid">
          <button className="btn-secondary" onClick={() => selectPreset(3)}>3 manches</button>
          <button className="btn-secondary" onClick={() => selectPreset(6)}>6 manches</button>
          <button className="btn-secondary" onClick={() => selectPreset(9)}>9 manches</button>
        </div>
        <br />
        <div className="button-grid">
          {ALL_GAMES.map((g) => (
            <button
              key={g.id}
              className={selected.includes(g.id) ? 'btn-pill-selected' : 'btn-secondary'}
              onClick={() => toggleGame(g.id)}
            >
              {selected.includes(g.id) ? `${selected.indexOf(g.id) + 1}. ` : ''}{g.label}
            </button>
          ))}
        </div>
      </div>
      <button onClick={handleStart} disabled={!selected.length}>Lancer la partie</button>
    </div>
  );
}
