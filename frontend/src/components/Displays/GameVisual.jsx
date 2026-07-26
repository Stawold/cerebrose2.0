import Timer from '../Common/Timer.jsx';
import AnalogClock from '../Common/AnalogClock.jsx';
import ProgressBadge from '../Common/ProgressBadge.jsx';
import { colorHex, PFC_ICONS } from '../../services/gameLogic';

// Big-screen visualisation shared by the host dashboard and the projection screen.
export default function GameVisual({ game }) {
  if (!game || !game.type) return <p style={{ color: 'var(--text-muted)' }}>En attente...</p>;
  const { type, phase, payload, duration, serverTime, progress } = game;

  return (
    <div className="card" style={{ maxWidth: type === 'texte' ? 'min(94vw, 1100px)' : 800 }}>
      <h2>{type}</h2>
      <ProgressBadge progress={progress} />
      {duration > 0 && <Timer duration={duration} serverTime={serverTime} />}
      {renderByType(type, phase, payload)}
    </div>
  );
}

function renderByType(type, phase, payload) {
  if (!payload) return null;
  switch (type) {
    case 'calculs':
      return <p>{payload.questions?.length} calculs envoyés aux téléphones des joueurs.</p>;
    case 'texte':
      return (
        <div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: '0 0 12px', textAlign: 'center' }}>
            {payload.title} — repérez les {payload.faultyIndices?.length} fautes et corrigez-les sur votre téléphone
          </p>
          <p style={{
            lineHeight: 1.7,
            textAlign: 'center',
            fontSize: 'clamp(0.8rem, 1.7vw, 1.15rem)',
            wordSpacing: '0.15em',
            overflowWrap: 'break-word'
          }}>
            {payload.words.join(' ')}
          </p>
        </div>
      );
    case 'memoire':
      if (phase === 'display') return <h1 style={{ fontSize: '3rem', letterSpacing: 8 }}>{payload.sequence}</h1>;
      return <p>Saisissez la séquence sur votre téléphone...</p>;
    case 'balance':
      if (phase === 'observe' || phase === 'answer') {
        return <MultiBalanceVisual puzzle={payload.puzzle} phase={phase} />;
      }
      return null;
    case 'anagramme':
      if (phase === 'play') return <h1 style={{ fontSize: '2.5rem', letterSpacing: 6 }}>{payload.scrambled}</h1>;
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
        return <GenericVisual type={type} item={payload.item} />;
      }
      return null;
  }
}

function GenericVisual({ type, item }) {
  if (!item) return null;
  if (type === 'heures') return <HeuresVisual item={item} />;
  if (type === 'pfc')
    return (
      <div>
        <div style={{ fontSize: '5rem' }}>{PFC_ICONS[item.shape]}</div>
        <span className={`pill-badge ${item.instruction === 'win' ? 'mint' : 'coral'}`}>
          Consigne : {item.instruction === 'win' ? 'Gagnez' : 'Perdez'}
        </span>
      </div>
    );
  if (type === 'couleurs')
    return <h1 style={{ color: colorHex(item.color), fontSize: '3.5rem' }}>{item.word.toUpperCase()}</h1>;
  if (type === 'grille')
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(9, 20px)', gap: 2, justifyContent: 'center' }}>
        {item.grid.flat().map((c, i) => (
          <div key={i} style={{ width: 20, height: 20, borderRadius: 4, background: colorHex(c) }} />
        ))}
      </div>
    );
  return null;
}

function MultiBalanceVisual({ puzzle, phase }) {
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
        gap: 16,
        justifyItems: 'center'
      }}>
        {puzzle.balances.map((b, i) => (
          <SingleBalance key={i} balance={b} />
        ))}
      </div>
    </div>
  );
}

function SingleBalance({ balance }) {
  const { left, right, heavier } = balance;
  const tiltLeft = heavier === 'left';
  const tiltRight = heavier === 'right';

  return (
    <div style={{
      border: 'var(--chalk-border)',
      borderRadius: 12,
      padding: '14px 18px',
      background: 'rgba(255,255,255,0.03)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 8,
      minWidth: 160
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <Pan balls={left} down={tiltLeft} up={tiltRight} />
        <div style={{ fontSize: '1.6rem', lineHeight: 1 }}>⚖️</div>
        <Pan balls={right} down={tiltRight} up={tiltLeft} />
      </div>
    </div>
  );
}

function Pan({ balls, down, up }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
      transform: down ? 'translateY(10px)' : up ? 'translateY(-10px)' : 'none',
      transition: 'transform 0.4s ease'
    }}>
      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', justifyContent: 'center', maxWidth: 80 }}>
        {balls.map((c, i) => (
          <div
            key={i}
            style={{
              width: 22, height: 22, borderRadius: '50%',
              background: colorHex(c),
              boxShadow: `0 2px 6px ${colorHex(c)}66`
            }}
          />
        ))}
      </div>
      <div style={{ width: 56, height: 2, background: 'rgba(240,236,224,0.45)', borderRadius: 1 }} />
    </div>
  );
}

function HeuresVisual({ item }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', gap: 48 }}>
      <ClockFace label="Horloge 1" type={item.type1} value={item.value1} />
      <ClockFace label="Horloge 2" type={item.type2} value={item.value2} />
    </div>
  );
}

function ClockFace({ label, type, value }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
      {type === 'manual' ? (
        <AnalogClock time={value} size={120} />
      ) : (
        <div className="pin-display" style={{ fontSize: '1.8rem', padding: '12px 20px' }}>{value}</div>
      )}
      <span className="pill-badge">{label}</span>
    </div>
  );
}
