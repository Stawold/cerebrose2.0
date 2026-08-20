import { useEffect, useState } from 'react';

// Chrono-éprouvette: a graduated vial that empties as time runs out.
// Server-driven countdown: duration (s) + serverTime (ms when phase
// started) keep all clients in sync.
// `stacked` puts the number below the vial (mobile) instead of beside it
// (host dashboard / projection column).
export default function Timer({ duration, serverTime, width = 30, height = 130, stacked = true, onInk = false }) {
  const [remaining, setRemaining] = useState(duration);

  useEffect(() => {
    if (!duration) {
      setRemaining(0);
      return;
    }
    const tick = () => {
      // Clamp to 0: if the client's clock is even slightly behind the
      // server's (or this fires a beat before serverTime, which happens),
      // a negative elapsed would inflate the very first tick past
      // `duration` — the "starts one number too high" bug.
      const elapsed = Math.max(0, (Date.now() - (serverTime || Date.now())) / 1000);
      setRemaining(Math.max(0, Math.ceil(duration - elapsed)));
    };
    tick();
    const interval = setInterval(tick, 250);
    return () => clearInterval(interval);
  }, [duration, serverTime]);

  if (!duration) return null;
  const ratio = Math.max(0, Math.min(1, remaining / duration));
  const urgent = remaining <= duration * 0.2;
  const label = remaining >= 60 ? `${Math.floor(remaining / 60)}:${String(remaining % 60).padStart(2, '0')}` : String(remaining);

  return (
    <div className={`vial-wrap${stacked ? ' stacked' : ''}`}>
      <div className="vial" style={{ width, height, borderRadius: width / 2 }}>
        <div className={`vial-fill${urgent ? ' urgent' : ''}`} style={{ height: `${ratio * 100}%` }} />
      </div>
      <span className={`vial-label${onInk ? ' on-ink' : ''}`} style={{ fontSize: Math.max(18, height * 0.16) }}>{label}</span>
    </div>
  );
}
