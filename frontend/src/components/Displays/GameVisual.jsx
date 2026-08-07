import Timer from '../Common/Timer.jsx';
import AnalogClock from '../Common/AnalogClock.jsx';
import ProgressBadge from '../Common/ProgressBadge.jsx';
import { colorHex, PFC_ICONS } from '../../services/gameLogic';

// Big-screen visualisation shared by the host dashboard and the projection
// screen. `big` is set only from the projection screen, which has a whole
// projector/TV to fill instead of a phone/tablet in the host's hand.
export default function GameVisual({ game, big = false }) {
  if (!game || !game.type) return <p style={{ color: 'var(--text-muted)' }}>En attente...</p>;
  const { type, phase, payload, duration, serverTime, progress } = game;
  const cardWidth = type === 'texte'
    ? (big ? 'min(96vw, 1700px)' : 'min(94vw, 1100px)')
    : (big ? 'min(92vw, 1400px)' : 800);

  return (
    <div className="card" style={{ maxWidth: cardWidth }}>
      <h2>{type}</h2>
      <ProgressBadge progress={progress} />
      {duration > 0 && <Timer duration={duration} serverTime={serverTime} />}
      {renderByType(type, phase, payload, big)}
    </div>
  );
}

function renderByType(type, phase, payload, big) {
  if (!payload) return null;
  switch (type) {
    case 'calculs':
      return <p>{payload.questions?.length} calculs envoyés aux téléphones des joueurs.</p>;
    case 'texte':
      return (
        <div>
          <p style={{ color: 'var(--text-muted)', fontSize: big ? '1.1rem' : '0.85rem', margin: '0 0 12px', textAlign: 'center' }}>
            {payload.title} — repérez les {payload.faultyIndices?.length} fautes et corrigez-les sur votre téléphone
          </p>
          <p style={{
            lineHeight: 1.7,
            textAlign: 'center',
            fontSize: big ? 'clamp(1.6rem, 3vw, 2.6rem)' : 'clamp(1rem, 2vw, 1.5rem)',
            wordSpacing: '0.15em',
            overflowWrap: 'break-word'
          }}>
            {payload.words.join(' ')}
          </p>
        </div>
      );
    case 'memoire':
      if (phase === 'display') return <h1 style={{ fontSize: big ? '5.5rem' : '3rem', letterSpacing: 8 }}>{payload.sequence}</h1>;
      return <p>Saisissez la séquence sur votre téléphone...</p>;
    case 'balance':
      if (phase === 'observe' || phase === 'answer') {
        return <MultiBalanceVisual puzzle={payload.puzzle} phase={phase} big={big} />;
      }
      return null;
    case 'anagramme':
      if (phase === 'play') return <h1 style={{ fontSize: big ? '4.5rem' : '2.5rem', letterSpacing: 6 }}>{payload.scrambled}</h1>;
      if (phase === 'result')
        return (
          <p>
            {payload.winnerPseudo ? `${payload.winnerPseudo} a trouvé : ${payload.answer}` : `Personne n'a trouvé : ${payload.answer}`}
          </p>
        );
      return null;
    default:
      // generic-engine games: heures, pfc, couleurs, grille
      if (phase === 'observe' || phase === 'answer') {
        return <GenericVisual type={type} item={payload.item} big={big} />;
      }
      return null;
  }
}

function GenericVisual({ type, item, big }) {
  if (!item) return null;
  if (type === 'heures') return <HeuresVisual item={item} big={big} />;
  if (type === 'pfc')
    return (
      <div>
        <div style={{ fontSize: big ? '9rem' : '5rem' }}>{PFC_ICONS[item.shape]}</div>
        <span
          className={`pill-badge ${item.instruction === 'win' ? 'mint' : 'coral'}`}
          style={big ? { fontSize: '1.6rem', padding: '12px 28px', fontWeight: 800 } : undefined}
        >
          Consigne : {item.instruction === 'win' ? 'Gagnez' : 'Perdez'}
        </span>
      </div>
    );
  if (type === 'couleurs')
    return <h1 style={{ color: colorHex(item.color), fontSize: big ? '7rem' : '3.5rem' }}>{item.word.toUpperCase()}</h1>;
  if (type === 'grille') {
    const cell = big ? 40 : 28;
    return (
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(9, ${cell}px)`, gap: big ? 6 : 4, justifyContent: 'center' }}>
        {item.grid.flat().map((c, i) => (
          <div key={i} style={{ width: cell, height: cell, borderRadius: 6, background: colorHex(c) }} />
        ))}
      </div>
    );
  }
  return null;
}

function MultiBalanceVisual({ puzzle, phase, big }) {
  if (!puzzle) return null;
  const cols = puzzle.balances.length <= 3 ? puzzle.balances.length : 3;
  return (
    <div>
      {phase === 'answer' && (
        <p className="section-label" style={{ marginBottom: 16, fontSize: big ? '1.5rem' : '1.2rem' }}>
          Choisissez la boule la plus lourde sur votre téléphone
        </p>
      )}
      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${cols}, 1fr)`,
        gap: big ? 28 : 16,
        justifyItems: 'center'
      }}>
        {puzzle.balances.map((b, i) => (
          <SingleBalance key={i} balance={b} big={big} />
        ))}
      </div>
    </div>
  );
}

function SingleBalance({ balance, big }) {
  const { left, right, heavier } = balance;
  const tiltLeft = heavier === 'left';
  const tiltRight = heavier === 'right';
  const lift = big ? 16 : 10;

  return (
    <div style={{
      border: 'var(--chalk-border)',
      borderRadius: 12,
      padding: big ? '22px 28px' : '14px 18px',
      background: 'rgba(255,255,255,0.03)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 8,
      minWidth: big ? 240 : 160
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: big ? 24 : 16 }}>
        <Pan balls={left} down={tiltLeft} up={tiltRight} big={big} lift={lift} />
        <div style={{ fontSize: big ? '2.6rem' : '1.6rem', lineHeight: 1 }}>⚖️</div>
        <Pan balls={right} down={tiltRight} up={tiltLeft} big={big} lift={lift} />
      </div>
    </div>
  );
}

function Pan({ balls, down, up, big, lift }) {
  const ballSize = big ? 32 : 22;
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
      transform: down ? `translateY(${lift}px)` : up ? `translateY(-${lift}px)` : 'none',
      transition: 'transform 0.4s ease'
    }}>
      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', justifyContent: 'center', maxWidth: big ? 120 : 80 }}>
        {balls.map((c, i) => (
          <div
            key={i}
            style={{
              width: ballSize, height: ballSize, borderRadius: '50%',
              background: colorHex(c),
              boxShadow: `0 2px 6px ${colorHex(c)}66`
            }}
          />
        ))}
      </div>
      <div style={{ width: big ? 80 : 56, height: 2, background: 'rgba(240,236,224,0.45)', borderRadius: 1 }} />
    </div>
  );
}

function HeuresVisual({ item, big }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', gap: big ? 80 : 48 }}>
      <ClockFace label="Horloge 1" type={item.type1} value={item.value1} big={big} />
      <ClockFace label="Horloge 2" type={item.type2} value={item.value2} big={big} />
    </div>
  );
}

function ClockFace({ label, type, value, big }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
      {type === 'manual' ? (
        <AnalogClock time={value} size={big ? 220 : 120} />
      ) : (
        <div className="pin-display" style={{ fontSize: big ? '2.8rem' : '1.8rem', padding: big ? '18px 30px' : '12px 20px' }}>{value}</div>
      )}
      <span className="pill-badge" style={big ? { fontSize: '1.1rem', padding: '8px 20px' } : undefined}>{label}</span>
    </div>
  );
}
