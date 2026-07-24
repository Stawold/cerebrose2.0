import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { emitWithAck, getSocket } from '../services/socketService';
import { useGame } from '../context/GameContext.jsx';

export default function LobbyPage() {
  const { dispatch } = useGame();
  const navigate = useNavigate();
  const [pseudo, setPseudo] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    getSocket();
    const savedHost = localStorage.getItem('cerebrose_host');
    const savedPlayer = localStorage.getItem('cerebrose_player');
    if (savedHost) {
      const { code: savedCode } = JSON.parse(savedHost);
      emitWithAck('host:rejoinParty', { code: savedCode }).then((res) => {
        if (res && res.ok) {
          dispatch({ type: 'SET_HOST' });
          const phase = res.phase;
          if (phase === 'lobby') navigate('/host', { state: { code: savedCode } });
          else navigate('/game', { state: { code: savedCode } });
        } else {
          localStorage.removeItem('cerebrose_host');
        }
      });
    } else if (savedPlayer) {
      const { code: savedCode, pseudo: savedPseudo, playerId } = JSON.parse(savedPlayer);
      emitWithAck('player:rejoinParty', { code: savedCode, pseudo: savedPseudo, playerId }).then((res) => {
        if (res && res.ok) {
          dispatch({ type: 'SET_PLAYER_IDENTITY', playerId, pseudo: savedPseudo });
          const phase = res.phase;
          if (phase === 'playing' || phase === 'roundFinished') navigate('/game', { state: { code: savedCode } });
          else if (phase === 'finished') { localStorage.removeItem('cerebrose_player'); }
          else navigate('/rules', { state: { code: savedCode } });
        } else {
          localStorage.removeItem('cerebrose_player');
        }
      });
    }
  }, []);

  async function handleCreateParty() {
    const res = await emitWithAck('host:createParty', {});
    if (res && res.ok) {
      dispatch({ type: 'SET_HOST' });
      localStorage.setItem('cerebrose_host', JSON.stringify({ code: res.code }));
      navigate('/host', { state: { code: res.code } });
    }
  }

  async function handleJoin() {
    if (!pseudo.trim() || !code.trim()) {
      setError('Pseudo et code requis');
      return;
    }
    const res = await emitWithAck('player:joinParty', { code: code.trim(), pseudo: pseudo.trim() });
    if (!res || !res.ok) {
      setError((res && res.error) || 'Erreur de connexion');
      return;
    }
    localStorage.setItem('cerebrose_player', JSON.stringify({ code: code.trim(), pseudo: pseudo.trim(), playerId: res.playerId }));
    dispatch({ type: 'SET_PLAYER_IDENTITY', playerId: res.playerId, pseudo: pseudo.trim() });
    navigate('/rules');
  }

  return (
    <div className="page" style={{ gap: 24 }}>
      <div style={{ marginBottom: 8 }}>
        <h1 className="logo" style={{ fontSize: '3.5rem', marginBottom: 4 }}>Cérébr'Ose</h1>
        <p className="section-label">Le quiz qui fait travailler les neurones</p>
      </div>

      <div className="card" style={{ maxWidth: 440 }}>
        <span className="section-label">Animateur</span>
        <h2 style={{ color: 'var(--violet)', margin: '8px 0 12px' }}>Créer une partie</h2>
        <p style={{ color: 'var(--text-muted)', margin: '0 0 20px', fontSize: '0.95rem' }}>
          Configurez les manches et invitez vos joueurs.
        </p>
        <button onClick={handleCreateParty} style={{ width: '100%' }}>
          Créer une partie
        </button>
      </div>

      <div className="card" style={{ maxWidth: 440 }}>
        <span className="section-label">Joueur</span>
        <h2 style={{ color: 'var(--coral)', margin: '8px 0 20px' }}>Rejoindre</h2>
        <input
          type="text"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          placeholder="Ton pseudo"
          value={pseudo}
          onChange={(e) => setPseudo(e.target.value)}
          style={{ marginBottom: 12 }}
        />
        <input
          type="text"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          placeholder="Code à 6 chiffres"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          style={{ marginBottom: 16 }}
        />
        <button
          onClick={handleJoin}
          style={{ width: '100%', background: 'var(--coral)', color: '#0e180e', boxShadow: '0 4px 16px rgba(252,165,165,0.3)' }}
        >
          Rejoindre
        </button>
        {error && (
          <p style={{ color: 'var(--coral)', margin: '12px 0 0', fontSize: '0.9rem' }}>{error}</p>
        )}
      </div>

      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
        <Link
          to="/regles"
          style={{
            display: 'inline-block',
            textDecoration: 'none',
            color: 'var(--text)',
            fontWeight: 600,
            fontSize: '0.9rem',
            padding: '10px 20px',
            borderRadius: 999,
            border: '2px dashed var(--chalk-line-strong)'
          }}
        >
          📖 Règles des jeux
        </Link>
        <Link
          to="/hall-of-fame"
          style={{
            display: 'inline-block',
            textDecoration: 'none',
            color: 'var(--text)',
            fontWeight: 600,
            fontSize: '0.9rem',
            padding: '10px 20px',
            borderRadius: 999,
            border: '2px dashed var(--chalk-line-strong)'
          }}
        >
          🏆 Hall of Fame
        </Link>
      </div>
    </div>
  );
}
