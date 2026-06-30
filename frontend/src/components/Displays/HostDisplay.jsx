import GameVisual from './GameVisual.jsx';
import ScoreBoard from '../Common/ScoreBoard.jsx';

export default function HostDisplay({ game, players }) {
  return (
    <div className="page" style={{ gap: 20 }}>
      <div>
        <span className="section-label">Manche en cours</span>
        <h1 className="title" style={{ color: 'var(--violet)', marginTop: 6, fontSize: '1.8rem' }}>
          {game.type}
        </h1>
      </div>
      <GameVisual game={game} />
      <ScoreBoard players={players} scores={game.scores} />
    </div>
  );
}
