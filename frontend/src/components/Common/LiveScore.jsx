import { useGame } from '../../context/GameContext.jsx';

// Small persistent badge showing the player's own running score while a
// round is in progress. Host and projection screens already show the full
// scoreboard, so this only renders for players mid-game.
export default function LiveScore() {
  const { state } = useGame();
  if (state.ui.isHost || !state.ui.playerId) return null;
  if (!state.game.type || !state.game.phase) return null;
  const score = state.game.scores?.[state.ui.playerId];
  if (score === undefined) return null;

  return (
    <div style={{ position: 'fixed', top: 10, left: 10, zIndex: 450, pointerEvents: 'none' }}>
      <span className="pill-badge amber" style={{ fontWeight: 800 }}>
        {score} pt{Math.abs(score) !== 1 ? 's' : ''}
      </span>
    </div>
  );
}
