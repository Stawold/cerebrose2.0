import { useEffect, useRef } from 'react';

// Fires `onExpire` once, right when the server-driven phase timer (duration +
// serverTime) reaches zero. Used so a player who typed an answer but never
// pressed "Valider" still gets it submitted automatically instead of losing it.
// `onExpire` is read from a ref updated on every render, so it always sees the
// latest typed value without needing to reschedule the timeout on every keystroke.
export function useAutoSubmitOnExpiry(duration, serverTime, onExpire) {
  const callbackRef = useRef(onExpire);
  callbackRef.current = onExpire;

  useEffect(() => {
    if (!duration) return undefined;
    const msLeft = duration * 1000 - (Date.now() - (serverTime || Date.now()));
    const timeout = setTimeout(() => callbackRef.current(), Math.max(0, msLeft));
    return () => clearTimeout(timeout);
  }, [duration, serverTime]);
}
