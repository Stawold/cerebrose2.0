import { useEffect, useState } from 'react';

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

  return <div className="timer">{remaining}s</div>;
}
