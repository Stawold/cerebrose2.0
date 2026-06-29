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
    const saved = localStorage.getItem('cerebrose_player');
    if (saved) {
      const { code: savedCode, pseudo: savedPseudo, playerId } = JSON.parse(saved);
      emitWithAck('player:rejoinParty', { code: savedCode, pseudo: savedPseudo, playerId }).then((res) => {
        if (res && res.ok) {
          dispatch({ type: 'SET_PLAYER_IDENTITY', playerId, pseudo: savedPseudo });
          navigate('/rules');
        }
      });
    }
  }, []);

  async function handleCreateParty() {
    const res = await emitWithAck('host:createParty', {});
    if (res && res.ok) {
      dispatch({ type: 'SET_HOST' });
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
