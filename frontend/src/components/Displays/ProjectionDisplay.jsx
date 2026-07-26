import { useEffect, useState } from 'react';
import { emitWithAck } from '../../services/socketService';
import { useGame } from '../../context/GameContext.jsx';
import { getRulesText, GAMES_LIST } from '../../services/gameLogic';
import GameVisual from './GameVisual.jsx';
import Podium from '../Common/Podium.jsx';
import RankReveal from './RankReveal.jsx';

function ProjectionTitle() {
  return (
    <div style={{ position: 'fixed', top: 16, left: '50%', transform: 'translateX(-50%)', zIndex: 400 }}>
      <span className="logo" style={{ fontSize: '2rem' }}>Cérébr'Ose</span>
    </div>
  );
}

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

  let content;

  if (state.gameOver) {
    content = (
      <div className="page">
        <h1 className="logo" style={{ fontSize: '2.6rem' }}>Podium final 🏆</h1>
        <Podium leaderboard={state.gameOver.leaderboard} />
      </div>
    );
  } else if (state.reveal.stage) {
    const { stage, game, ranking, hallOfFame, leaderboard } = state.reveal;
    const gameLabel = GAMES_LIST.find((g) => g.id === game)?.label || game;

    if (stage === 'pending') {
      content = (
        <div className="page">
          <h1 className="title">Manche terminée : {gameLabel}</h1>
          <span className="pulse-dot" />
          <p style={{ color: 'var(--text-muted)' }}>En attente de l'animateur...</p>
        </div>
      );
    } else if (stage === 'results') {
      const entries = ranking.map((r) => ({ rank: r.rank, pseudo: r.pseudo, value: r.rawScore }));
      content = (
        <div className="page">
          <h1 className="title" style={{ marginBottom: 20 }}>Résultats : {gameLabel}</h1>
          <RankReveal entries={entries} limit={10} valueLabel="pts" resetKey={`results-${game}`} />
        </div>
      );
    } else if (stage === 'hallOfFame') {
      const entries = hallOfFame.map((e, i) => ({ rank: i + 1, pseudo: e.pseudo, value: e.score }));
      content = (
        <div className="page">
          <h1 className="title" style={{ marginBottom: 20 }}>🏆 Hall of Fame : {gameLabel}</h1>
          <RankReveal entries={entries} limit={5} valueLabel="pts" resetKey={`hof-${game}`} />
        </div>
      );
    } else if (stage === 'leaderboard') {
      const entries = leaderboard.map((p, i) => ({ rank: i + 1, pseudo: p.pseudo, value: p.total }));
      content = (
        <div className="page">
          <h1 className="title" style={{ marginBottom: 20 }}>Classement général</h1>
          <RankReveal entries={entries} limit={10} valueLabel="pts" resetKey={`leaderboard-${game}`} />
        </div>
      );
    }
  } else if (state.rules && !state.game.phase) {
    content = (
      <div className="page">
        <span className="pill-badge">Manche {state.rules.gameIndex + 1} / {state.rules.totalGames}</span>
        <h1 className="title">{state.rules.label}</h1>
        <p>{getRulesText(state.rules.game)}</p>
      </div>
    );
  } else {
    content = (
      <div className="page">
        <GameVisual game={state.game} />
      </div>
    );
  }

  return (
    <>
      <ProjectionTitle />
      {content}
    </>
  );
}
