import Timer from '../Common/Timer.jsx';
import AnalogClock from '../Common/AnalogClock.jsx';
import { colorHex, PFC_ICONS } from '../../services/gameLogic';

// Big-screen visualisation shared by the host dashboard and the projection screen.
export default function GameVisual({ game }) {
  if (!game || !game.type) return <p style={{ color: 'var(--text-muted)' }}>En attente...</p>;
  const { type, phase, payload, duration, serverTime } = game;

  return (
    <div className="card" style={{ maxWidth: 800 }}>
      <h2>{type}</h2>
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
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: '0 0 12px' }}>
            {payload.title} — repérez les {payload.faultyIndices?.length} fautes et corrigez-les sur votre téléphone
          </p>
          <p style={{ lineHeight: 2.2, textAlign: 'left', fontSize: '1.1rem' }}>
            {payload.words.map((w, i) => (
              <span key={i} style={{ marginRight: 6 }}>{w}</span>
            ))}
          </p>
        </div>
      );
    case 'memoire':
      if (phase === 'display') return <h1 style={{ fontSize: '3rem', letterSpacing: 8 }}>{payload.sequence}</h1>;
      return <p>Saisissez la séquence sur votre téléphone...</p>;
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
      // generic-engine games: balance, heures, pfc, couleurs, grille
      if (phase === 'observe' || phase === 'answer') {
        return <GenericVisual type={type} item={payload.item} />;
      }
      return null;
  }
}

function GenericVisual({ type, item }) {
  if (!item) return null;
  if (type === 'balance') return <BalanceVisual item={item} />;
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

function BalanceVisual({ item }) {
  const left = colorHex(item.leftColor);
  const right = colorHex(item.rightColor);
  const leftHeavier = item.heavierColor === item.leftColor;
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 40, height: 140 }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
        <div
          style={{
            width: 80, height: 80, borderRadius: 16, background: left,
            transform: leftHeavier ? 'translateY(20px)' : 'translateY(0)',
            transition: 'transform 0.3s'
          }}
        />
        <span className="pill-badge">{item.leftColor}</span>
      </div>
      <div style={{ fontSize: '2rem' }}>⚖️</div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
        <div
          style={{
            width: 80, height: 80, borderRadius: 16, background: right,
            transform: !leftHeavier ? 'translateY(20px)' : 'translateY(0)',
            transition: 'transform 0.3s'
          }}
        />
        <span className="pill-badge">{item.rightColor}</span>
      </div>
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
