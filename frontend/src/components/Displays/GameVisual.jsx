import Timer from '../Common/Timer.jsx';
import AnalogClock from '../Common/AnalogClock.jsx';
import ProgressBadge from '../Common/ProgressBadge.jsx';
import { colorHex, PFC_ICONS } from '../../services/gameLogic';

// Big-screen visualisation shared by the host dashboard and the projection
// screen. `big` is set only from the projection screen, which already
// shows the game identity + chrono in its left column — so in big mode
// this renders just the stage content, no card/heading/timer of its own.
export default function GameVisual({ game, big = false }) {
  if (!game || !game.type) return <p style={{ color: 'var(--ink-66)' }}>En attente...</p>;
  const { type, phase, payload, duration, serverTime, progress } = game;

  if (big) {
    return (
      <>
        <ProgressBadge progress={progress} />
        {renderByType(type, phase, payload, big)}
      </>
    );
  }

  return (
    <div className="card" style={{ maxWidth: type === 'texte' ? 'min(94vw, 640px)' : 440 }}>
      <span className="section-label">{type}</span>
      <div style={{ margin: '10px 0' }}>
        <ProgressBadge progress={progress} />
      </div>
      {duration > 0 && <Timer duration={duration} serverTime={serverTime} width={44} height={110} />}
      <div style={{ marginTop: 14 }}>{renderByType(type, phase, payload, big)}</div>
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
          <p style={{ color: 'var(--ink-66)', fontSize: big ? '1.1rem' : '0.85rem', margin: '0 0 12px', textAlign: 'center' }}>
            {payload.title} — repérez les {payload.faultyIndices?.length} fautes et corrigez-les sur votre téléphone
          </p>
          <p style={{
            lineHeight: 1.7,
            textAlign: 'center',
            fontFamily: "'IBM Plex Sans', sans-serif",
            fontSize: big ? 'clamp(1.6rem, 3vw, 2.6rem)' : 'clamp(1rem, 2vw, 1.5rem)',
            wordSpacing: '0.15em',
            overflowWrap: 'break-word'
          }}>
            {payload.words.join(' ')}
          </p>
        </div>
      );
    case 'memoire':
      if (phase === 'display') {
        return (
          <div style={{ display: 'flex', gap: big ? 10 : 6, justifyContent: 'center', flexWrap: 'wrap' }}>
            {String(payload.sequence).split('').map((d, i) => (
              <div
                key={i}
                className="pop-in"
                style={{
                  width: big ? 96 : 46,
                  height: big ? 126 : 60,
                  borderRadius: 6,
                  background: 'var(--ink)',
                  color: 'var(--paper)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontWeight: 700,
                  fontSize: big ? '3.6rem' : '1.8rem',
                  letterSpacing: '-0.03em',
                  animationDelay: `${i * 60}ms`
                }}
              >
                {d}
              </div>
            ))}
          </div>
        );
      }
      return <p>Saisissez la séquence sur votre téléphone...</p>;
    case 'balance':
      if (phase === 'observe' || phase === 'answer') {
        return <MultiBalanceVisual puzzle={payload.puzzle} phase={phase} big={big} />;
      }
      return null;
    case 'anagramme':
      if (phase === 'play')
        return (
          <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: big ? '4.5rem' : '2.5rem', letterSpacing: 6 }}>
            {payload.scrambled}
          </h1>
        );
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
      if (phase === 'grayout' && type === 'grille' && payload.answer) {
        return (
          <div>
            <span className="section-label">Bonne réponse</span>
            <div style={{
              width: big ? 100 : 64,
              height: big ? 100 : 64,
              borderRadius: 8,
              background: colorHex(payload.answer),
              margin: '10px auto 0',
              border: '1px solid var(--ink-border)'
            }} />
            <p style={{ marginTop: 10, fontSize: big ? '1.3rem' : '1rem', textTransform: 'capitalize' }}>{payload.answer}</p>
          </div>
        );
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
        <span className={`pill-badge ${item.instruction === 'win' ? 'mint' : 'coral'}`} style={big ? { fontSize: '1.1rem', padding: '10px 18px' } : undefined}>
          Consigne : {item.instruction === 'win' ? 'Gagnez' : 'Perdez'}
        </span>
      </div>
    );
  if (type === 'couleurs')
    return (
      <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, color: colorHex(item.color), fontSize: big ? '11rem' : '3.5rem', letterSpacing: '-0.05em' }}>
        {item.word.toUpperCase()}
      </h1>
    );
  if (type === 'grille') {
    const cell = big ? 40 : 28;
    return (
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(9, ${cell}px)`, gap: big ? 4 : 3, justifyContent: 'center' }}>
        {item.grid.flat().map((c, i) => (
          <div key={i} style={{ width: cell, height: cell, borderRadius: 3, background: colorHex(c) }} />
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
        <p className="section-label" style={{ marginBottom: 16 }}>
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
      border: '1px solid var(--ink-border)',
      borderRadius: 6,
      padding: big ? '22px 28px' : '14px 18px',
      background: 'var(--surface)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 8,
      minWidth: big ? 240 : 160
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: big ? 24 : 16 }}>
        <Pan balls={left} down={tiltLeft} up={tiltRight} big={big} lift={lift} />
        <div style={{ width: big ? 34 : 22, height: 1, background: 'var(--ink-border)' }} />
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
              width: ballSize, height: ballSize, borderRadius: 4,
              background: colorHex(c),
              border: '1px solid rgba(16,24,32,.1)'
            }}
          />
        ))}
      </div>
      <div style={{ width: big ? 80 : 56, height: 1, background: 'var(--ink-border)' }} />
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
        <div className="pin-display" style={{ background: 'var(--ink)', fontSize: big ? '2.4rem' : '1.6rem', padding: big ? '16px 26px' : '10px 18px' }}>{value}</div>
      )}
      <span className="pill-badge" style={big ? { fontSize: '0.9rem' } : undefined}>{label}</span>
    </div>
  );
}
