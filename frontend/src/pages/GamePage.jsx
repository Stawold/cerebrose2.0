import { useLocation } from 'react-router-dom';
import { useGame } from '../context/GameContext.jsx';
import { getSocket } from '../services/socketService';
import RulesExplanation from './RulesExplanation.jsx';
import HostDisplay from '../components/Displays/HostDisplay.jsx';
import GameCalculs from '../components/Games/GameCalculs.jsx';
import GameTexte from '../components/Games/GameTexte.jsx';
import GameMemoire from '../components/Games/GameMemoire.jsx';
import GameGeneric from '../components/Games/GameGeneric.jsx';
import GameAnagramme from '../components/Games/GameAnagramme.jsx';
import Podium from '../components/Common/Podium.jsx';

const PLAYER_COMPONENTS = {
  calculs: GameCalculs,
  texte: GameTexte,
  memoire: GameMemoire,
  anagramme: GameAnagramme,
  balance: GameGeneric,
  heures: GameGeneric,
  pfc: GameGeneric,
  couleurs: GameGeneric,
  grille: GameGeneric
};

export default function GamePage() {
  const { state } = useGame();
  const location = useLocation();
  const code = location.state?.code || state.party.code;
  const isHost = state.ui.isHost;

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
        <h1 className="title">Résultats de la manche</h1>
        <Podium leaderboard={state.roundResults.leaderboard} />
        {isHost && (
          <button onClick={() => getSocket().emit('host:nextRound', { code })}>Manche suivante</button>
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
      <p style={{ color: 'var(--text-muted)' }}>En attente...</p>
    </div>
  );
}
