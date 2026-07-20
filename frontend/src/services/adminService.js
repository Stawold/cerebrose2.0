const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:4000';

async function request(path, options) {
  const res = await fetch(`${SOCKET_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.error || `Erreur ${res.status}`);
  return body;
}

export function fetchGamesConfig() {
  return request('/admin/games');
}

export function fetchGameData(gameId) {
  return request(`/admin/games/${gameId}/data`);
}

export function saveGameData(gameId, content) {
  return request(`/admin/games/${gameId}/data`, {
    method: 'PUT',
    body: JSON.stringify({ content })
  });
}
