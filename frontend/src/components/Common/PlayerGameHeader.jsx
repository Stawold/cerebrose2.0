import { useGame } from '../../context/GameContext.jsx';
import GameIcon from './GameIcon.jsx';
import { GAMES_LIST } from '../../services/gameLogic';

// Invariant header on every player game screen: the game's case, its name,
// and the player's running score — always visible, no need to hunt for it.
export default function PlayerGameHeader({ gameId }) {
  const { state } = useGame();
  const label = GAMES_LIST.find((g) => g.id === gameId)?.label || gameId;
  const score = state.game.scores?.[state.ui.playerId] ?? 0;

  return (
    <div
      style={{
        flex: 'none',
        height: 48,
        background: 'var(--ink)',
        color: 'var(--paper-70)',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '0 14px'
      }}
    >
      <GameIcon gameId={gameId} size={30} />
      <span style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontWeight: 600, fontSize: '0.8rem', flex: 1, textAlign: 'left' }}>
        {label}
      </span>
      <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: '1.05rem', color: 'var(--amber)', letterSpacing: '-0.03em' }}>
        {score}
      </span>
    </div>
  );
}
