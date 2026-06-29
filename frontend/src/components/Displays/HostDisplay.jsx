import GameVisual from './GameVisual.jsx';
import ScoreBoard from '../Common/ScoreBoard.jsx';

export default function HostDisplay({ game, players }) {
  return (
    <div className="page">
      <h1 className="title">{game.type}</h1>
      <GameVisual game={game} />
      <ScoreBoard players={players} scores={game.scores} />
    </div>
  );
}
