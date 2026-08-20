import { useGame } from '../../context/GameContext.jsx';
import GameVisual from './GameVisual.jsx';
import ScoreBoard from '../Common/ScoreBoard.jsx';
import GameIcon from '../Common/GameIcon.jsx';

export default function HostDisplay({ game, players }) {
  const { state } = useGame();
  const hostAnswer = state.hostAnswer;

  return (
    <div className="page" style={{ gap: 20, maxWidth: 480, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <GameIcon gameId={game.type} size={40} />
        <div style={{ textAlign: 'left' }}>
          <span className="section-label">Manche en cours</span>
          <h1 className="title" style={{ fontSize: '1.4rem', marginTop: 2 }}>{game.type}</h1>
        </div>
      </div>
      <GameVisual game={game} />
      <ScoreBoard players={players} scores={game.scores} />

      {hostAnswer?.text && (
        <div className="card" style={{ maxWidth: 440, width: '100%', borderColor: 'var(--amber)', borderWidth: 2 }}>
          <span className="section-label" style={{ color: 'var(--amber)' }}>
            Réponse (visible uniquement par vous)
          </span>
          <p style={{ margin: '8px 0 0', whiteSpace: 'pre-line', fontWeight: 600 }}>{hostAnswer.text}</p>
        </div>
      )}
    </div>
  );
}
