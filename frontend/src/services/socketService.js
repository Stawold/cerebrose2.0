import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:4000';

let socket = null;

export function getSocket() {
  if (!socket) {
    socket = io(SOCKET_URL, {
      autoConnect: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: Infinity
    });
  }
  return socket;
}

export function emitWithAck(event, payload) {
  return new Promise((resolve) => {
    getSocket().emit(event, payload, (response) => resolve(response));
  });
}

// Host actions (host:startParty, host:beginGame, host:reveal*, host:nextRound...)
// are authorized server-side against the host's current socket.id. That goes
// stale the moment the host's socket reconnects (screen lock, wifi blip, a
// dev-server reload) — the server then silently rejects the action and the
// host appears frozen on the current screen. If the ack comes back !ok, this
// re-announces the host via 'host:rejoinParty' (which refreshes the socket.id
// the server trusts) and retries the action once before giving up.
export async function hostAction(event, payload) {
  let res = await emitWithAck(event, payload);
  if (!res || !res.ok) {
    await emitWithAck('host:rejoinParty', { code: payload.code });
    res = await emitWithAck(event, payload);
  }
  return res;
}
