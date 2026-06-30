import { useLocation } from 'react-router-dom';
import { useGame } from '../context/GameContext.jsx';
import { getSocket } from '../services/socketService';
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
  const code = location.state?.code || state.party.code;
  const isHost = state.ui.isHost;

  if (state.gameOver) {
    return (
      <div className="page" style={{ gap: 20 }}>
        <div>
          <h1 className="logo" style={{ fontSize: '3rem' }}>Podium final</h1>
          <p className="section-label">Bravo à tous les participants !</p>
        </div>
        <Podium leaderboard={state.gameOver.leaderboard} />
      </div>
    );
  }

  if (state.roundResults) {
    return (
      <div className="page" style={{ gap: 20 }}>
        <div>
          <h1 className="title" style={{ color: 'var(--mint)' }}>Résultats de la manche</h1>
          <p className="section-label" style={{ marginTop: 6 }}>
            {state.roundResults.game && `Jeu : ${state.roundResults.game}`}
          </p>
        </div>
        <Podium leaderboard={state.roundResults.leaderboard} />
        {isHost && (
          <button onClick={() => getSocket().emit('host:nextRound', { code })} style={{ marginTop: 8 }}>
            Manche suivante →
          </button>
        )}
      </div>
    );
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
