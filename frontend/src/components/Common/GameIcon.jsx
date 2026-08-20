import { GAME_ICONS, FAMILY_COLOR, GAMES_LIST } from '../../services/gameLogic';

// The periodic-table-style tile used everywhere a game needs identifying:
// a two-digit number, a two-letter symbol, and a family color. Works from
// 19px (config grid) to 170px (round announcement) off the same markup.
export default function GameIcon({ gameId, size = 44, selected = true, showName = false, badge }) {
  const icon = GAME_ICONS[gameId];
  if (!icon) return null;
  const label = GAMES_LIST.find((g) => g.id === gameId)?.label || '';
  const family = FAMILY_COLOR[icon.family];
  const onAmber = icon.family === 'perception';

  return (
    <div
      style={{
        position: 'relative',
        width: size,
        aspectRatio: '0.86',
        borderRadius: 5,
        background: selected ? family : '#fff',
        border: selected ? 'none' : '1px solid rgba(16,24,32,.18)',
        color: selected ? (onAmber ? '#101820' : '#fff') : 'rgba(16,24,32,.6)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: Math.max(6, size * 0.11),
        boxSizing: 'border-box',
        flexShrink: 0
      }}
    >
      <span className="mono" style={{ fontWeight: 500, fontSize: Math.max(8, size * 0.09), letterSpacing: '.08em' }}>
        {icon.number}
      </span>
      <div>
        <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: size * 0.4, lineHeight: 1, letterSpacing: '-0.03em' }}>
          {icon.symbol}
        </div>
        {showName && (
          <div style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontWeight: 500, fontSize: Math.max(8, size * 0.075), opacity: 0.85, marginTop: 4 }}>
            {label}
          </div>
        )}
      </div>
      {badge != null && (
        <span
          className="mono"
          style={{
            position: 'absolute',
            top: -6,
            right: -6,
            background: '#101820',
            color: '#fff',
            fontSize: 10,
            fontWeight: 600,
            borderRadius: 3,
            padding: '1px 5px'
          }}
        >
          {badge}
        </span>
      )}
    </div>
  );
}
