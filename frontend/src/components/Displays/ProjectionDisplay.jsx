import { useEffect, useState } from 'react';
import { emitWithAck } from '../../services/socketService';
import { useGame } from '../../context/GameContext.jsx';
import { getRulesText, GAMES_LIST } from '../../services/gameLogic';
import GameVisual from './GameVisual.jsx';
import Podium from '../Common/Podium.jsx';
import RankReveal from './RankReveal.jsx';
import Timer from '../Common/Timer.jsx';
import GameIcon from '../Common/GameIcon.jsx';
import Logo from '../Common/Logo.jsx';

// Small row of ticks marking progress through the selected rounds — the
// room always knows how far along the session is.
function RoundTicks({ total, index }) {
  if (!total) return null;
  return (
    <div style={{ display: 'flex', gap: 5 }}>
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          style={{
            width: 14,
            height: 5,
            borderRadius: 2,
            background: i <= index ? 'var(--cobalt)' : 'rgba(245,246,242,.25)'
          }}
        />
      ))}
    </div>
  );
}

function Column({ children, wide }) {
  return <div className={`projection-column${wide ? ' wide' : ''}`}>{children}</div>;
}

function Stage({ children }) {
  return (
    <div className="projection-stage">
      {children}
      <span className="projection-wordmark">Cérébr&apos;Ose<span className="dot">.</span></span>
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
        <Logo size={42} />
        <p style={{ color: 'var(--ink-66)' }}>Ouvrez cette page avec ?code=XXXXXX dans l'URL.</p>
        <input
          type="text"
          placeholder="Code de la partie"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          style={{ maxWidth: 240 }}
        />
        <button onClick={async () => setJoined(!!(await emitWithAck('spectator:join', { code })).ok)}>
          Rejoindre
        </button>
      </div>
    );
  }

  const currentGameId = state.game.type || state.rules?.game;
  const gameIndex = state.rules?.gameIndex;
  const totalGames = state.rules?.totalGames ?? state.party.selectedGames?.length;
  const gameLabel = GAMES_LIST.find((g) => g.id === currentGameId)?.label || currentGameId;

  const codeBlock = (
    <div>
      <span className="mono" style={{ fontSize: '0.68rem', letterSpacing: '0.14em', color: 'var(--paper-55)' }}>ACCÈS</span>
      <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, letterSpacing: '0.05em', fontSize: '2.2rem', color: 'var(--amber)' }}>
        {code}
      </div>
    </div>
  );

  // --- Podium final (C6) ---
  if (state.gameOver) {
    return (
      <div className="projection-screen">
        <Column>
          <Logo size={30} onInk />
          <div style={{ marginTop: 'auto' }}>{codeBlock}</div>
        </Column>
        <Stage>
          <span className="section-label" style={{ color: 'var(--cobalt)' }}>RAPPORT CONSOLIDÉ</span>
          <h1 className="title">Podium final</h1>
          <Podium leaderboard={state.gameOver.leaderboard} />
        </Stage>
      </div>
    );
  }

  // --- Reveal sequence (C5) ---
  if (state.reveal.stage) {
    const { stage, game, ranking, hallOfFame, leaderboard } = state.reveal;
    const revealLabel = GAMES_LIST.find((g) => g.id === game)?.label || game;

    let stageContent;
    if (stage === 'pending') {
      stageContent = (
        <>
          <span className="pulse-dot" />
          <p style={{ color: 'var(--ink-66)' }}>En attente de l'animateur...</p>
        </>
      );
    } else if (stage === 'results') {
      const entries = ranking.map((r) => ({ rank: r.rank, pseudo: r.pseudo, value: r.rawScore }));
      stageContent = (
        <>
          <h1 className="title" style={{ marginBottom: 6 }}>Résultats : {revealLabel}</h1>
          <RankReveal entries={entries} limit={10} valueLabel="pts" resetKey={`results-${game}`} big />
        </>
      );
    } else if (stage === 'hallOfFame') {
      const entries = hallOfFame.map((e, i) => ({ rank: i + 1, pseudo: e.pseudo, value: e.score }));
      stageContent = (
        <>
          <h1 className="title" style={{ marginBottom: 6 }}>Hall of Fame : {revealLabel}</h1>
          <RankReveal entries={entries} limit={5} valueLabel="pts" resetKey={`hof-${game}`} big />
        </>
      );
    } else {
      const entries = leaderboard.map((p, i) => ({ rank: i + 1, pseudo: p.pseudo, value: p.total }));
      stageContent = (
        <>
          <h1 className="title" style={{ marginBottom: 6 }}>Classement général</h1>
          <RankReveal entries={entries} limit={10} valueLabel="pts" resetKey={`leaderboard-${game}`} big />
        </>
      );
    }

    return (
      <div className="projection-screen">
        <Column>
          <GameIcon gameId={game} size={64} showName />
          <span className="section-label" style={{ color: 'var(--paper-55)' }}>MANCHE {(gameIndex ?? 0) + 1} SUR {totalGames} · TERMINÉE</span>
          <div style={{ marginTop: 'auto' }}>{codeBlock}</div>
        </Column>
        <Stage>{stageContent}</Stage>
      </div>
    );
  }

  // --- Round announcement (C2) ---
  if (state.rules && !state.game.phase) {
    return (
      <div className="projection-screen">
        <Column wide>
          <GameIcon gameId={state.rules.game} size={170} showName />
          <RoundTicks total={totalGames} index={gameIndex} />
          <div style={{ marginTop: 'auto' }}>{codeBlock}</div>
        </Column>
        <Stage>
          <span className="section-label" style={{ color: 'var(--cobalt)' }}>ÉPREUVE {(gameIndex ?? 0) + 1} SUR {totalGames}</span>
          <h1 className="title" style={{ fontSize: 'clamp(2.6rem, 4.6vw, 4.8rem)' }}>{state.rules.label}</h1>
          <p style={{ maxWidth: 900, fontSize: '1.3rem', lineHeight: 1.6, color: 'var(--ink-70)' }}>
            {getRulesText(state.rules.game)}
          </p>
        </Stage>
      </div>
    );
  }

  // --- Game in progress (C3 / C4) ---
  return (
    <div className="projection-screen">
      <Column>
        <GameIcon gameId={currentGameId} size={44} showName />
        <span className="section-label" style={{ color: 'var(--paper-55)' }}>{gameLabel}</span>
        {state.game.duration > 0 && (
          <Timer duration={state.game.duration} serverTime={state.game.serverTime} width={34} height={150} stacked={false} onInk />
        )}
        <div style={{ marginTop: 'auto' }}>{codeBlock}</div>
      </Column>
      <Stage>
        <GameVisual game={state.game} big />
      </Stage>
    </div>
  );
}
