// Renders an analog clock face for a "HH:MM" time string.
export default function AnalogClock({ time, size = 120 }) {
  const [h, m] = String(time).split(':').map(Number);
  const minuteAngle = (m / 60) * 360;
  const hourAngle = ((h % 12) / 12) * 360 + (m / 60) * 30;
  const r = size / 2;

  function handPoint(angle, length) {
    const rad = ((angle - 90) * Math.PI) / 180;
    return [r + Math.cos(rad) * length, r + Math.sin(rad) * length];
  }

  const [hx, hy] = handPoint(hourAngle, r * 0.45);
  const [mx, my] = handPoint(minuteAngle, r * 0.68);

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={r} cy={r} r={r - 4} fill="#ffffff" stroke="var(--ink)" strokeWidth="2" />
      {Array.from({ length: 12 }).map((_, i) => {
        const [tx, ty] = handPoint(i * 30, r * 0.85);
        return <circle key={i} cx={tx} cy={ty} r={2} fill="var(--ink-38)" />;
      })}
      <line x1={r} y1={r} x2={hx} y2={hy} stroke="var(--ink-50)" strokeWidth="5" strokeLinecap="round" />
      <line x1={r} y1={r} x2={mx} y2={my} stroke="var(--cobalt)" strokeWidth="3" strokeLinecap="round" />
      <circle cx={r} cy={r} r={4} fill="var(--cobalt-dark)" />
    </svg>
  );
}
