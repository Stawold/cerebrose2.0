import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
    const savedPlayer = localStorage.getItem('cerebrose_player');
    const savedHost = localStorage.getItem('cerebrose_host');
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
          if (phase === 'playing' || phase === 'roundResults') navigate('/game', { state: { code: savedCode } });
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
    <div className="page">
      <h1 className="logo" style={{ fontSize: '3rem' }}>Cérébr'Ose</h1>
      <div className="card">
        <h2>Animateur</h2>
        <p style={{ color: 'var(--text-muted)' }}>Créez une partie et invitez vos joueurs.</p>
        <button onClick={handleCreateParty}>Créer une partie</button>
      </div>
      <div className="card">
        <h2>Joueur</h2>
        <input
          type="text"
          placeholder="Pseudo"
          value={pseudo}
          onChange={(e) => setPseudo(e.target.value)}
        />
        <br /><br />
        <input
          type="text"
          placeholder="Code à 6 chiffres"
          value={code}
          onChange={(e) => setCode(e.target.value)}
        />
        <br /><br />
        <button onClick={handleJoin}>Rejoindre</button>
        {error && <p style={{ color: 'var(--coral)' }}>{error}</p>}
      </div>
    </div>
  );
}
