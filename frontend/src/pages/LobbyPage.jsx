import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { emitWithAck, getSocket } from '../services/socketService';
import { useGame } from '../context/GameContext.jsx';
import Logo from '../components/Common/Logo.jsx';
import GameIcon from '../components/Common/GameIcon.jsx';
import CodeInput from '../components/Common/CodeInput.jsx';
import { GAMES_LIST } from '../services/gameLogic';

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
    if (!pseudo.trim() || code.trim().length !== 6) {
      setError('Pseudo et code à 6 chiffres requis');
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
    <div className="page" style={{ gap: 24, maxWidth: 440, margin: '0 auto' }}>
      <div style={{ marginBottom: 4 }}>
        <span className="section-label" style={{ color: 'var(--cobalt)' }}>PROTOCOLE · 9 ÉPREUVES · 30 MIN</span>
        <div style={{ margin: '10px 0 4px' }}>
          <Logo size={44} />
        </div>
        <p style={{ color: 'var(--ink-66)', fontSize: '0.9rem', margin: 0 }}>Le quiz qui fait travailler les neurones</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8, width: '100%' }}>
        {GAMES_LIST.map((g) => (
          <GameIcon key={g.id} gameId={g.id} size={64} />
        ))}
        <div style={{
          aspectRatio: '0.86',
          borderRadius: 5,
          border: '1px dashed var(--ink-border-field)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: '0.7rem',
          color: 'var(--ink-38)'
        }}>
          9/9
        </div>
      </div>

      <div className="card" style={{ textAlign: 'left', borderLeft: '4px solid var(--coral)', maxWidth: 440 }}>
        <span className="section-label">Joueur</span>
        <h2 style={{ margin: '8px 0 16px', fontFamily: "'Space Grotesk', sans-serif", letterSpacing: '-0.03em' }}>Rejoindre le protocole</h2>
        <input
          type="text"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          placeholder="Ton pseudo"
          value={pseudo}
          onChange={(e) => setPseudo(e.target.value)}
          style={{ marginBottom: 14 }}
        />
        <div style={{ marginBottom: 16 }}>
          <CodeInput value={code} onChange={setCode} onSubmit={handleJoin} />
        </div>
        <button onClick={handleJoin} className="btn-validate">
          Rejoindre le protocole
        </button>
        {error && (
          <p style={{ color: 'var(--coral)', margin: '12px 0 0', fontSize: '0.85rem' }}>{error}</p>
        )}
      </div>

      <button
        onClick={handleCreateParty}
        className="btn-secondary"
        style={{
          width: '100%',
          maxWidth: 440,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          textAlign: 'left'
        }}
      >
        <span>Animateur — créer une partie</span>
        <span>→</span>
      </button>

      <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginTop: 4 }}>
        <Link to="/regles" className="mono" style={{ color: 'var(--ink-66)', fontSize: '0.75rem', letterSpacing: '0.06em', textDecoration: 'underline' }}>
          Fiches des 9 jeux
        </Link>
        <Link to="/hall-of-fame" className="mono" style={{ color: 'var(--ink-66)', fontSize: '0.75rem', letterSpacing: '0.06em', textDecoration: 'underline' }}>
          Records
        </Link>
      </div>
    </div>
  );
}
