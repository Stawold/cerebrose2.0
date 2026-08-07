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

export default function GamePage() {
  const { state } = useGame();
  const location = useLocation();
  const navigate = useNavigate();
  const code = location.state?.code || state.party.code;
  const isHost = state.ui.isHost;
  const [reviewRound, setReviewRound] = useState(null); // index into roundHistory, or null for the final podium

  function backToMenu() {
    localStorage.removeItem('cerebrose_host');
    localStorage.removeItem('cerebrose_player');
    navigate('/');
  }

  if (state.gameOver) {
    const roundHistory = state.gameOver.roundHistory || [];
    const round = reviewRound !== null ? roundHistory[reviewRound] : null;
    const roundLeaderboard = round
      ? round.ranking.map((r) => ({ id: r.id, pseudo: r.pseudo, total: r.points }))
      : null;

    return (
      <div className="page" style={{ gap: 20 }}>
        <div>
          <h1 className="logo" style={{ fontSize: '3rem' }}>
            {round ? `Résultats : ${round.game}` : 'Podium final'}
          </h1>
          {!round && <p className="section-label">Bravo à tous les participants !</p>}
        </div>

        <Podium leaderboard={round ? roundLeaderboard : state.gameOver.leaderboard} />

        {roundHistory.length > 0 && (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
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
                style={{ fontSize: '0.85rem' }}
              >
                {i + 1}. {r.game}
              </button>
            ))}
          </div>
        )}

        <button onClick={backToMenu} style={{ marginTop: 8 }}>← Retour au menu</button>
      </div>
    );
  }

  if (state.reveal.stage) {
    const { stage, game, ranking, leaderboard } = state.reveal;
    const myId = state.ui.playerId;

    if (isHost) {
      return (
        <div className="page" style={{ gap: 20 }}>
          <h1 className="title" style={{ color: 'var(--mint)' }}>Manche terminée : {game}</h1>
          <p className="section-label">Regardez l'écran de projection avec vos joueurs</p>
          {stage === 'pending' && (
            <button onClick={() => hostAction('host:revealRoundResults', { code })}>
              Afficher les résultats →
            </button>
          )}
          {stage === 'results' && (
            <button onClick={() => hostAction('host:revealHallOfFame', { code })}>
              Afficher le Hall of Fame →
            </button>
          )}
          {stage === 'hallOfFame' && (
            <button onClick={() => hostAction('host:revealLeaderboard', { code })}>
              Afficher le classement général →
            </button>
          )}
          {stage === 'leaderboard' && (
            <button onClick={() => hostAction('host:nextRound', { code })}>
              Manche suivante →
            </button>
          )}
        </div>
      );
    }

    if (stage === 'pending') {
      return (
        <div className="page">
          <span className="pulse-dot" />
          <p style={{ color: 'var(--text-muted)', marginTop: 12 }}>Manche terminée, en attente de l'animateur...</p>
        </div>
      );
    }

    // 'results' and 'hallOfFame' show the same player screen — per design,
    // players see nothing new while the host reveals the Hall of Fame.
    if (stage === 'results' || stage === 'hallOfFame') {
      const mine = (ranking || []).find((r) => r.id === myId);
      return (
        <div className="page" style={{ gap: 16 }}>
          <h1 className="title" style={{ color: 'var(--mint)' }}>Votre score</h1>
          {mine ? (
            <>
              <p style={{ fontSize: '3rem', fontWeight: 800, margin: 0 }}>{mine.rawScore} pts</p>
              <p className="section-label">
                Vous êtes {mine.rank}{mine.rank === 1 ? 'er' : 'e'} sur {ranking.length}
              </p>
              <span className="pill-badge amber">+{mine.points} points de classement</span>
            </>
          ) : (
            <p style={{ color: 'var(--text-muted)' }}>Score indisponible</p>
          )}
        </div>
      );
    }

    if (stage === 'leaderboard') {
      const rank = (leaderboard || []).findIndex((p) => p.id === myId) + 1;
      const mine = (leaderboard || []).find((p) => p.id === myId);
      return (
        <div className="page" style={{ gap: 16 }}>
          <h1 className="title" style={{ color: 'var(--violet)' }}>Classement général</h1>
          {mine ? (
            <>
              <p style={{ fontSize: '3rem', fontWeight: 800, margin: 0 }}>{mine.total} pts</p>
              <p className="section-label">Vous êtes {rank}{rank === 1 ? 'er' : 'e'} sur {leaderboard.length}</p>
            </>
          ) : (
            <p style={{ color: 'var(--text-muted)' }}>Classement indisponible</p>
          )}
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
    if (PlayerComponent) return <PlayerComponent game={state.game} />;
  }

  return (
    <div className="page">
      <span className="pulse-dot" />
      <p style={{ color: 'var(--text-muted)', marginTop: 12 }}>En attente...</p>
    </div>
  );
}
