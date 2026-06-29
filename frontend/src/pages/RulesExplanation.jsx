import { getRulesText } from '../services/gameLogic';
import { getSocket } from '../services/socketService';

export default function RulesExplanation({ rules, isHost, code }) {
  if (!rules) return null;
  return (
    <div className="page">
      <h1 className="title">Manche {rules.gameIndex + 1} / {rules.totalGames}</h1>
      <h2>{rules.label}</h2>
      <div className="card">
        <p>{getRulesText(rules.game)}</p>
      </div>
      {isHost ? (
        <button onClick={() => getSocket().emit('host:beginGame', { code })}>C'est parti !</button>
      ) : (
        <p>En attente du lancement par l'animateur...</p>
      )}
    </div>
  );
}
