import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext.jsx';
import { hostAction } from '../services/socketService';
import RulesExplanation from './RulesExplanation.jsx';
import HostDisplay from '../components/Displays/HostDisplay.jsx';
import GameCalculs from '../components/Games/GameCalculs.jsx';
import GameTexte from '../components/Games/GameTexte.jsx';
import GameMemoire from '../components/Games/GameMemoire.jsx';
import GameBalance from '../components/Games/GameBalance.jsx';
import GameHeures from '../components/Games/GameHeures.jsx';
import GamePFC from '../components/Games/GamePFC.jsx';
import GameCouleurs from '../components/Games/GameCouleurs.jsx';
import GameGrille from '../components/Games/GameGrille.jsx';
import GameAnagramme from '../components/Games/GameAnagramme.jsx';
import Podium from '../components/Common/Podium.jsx';
import GameIcon from '../components/Common/GameIcon.jsx';
import PlayerGameHeader from '../components/Common/PlayerGameHeader.jsx';

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

const REVEAL_STEPS = [
  { key: 'results', label: 'Résultats de manche' },
  { key: 'hallOfFame', label: 'Hall of fame du jeu' },
  { key: 'leaderboard', label: 'Classement général' },
  { key: 'next', label: 'Manche suivante' }
];

export default function GamePage() {
  const { state, dispatch } = useGame();
  const location = useLocation();
  const navigate = useNavigate();
  const code = location.state?.code || state.party.code;
  const isHost = state.ui.isHost;
  const [reviewRound, setReviewRound] = useState(null); // index into roundHistory, or null for the final podium

  function backToMenu() {
    localStorage.removeItem('cerebrose_host');
    localStorage.removeItem('cerebrose_player');
    // Without this, state.gameOver from the just-finished party stays set
    // forever (only a RESET clears it) — starting a new party without a
    // full page reload would land everyone back on this same final podium.
    dispatch({ type: 'RESET' });
    navigate('/');
  }

  if (state.gameOver) {
    const roundHistory = state.gameOver.roundHistory || [];
    const round = reviewRound !== null ? roundHistory[reviewRound] : null;
    const roundLeaderboard = round
      ? round.ranking.map((r) => ({ id: r.id, pseudo: r.pseudo, total: r.points }))
      : null;

    return (
      <div className="page" style={{ gap: 20, maxWidth: 560, margin: '0 auto' }}>
        <div>
          <span className="section-label">Rapport consolidé</span>
          <h1 className="title" style={{ fontSize: '2.2rem', marginTop: 8 }}>
            {round ? `Résultats : ${round.game}` : 'Podium final'}
          </h1>
        </div>

        <Podium leaderboard={round ? roundLeaderboard : state.gameOver.leaderboard} />

        {roundHistory.length > 0 && (
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'center' }}>
            <button
              className={reviewRound === null ? '' : 'btn-secondary'}
              onClick={() => setReviewRound(null)}
            >
              Classement final
            </button>
            {roundHistory.map((r, i) => (
              <button
                key={i}
                className={reviewRound === i ? '' : 'btn-secondary'}
                onClick={() => setReviewRound(i)}
                style={{ fontSize: '0.8rem' }}
              >
                {i + 1}. {r.game}
              </button>
            ))}
          </div>
        )}

        <button className="btn-secondary" onClick={backToMenu} style={{ marginTop: 8 }}>← Retour au menu</button>
      </div>
    );
  }

  if (state.reveal.stage) {
    const { stage, game, ranking, leaderboard } = state.reveal;
    const myId = state.ui.playerId;

    if (isHost) {
      const stepIndex = { pending: -1, results: 0, hallOfFame: 1, leaderboard: 2 }[stage] ?? -1;
      const actions = {
        pending: ['host:revealRoundResults', 'Afficher les résultats'],
        results: ['host:revealHallOfFame', 'Afficher le Hall of Fame'],
        hallOfFame: ['host:revealLeaderboard', 'Afficher le classement général'],
        leaderboard: ['host:nextRound', 'Manche suivante']
      };
      const [event, label] = actions[stage] || [];

      return (
        <div className="page" style={{ gap: 20, maxWidth: 420, margin: '0 auto' }}>
          <GameIcon gameId={game} size={64} showName />
          <p className="section-label">Regardez l'écran de projection avec vos joueurs</p>

          <div className="step-list">
            {REVEAL_STEPS.map((step, i) => {
              const status = i <= stepIndex ? 'done' : i === stepIndex + 1 ? 'current' : '';
              return (
                <div key={step.key} className={`step-row ${status}`}>
                  <span className="step-dot" />
                  <span>{step.label}</span>
                </div>
              );
            })}
          </div>

          {event && (
            <button onClick={() => hostAction(event, { code })} className="btn-validate">
              {label} →
            </button>
          )}
        </div>
      );
    }

    if (stage === 'pending') {
      return (
        <div className="page">
          <span className="pulse-dot" />
          <p className="mono" style={{ color: 'var(--ink-66)', marginTop: 12, fontSize: '0.75rem', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            Manche terminée, en attente de l'animateur
          </p>
        </div>
      );
    }

    // 'results' and 'hallOfFame' show the same player screen — per design,
    // players see nothing new while the host reveals the Hall of Fame.
    if (stage === 'results' || stage === 'hallOfFame') {
      const mine = (ranking || []).find((r) => r.id === myId);
      return (
        <div className="page" style={{ gap: 14 }}>
          <span className="section-label">Relevé personnel</span>
          {mine ? (
            <>
              <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, letterSpacing: '-0.04em', fontSize: '5rem', margin: 0, lineHeight: 1 }}>
                {mine.rawScore}
              </p>
              <p style={{ color: 'var(--ink-66)', margin: 0, fontSize: '0.95rem' }}>
                Vous êtes {mine.rank}{mine.rank === 1 ? 'er' : 'e'} sur {ranking.length}
              </p>
              <span className="pill-badge amber">+{mine.points} points de classement</span>
            </>
          ) : (
            <p style={{ color: 'var(--ink-66)' }}>Score indisponible</p>
          )}
        </div>
      );
    }

    if (stage === 'leaderboard') {
      const rank = (leaderboard || []).findIndex((p) => p.id === myId) + 1;
      const mine = (leaderboard || []).find((p) => p.id === myId);
      const maxTotal = Math.max(1, ...((leaderboard || []).map((p) => p.total)));
      return (
        <div className="page" style={{ gap: 14, maxWidth: 440, margin: '0 auto' }}>
          <span className="section-label">Classement général</span>
          {mine ? (
            <div style={{ width: '100%', background: 'var(--amber)', borderRadius: 6, padding: '18px 22px', display: 'flex', flexDirection: 'column', gap: 4 }}>
              <span className="mono" style={{ fontSize: '0.68rem', letterSpacing: '0.14em', color: 'rgba(16,24,32,.6)' }}>VOTRE POSITION</span>
              <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: '3.2rem', letterSpacing: '-0.04em', lineHeight: 1 }}>{rank}</span>
              <span className="mono" style={{ fontSize: '0.8rem', color: 'rgba(16,24,32,.7)' }}>{mine.total} pts</span>
            </div>
          ) : (
            <p style={{ color: 'var(--ink-66)' }}>Classement indisponible</p>
          )}
          <div className="rank-list">
            {(leaderboard || []).slice(0, 5).map((p, i) => (
              <div key={p.id} className={`rank-row${p.id === myId ? ' mine' : ''}`}>
                <span className="rank-number">{i + 1}</span>
                <span className="name" style={{ flex: 1, textAlign: 'left' }}>{p.pseudo}</span>
                <span className="score">{p.total} pts</span>
                <div className="score-bar" style={{ width: `${Math.max(4, (p.total / maxTotal) * 100)}%` }} />
              </div>
            ))}
          </div>
        </div>
      );
    }
  }

  if (state.rules && !state.game.phase) {
    return <RulesExplanation rules={state.rules} isHost={isHost} code={code} />;
  }

  if (state.game.type && state.game.phase) {
    if (isHost) return <HostDisplay game={state.game} players={state.party.players} />;
    const PlayerComponent = PLAYER_COMPONENTS[state.game.type];
    if (PlayerComponent) {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: '100vh' }}>
          <PlayerGameHeader gameId={state.game.type} />
          <PlayerComponent game={state.game} />
        </div>
      );
    }
  }

  return (
    <div className="page">
      <span className="pulse-dot" />
      <p className="mono" style={{ color: 'var(--ink-66)', marginTop: 12, fontSize: '0.75rem', letterSpacing: '0.06em', textTransform: 'uppercase' }}>En attente...</p>
    </div>
  );
}
