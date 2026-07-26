import { useGame } from '../../context/GameContext.jsx';
import GameVisual from './GameVisual.jsx';
import ScoreBoard from '../Common/ScoreBoard.jsx';

export default function HostDisplay({ game, players }) {
  const { state } = useGame();
  const hostAnswer = state.hostAnswer;

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

      {hostAnswer?.text && (
        <div className="card" style={{ maxWidth: 440, width: '100%', borderColor: 'var(--amber)' }}>
          <span className="section-label" style={{ color: 'var(--amber)' }}>
            👁️ Réponse (visible uniquement par vous)
          </span>
          <p style={{ margin: '8px 0 0', whiteSpace: 'pre-line', fontWeight: 600 }}>{hostAnswer.text}</p>
        </div>
      )}
    </div>
  );
}
