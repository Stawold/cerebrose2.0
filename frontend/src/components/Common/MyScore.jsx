import { useGame } from '../../context/GameContext.jsx';

// The player's own running score for the current game, in-line on the game
// screen itself (in addition to the persistent header) — called out
// explicitly as missing/too-easy-to-miss during testing.
export default function MyScore() {
  const { state } = useGame();
  const score = state.game.scores?.[state.ui.playerId] ?? 0;
  return (
    <span className="pill-badge amber">
      Score : {score} pt{Math.abs(score) !== 1 ? 's' : ''}
    </span>
  );
}
