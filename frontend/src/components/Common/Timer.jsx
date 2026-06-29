import { useEffect, useState } from 'react';

const RADIUS = 36;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

// Server-driven countdown: duration (s) + serverTime (ms when phase started) keep all clients in sync.
export default function Timer({ duration, serverTime }) {
  const [remaining, setRemaining] = useState(duration);

  useEffect(() => {
    if (!duration) {
      setRemaining(0);
      return;
    }
    const tick = () => {
      const elapsed = (Date.now() - (serverTime || Date.now())) / 1000;
      setRemaining(Math.max(0, Math.ceil(duration - elapsed)));
    };
    tick();
    const interval = setInterval(tick, 250);
    return () => clearInterval(interval);
  }, [duration, serverTime]);

  if (!duration) return null;
  const ratio = Math.max(0, Math.min(1, remaining / duration));
  const offset = CIRCUMFERENCE * (1 - ratio);
  const urgent = remaining <= duration * 0.2;

  return (
    <div className="timer-ring-wrap">
      <svg width="88" height="88" viewBox="0 0 88 88">
        <circle className="timer-ring-bg" cx="44" cy="44" r={RADIUS} />
        <circle
          className={`timer-ring-fg${urgent ? ' urgent' : ''}`}
          cx="44"
          cy="44"
          r={RADIUS}
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={offset}
        />
      </svg>
      <span className="timer-ring-label">{remaining}</span>
    </div>
  );
}
