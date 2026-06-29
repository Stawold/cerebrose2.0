import { useEffect, useState } from 'react';
import { emitWithAck } from '../../services/socketService';
import { useGame } from '../../context/GameContext.jsx';
import { getRulesText } from '../../services/gameLogic';
import GameVisual from './GameVisual.jsx';
import Podium from '../Common/Podium.jsx';

export default function ProjectionDisplay() {
  const { state } = useGame();
  const [code, setCode] = useState('');
  const [joined, setJoined] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const c = params.get('code');
    if (c) {
      setCode(c);
      emitWithAck('spectator:join', { code: c }).then((res) => setJoined(!!res?.ok));
    }
  }, []);

  if (!joined) {
    return (
      <div className="page">
        <h1 className="logo" style={{ fontSize: '2.6rem' }}>Écran de projection</h1>
        <p style={{ color: 'var(--text-muted)' }}>Ouvrez cette page avec ?code=XXXXXX dans l'URL.</p>
        <input
          type="text"
          placeholder="Code de la partie"
          value={code}
          onChange={(e) => setCode(e.target.value)}
        />
        <button onClick={async () => setJoined(!!(await emitWithAck('spectator:join', { code })).ok)}>
          Rejoindre
        </button>
      </div>
    );
  }

  if (state.gameOver) {
    return (
      <div className="page">
        <h1 className="logo" style={{ fontSize: '2.6rem' }}>Podium final 🏆</h1>
        <Podium leaderboard={state.gameOver.leaderboard} />
      </div>
    );
  }

  if (state.roundResults) {
    return (
      <div className="page">
        <h1 className="title">Résultats</h1>
        <Podium leaderboard={state.roundResults.leaderboard} />
      </div>
    );
  }

  if (state.rules && !state.game.phase) {
    return (
      <div className="page">
        <span className="pill-badge">Manche {state.rules.gameIndex + 1} / {state.rules.totalGames}</span>
        <h1 className="title">{state.rules.label}</h1>
        <p>{getRulesText(state.rules.game)}</p>
      </div>
    );
  }

  return (
    <div className="page">
      <GameVisual game={state.game} />
    </div>
  );
}
