import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useGame } from '../context/GameContext.jsx';
import { emitWithAck, getSocket } from '../services/socketService';
import {
  fetchGamesConfig,
  fetchGameData,
  saveGameData,
  getAdminPassword,
  setAdminPassword,
  clearAdminPassword,
  verifyAdminPassword
} from '../services/adminService';
import Podium from '../components/Common/Podium.jsx';
import GameVisual from '../components/Displays/GameVisual.jsx';
import GameCalculs from '../components/Games/GameCalculs.jsx';
import GameTexte from '../components/Games/GameTexte.jsx';
import GameMemoire from '../components/Games/GameMemoire.jsx';
import GameBalance from '../components/Games/GameBalance.jsx';
import GameHeures from '../components/Games/GameHeures.jsx';
import GamePFC from '../components/Games/GamePFC.jsx';
import GameCouleurs from '../components/Games/GameCouleurs.jsx';
import GameGrille from '../components/Games/GameGrille.jsx';
import GameAnagramme from '../components/Games/GameAnagramme.jsx';

const PLAYER_COMPONENTS = {
  calculs: GameCalculs,
  texte: GameTexte,
  memoire: GameMemoire,
  anagramme: GameAnagramme,
  balance: GameBalance,
  heures: GameHeures,
  pfc: GamePFC,
  couleurs: GameCouleurs,
  grille: GameGrille
};

export default function TestLab() {
  const [tab, setTab] = useState('play');
  const [games, setGames] = useState([]);
  const [gamesError, setGamesError] = useState('');
  const [authed, setAuthed] = useState(null); // null = checking, false = login needed, true = in

  useEffect(() => {
    getSocket();
    if (!getAdminPassword()) {
      setAuthed(false);
      return;
    }
    verifyAdminPassword()
      .then(() => setAuthed(true))
      .catch(() => setAuthed(false));
  }, []);

  useEffect(() => {
    if (!authed) return;
    fetchGamesConfig()
      .then(setGames)
      .catch((err) => setGamesError(err.message));
  }, [authed]);

  return (
    <div className="page" style={{ gap: 20, alignItems: 'stretch', maxWidth: 900, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: 8 }}>
        <div>
          <h1 className="logo" style={{ fontSize: '2rem', marginBottom: 4 }}>Outil de test</h1>
          <p className="section-label">Contenu &amp; bac à sable — n'affecte pas les vraies parties</p>
        </div>
        <Link to="/" style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>← Retour à l'accueil</Link>
      </div>

      {authed !== true ? (
        <AdminLogin onSuccess={() => setAuthed(true)} />
      ) : (
        <>
          {gamesError && <p style={{ color: 'var(--coral)' }}>{gamesError}</p>}

          <div style={{ display: 'flex', gap: 8 }}>
            <button className={tab === 'play' ? '' : 'btn-secondary'} onClick={() => setTab('play')}>
              Tester un jeu
            </button>
            <button className={tab === 'data' ? '' : 'btn-secondary'} onClick={() => setTab('data')}>
              Contenu des jeux
            </button>
            <button
              className="btn-secondary"
              style={{ marginLeft: 'auto' }}
              onClick={() => { clearAdminPassword(); setAuthed(false); }}
            >
              Verrouiller
            </button>
          </div>

          {tab === 'play' && <PlayTester games={games} />}
          {tab === 'data' && <DataEditor games={games} />}
        </>
      )}
    </div>
  );
}

function AdminLogin({ onSuccess }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [checking, setChecking] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setError('');
    setChecking(true);
    setAdminPassword(password);
    try {
      await verifyAdminPassword();
      onSuccess();
    } catch (err) {
      setError(err.message);
    } finally {
      setChecking(false);
    }
  }

  return (
    <form onSubmit={submit} className="card" style={{ maxWidth: 380 }}>
      <span className="section-label">Accès protégé</span>
      <h2 style={{ margin: '8px 0 16px' }}>Mot de passe admin</h2>
      <input
        type="password"
        autoFocus
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Mot de passe"
        style={{ marginBottom: 12 }}
      />
      <button type="submit" disabled={checking || !password} style={{ width: '100%' }}>
        {checking ? 'Vérification…' : 'Entrer'}
      </button>
      {error && <p style={{ color: 'var(--coral)', marginTop: 12 }}>{error}</p>}
    </form>
  );
}

function PlayTester({ games }) {
  const { state, dispatch } = useGame();
  const [selected, setSelected] = useState('');
  const [testCode, setTestCode] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => () => {
    if (testCode) getSocket().emit('test:endSolo', { code: testCode });
  }, [testCode]);

  async function launch(gameId) {
    setError('');
    const res = await emitWithAck('test:startSolo', { gameId, password: getAdminPassword() });
    if (!res || !res.ok) {
      setError((res && res.error) || 'Impossible de démarrer le test');
      return;
    }
    setSelected(gameId);
    setTestCode(res.code);
  }

  function skip() {
    if (testCode) getSocket().emit('test:skip', { code: testCode });
  }

  function stop() {
    if (testCode) getSocket().emit('test:endSolo', { code: testCode });
    setTestCode(null);
    setSelected('');
    dispatch({ type: 'RESET' });
  }

  if (testCode) {
    const PlayerComponent = PLAYER_COMPONENTS[state.game.type];
    return (
      <div className="card" style={{ position: 'relative' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
          <span className="section-label">Test en cours : {selected}</span>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn-secondary" onClick={skip}>Passer →</button>
            <button className="btn-secondary" onClick={stop}>Quitter le test</button>
          </div>
        </div>

        {state.reveal.stage === 'leaderboard' ? (
          <div>
            <h2 style={{ color: 'var(--mint)' }}>Test terminé</h2>
            <Podium leaderboard={state.reveal.leaderboard} />
            <button style={{ marginTop: 16 }} onClick={stop}>Nouveau test</button>
          </div>
        ) : state.game.type && state.game.phase ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div className="test-lab-screen">
              <span className="test-lab-screen-label" style={{ color: 'var(--violet)' }}>
                📽️ Écran de diffusion (projection)
              </span>
              <div className="test-lab-screen-body">
                <GameVisual game={state.game} />
                <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                  Score : {Object.values(state.game.scores || {})[0] ?? 0}
                </p>
              </div>
            </div>

            <div className="test-lab-screen">
              <span className="test-lab-screen-label" style={{ color: 'var(--coral)' }}>
                📱 Écran joueur
              </span>
              <div className="test-lab-screen-body">
                {PlayerComponent ? <PlayerComponent game={state.game} /> : <p style={{ color: 'var(--text-muted)' }}>Pas de composant joueur dédié.</p>}
              </div>
            </div>
          </div>
        ) : (
          <p style={{ color: 'var(--text-muted)' }}>Chargement du jeu…</p>
        )}
      </div>
    );
  }

  return (
    <div className="card">
      <span className="section-label">Choisir un jeu à tester (mode solo)</span>
      <div className="button-grid" style={{ marginTop: 12 }}>
        {games.map((g) => (
          <button key={g.id} onClick={() => launch(g.id)}>
            {g.label}
          </button>
        ))}
      </div>
      {error && <p style={{ color: 'var(--coral)', marginTop: 12 }}>{error}</p>}
      <p style={{ color: 'var(--text-muted)', marginTop: 16, fontSize: '0.85rem' }}>
        Vous jouez la partie vous-même. Utilisez « Passer » pour forcer la fin de la question/manche
        en cours sans attendre le minuteur.
      </p>
    </div>
  );
}

function DataEditor({ games }) {
  const [selected, setSelected] = useState('');
  const [text, setText] = useState('');
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');

  async function select(gameId) {
    setSelected(gameId);
    setStatus('');
    setError('');
    try {
      const res = await fetchGameData(gameId);
      setText(JSON.stringify(res.content, null, 2));
    } catch (err) {
      setError(err.message);
      setText('');
    }
  }

  async function save() {
    setStatus('');
    setError('');
    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch (err) {
      setError(`JSON invalide : ${err.message}`);
      return;
    }
    try {
      await saveGameData(selected, parsed);
      setStatus('Enregistré ✓');
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="card">
      <span className="section-label">Contenu (données) des jeux</span>
      <div className="button-grid" style={{ marginTop: 12, marginBottom: 16 }}>
        {games.map((g) => (
          <button
            key={g.id}
            className={selected === g.id ? 'btn-pill-selected' : 'btn-secondary'}
            onClick={() => select(g.id)}
          >
            {g.label}
          </button>
        ))}
      </div>

      {selected && (
        <>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            spellCheck={false}
            style={{
              width: '100%',
              minHeight: 360,
              fontFamily: 'monospace',
              fontSize: '0.85rem',
              background: 'var(--chalk-deep)',
              color: 'var(--text)',
              border: 'var(--chalk-border)',
              borderRadius: 8,
              padding: 12,
              boxSizing: 'border-box'
            }}
          />
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginTop: 12 }}>
            <button onClick={save}>Enregistrer</button>
            {status && <span style={{ color: 'var(--mint)' }}>{status}</span>}
            {error && <span style={{ color: 'var(--coral)' }}>{error}</span>}
          </div>
        </>
      )}
    </div>
  );
}
