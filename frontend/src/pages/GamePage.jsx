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
        <h1 className="title">Résultats de la manche</h1>
        {state.roundResults.leaderboard.map((p, i) => (
          <p key={p.id}>{i + 1}. {p.pseudo} — {p.total} pts</p>
        ))}
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
      <p>En attente...</p>
    </div>
  );
}
