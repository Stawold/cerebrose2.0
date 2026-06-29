import { useEffect, useState } from 'react';
import { emitWithAck } from '../../services/socketService';
import { useGame } from '../../context/GameContext.jsx';
import { getRulesText } from '../../services/gameLogic';
import GameVisual from './GameVisual.jsx';

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
        <h1 className="title">Écran de projection</h1>
        <p>Ouvrez cette page avec ?code=XXXXXX dans l'URL.</p>
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
        <h1 className="title">Podium final 🏆</h1>
        {state.gameOver.leaderboard.map((p, i) => (
          <p key={p.id}>{i + 1}. {p.pseudo} — {p.total} pts</p>
        ))}
      </div>
    );
  }

  if (state.roundResults) {
    return (
      <div className="page">
        <h1 className="title">Résultats</h1>
        {state.roundResults.leaderboard.map((p, i) => (
          <p key={p.id}>{i + 1}. {p.pseudo} — {p.total} pts</p>
        ))}
      </div>
    );
  }

  if (state.rules && !state.game.phase) {
    return (
      <div className="page">
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
