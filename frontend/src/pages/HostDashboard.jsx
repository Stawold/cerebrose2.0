import { useLocation, useNavigate } from 'react-router-dom';
import { getSocket } from '../services/socketService';
import { useGame } from '../context/GameContext.jsx';

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
      <h1 className="title">Tableau de bord animateur</h1>
      <div className="card">
        <h2>Code de la partie : {code}</h2>
        <p>Joueurs connectés : {state.party.players?.length || 0}</p>
        <ul style={{ textAlign: 'left' }}>
          {(state.party.players || []).map((p) => (
            <li key={p.id}>{p.pseudo} {p.connected ? '' : '(déconnecté)'}</li>
          ))}
        </ul>
      </div>
      <div className="card">
        <h2>Manches</h2>
        <div className="button-grid">
          <button onClick={() => selectPreset(3)}>3 manches</button>
          <button onClick={() => selectPreset(6)}>6 manches</button>
          <button onClick={() => selectPreset(9)}>9 manches</button>
        </div>
        <br />
        <div className="button-grid">
          {ALL_GAMES.map((g) => (
            <button
              key={g.id}
              onClick={() => toggleGame(g.id)}
              style={selected.includes(g.id) ? { background: 'var(--gold)', color: '#1a1a2e' } : {}}
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
